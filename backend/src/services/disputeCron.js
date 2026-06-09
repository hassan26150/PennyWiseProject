const cron = require('node-cron');
const Dispute = require('../models/Dispute');
const DisputeMessage = require('../models/DisputeMessage');
const User = require('../models/User');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

// Run every hour
const initDisputeCron = () => {
  cron.schedule('0 * * * *', async () => {
    logger.info('Running Auto-Escalation Dispute Cron Job');
    try {
      // Find all OPEN disputes
      const openDisputes = await Dispute.find({ status: 'open' });

      const now = new Date();
      const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

      for (const dispute of openDisputes) {
        const timeSinceCreation = now.getTime() - dispute.created_at.getTime();

        if (timeSinceCreation > FORTY_EIGHT_HOURS) {
          // Check if seller has replied
          const sellerReply = await DisputeMessage.findOne({
            dispute_id: dispute._id,
            sender_id: dispute.seller_id,
          });

          if (!sellerReply) {
            // Escalate!
            dispute.status = 'under_review';
            await dispute.save();

            // Notify Admin (We notify all admins)
            const admins = await User.find({ role: 'admin' });
            for (const admin of admins) {
              await notificationService.createNotification({
                user_id: admin._id,
                type: 'SYSTEM_ALERT',
                title: 'Dispute Auto-Escalated',
                message: `Dispute ${dispute._id} escalated due to seller unresponsiveness.`,
                metadata: { dispute_id: dispute._id }
              });
            }

            // Notify Buyer
            await notificationService.createNotification({
              user_id: dispute.buyer_id,
              type: 'ORDER_UPDATE',
              title: 'Dispute Escalated',
              message: `Your dispute for order ${dispute.order_id} has been escalated to PennyWise support.`,
              metadata: { dispute_id: dispute._id, order_id: dispute.order_id }
            });

            logger.info(`Dispute ${dispute._id} escalated to under_review.`);
          }
        }
      }
    } catch (error) {
      logger.error('Error in Dispute Cron:', error);
    }
  });
};

module.exports = initDisputeCron;
