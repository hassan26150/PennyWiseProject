const NotificationEvent = require('../models/NotificationEvent');
const PushToken = require('../models/PushToken');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/notifications
 * Get paginated notifications for current user
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const notifications = await NotificationEvent.find({ user_id: userId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NotificationEvent.countDocuments({ user_id: userId });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await NotificationEvent.countDocuments({
      user_id: req.user.id,
      read: false,
    });
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await NotificationEvent.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) throw ApiError.notFound('Notification not found');
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all user's notifications as read
 */
const markAllAsRead = async (req, res, next) => {
  try {
    await NotificationEvent.updateMany(
      { user_id: req.user.id, read: false },
      { read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await NotificationEvent.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id,
    });
    if (!notification) throw ApiError.notFound('Notification not found');
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/notifications/register-token
 * Register an Expo Push Token
 */
const registerPushToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;
    if (!token) throw ApiError.badRequest('Push token is required');

    // Upsert the token
    await PushToken.findOneAndUpdate(
      { token },
      {
        user_id: req.user.id,
        platform: platform || 'android',
        active: true,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Push token registered successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  registerPushToken,
};
