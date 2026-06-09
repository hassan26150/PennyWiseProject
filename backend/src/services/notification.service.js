const { Expo } = require('expo-server-sdk');
const NotificationEvent = require('../models/NotificationEvent');
const PushToken = require('../models/PushToken');
const logger = require('../utils/logger');

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const expo = new Expo();

/**
 * Service to handle all notifications across the platform.
 * Supports creating DB records, emitting Socket.IO events, and sending Expo Push Notifications.
 */
class NotificationService {
  /**
   * Internal helper to send push notifications using Expo SDK
   */
  async _sendPushNotifications(tokens, title, body, data) {
    if (!tokens || tokens.length === 0) return;

    let messages = [];
    for (let pushToken of tokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
      });
    }

    // The Expo push service accepts batches of notifications
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The codes are listed in the Expo documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
        // (e.g. deactivate invalid tokens)
        for (let i = 0; i < ticketChunk.length; i++) {
          const ticket = ticketChunk[i];
          if (ticket.status === 'error' && ticket.details && ticket.details.error === 'DeviceNotRegistered') {
            const tokenToDeactivate = chunk[i].to;
            await PushToken.updateMany({ token: tokenToDeactivate }, { active: false });
            logger.info(`Deactivated unregistered push token: ${tokenToDeactivate}`);
          }
        }
      } catch (error) {
        logger.error('Error sending push notifications', error);
      }
    }
  }

  /**
   * Internal helper to emit Socket.IO events
   */
  _emitSocketEvent(userIds, eventPayload) {
    const app = require('../app'); // Avoid circular dependencies
    const io = app.get('io');
    if (io) {
      if (Array.isArray(userIds)) {
        userIds.forEach(userId => io.to(userId.toString()).emit('new_notification', eventPayload));
      } else {
        io.to(userIds.toString()).emit('new_notification', eventPayload);
      }
    }
  }

  /**
   * Send a notification to a single user
   */
  async send(userId, type, title, body, data = {}) {
    try {
      // 1. Check for duplicates in the last 5 minutes to prevent spam
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const duplicate = await NotificationEvent.findOne({
        user_id: userId,
        type,
        title,
        created_at: { $gt: fiveMinsAgo }
      });

      if (duplicate) {
        logger.info(`Skipped duplicate notification: ${type} for user ${userId}`);
        return null;
      }

      // 2. Create DB Record
      const notification = await NotificationEvent.create({
        user_id: userId,
        type,
        title,
        body,
        data,
      });

      // 3. Emit via Socket.IO
      this._emitSocketEvent(userId, notification);

      // 4. Send Push Notification
      const tokens = await PushToken.find({ user_id: userId, active: true });
      const tokenStrings = tokens.map(t => t.token);
      
      if (tokenStrings.length > 0) {
        await this._sendPushNotifications(tokenStrings, title, body, data);
      }

      return notification;
    } catch (error) {
      logger.error('Error in NotificationService.send:', error);
      throw error;
    }
  }

  /**
   * Batch send notifications (useful for price drops reaching many watchers)
   */
  async sendBatch(userIds, type, title, body, data = {}) {
    try {
      if (!userIds || userIds.length === 0) return;

      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

      // We'll create events one by one or in bulk, but we need to check duplicates first.
      // For simplicity in a batch operation, we'll construct the array and bulk insert
      // Note: This could be optimized further for very large batches (100k+)
      const notificationsToCreate = [];
      const usersToNotify = [];

      for (const userId of userIds) {
        // Quick duplicate check (could be optimized with an $in query before loop)
        const duplicate = await NotificationEvent.findOne({
          user_id: userId,
          type,
          title,
          created_at: { $gt: fiveMinsAgo }
        });

        if (!duplicate) {
          notificationsToCreate.push({
            user_id: userId,
            type,
            title,
            body,
            data
          });
          usersToNotify.push(userId);
        }
      }

      if (notificationsToCreate.length === 0) return;

      // Bulk create
      const createdNotifications = await NotificationEvent.insertMany(notificationsToCreate);

      // Find all tokens for these users
      const tokens = await PushToken.find({ 
        user_id: { $in: usersToNotify },
        active: true 
      });

      const tokenStrings = tokens.map(t => t.token);

      // Bulk emit via Socket.IO
      // (Emitting just the raw payload, not all specific notification IDs for simplicity)
      this._emitSocketEvent(usersToNotify, { type, title, body, data });

      // Send batch push
      if (tokenStrings.length > 0) {
        await this._sendPushNotifications(tokenStrings, title, body, data);
      }

      return createdNotifications;
    } catch (error) {
      logger.error('Error in NotificationService.sendBatch:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
