const cron = require('node-cron');
const ProductPriceHistory = require('../models/ProductPriceHistory');
const ExternalPriceHistory = require('../models/ExternalPriceHistory');
const Favorite = require('../models/Favorite');
const PriceAlert = require('../models/PriceAlert');
const MasterProduct = require('../models/MasterProduct');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

const PRICE_DROP_THRESHOLD_PERCENT = 5;

const startPriceDropCron = () => {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Running price drop detection cron job...');
    try {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

      // 1. Check Native Products (ProductPriceHistory)
      const nativeDrops = await ProductPriceHistory.find({
        created_at: { $gte: sixHoursAgo }
      }).populate({
        path: 'product_id',
        select: 'name master_product_id',
      });

      for (const drop of nativeDrops) {
        if (!drop.product_id || !drop.product_id.master_product_id) continue;
        
        const oldPrice = drop.old_price;
        const newPrice = drop.new_price;
        
        if (newPrice < oldPrice) {
          const percentage = ((oldPrice - newPrice) / oldPrice) * 100;
          if (percentage >= PRICE_DROP_THRESHOLD_PERCENT) {
            await notifyWatchers(
              drop.product_id.master_product_id, 
              drop.product_id.name, 
              newPrice, 
              'PennyWise Seller'
            );
          }
        }
      }

      // 2. Check External Products (ExternalPriceHistory)
      const externalDrops = await ExternalPriceHistory.find({
        recorded_at: { $gte: sixHoursAgo }
      }).populate({
        path: 'master_product_id',
        select: 'name'
      });

      // Group external drops by external_product_id to find latest drop
      const externalDropsMap = new Map();
      for (const drop of externalDrops) {
        if (!drop.master_product_id) continue;
        
        // Find the previous price before this drop
        const previousRecord = await ExternalPriceHistory.findOne({
          external_product_id: drop.external_product_id,
          recorded_at: { $lt: drop.recorded_at }
        }).sort({ recorded_at: -1 });

        if (previousRecord) {
          const oldPrice = previousRecord.price;
          const newPrice = drop.price;

          if (newPrice < oldPrice) {
            const percentage = ((oldPrice - newPrice) / oldPrice) * 100;
            if (percentage >= PRICE_DROP_THRESHOLD_PERCENT) {
              await notifyWatchers(
                drop.master_product_id._id,
                drop.master_product_id.name,
                newPrice,
                drop.platform
              );
            }
          }
        }
      }

    } catch (error) {
      logger.error('Error running price drop cron:', error);
    }
  });
  
  logger.info('⏱️ Price drop cron job scheduled (runs every 6 hours)');
};

async function notifyWatchers(masterProductId, productName, newPrice, platformName) {
  // 1. Standard Favorites Drop (>= 5%)
  const favorites = await Favorite.find({ product_id: masterProductId });
  if (favorites.length > 0) {
    const userIds = favorites.map(f => f.user_id);
    const body = `Price drop alert! ${productName} is now PKR ${newPrice.toLocaleString()} on ${platformName}.`;
    await notificationService.sendBatch(
      userIds,
      'price_drop',
      'Price Drop Alert! 📉',
      body,
      { product_id: masterProductId, screen: 'ProductDetail' }
    );
  }

  // 2. Price Alerts (Target price met)
  const activeAlerts = await PriceAlert.find({ 
    product_id: masterProductId, 
    active: true,
    target_price: { $gte: newPrice }
  });

  if (activeAlerts.length > 0) {
    const alertUserIds = activeAlerts.map(a => a.buyer_id);
    await notificationService.sendBatch(
      alertUserIds,
      'price_alert_met',
      'Target Price Reached! 🎯',
      `${productName} hit your target price at PKR ${newPrice.toLocaleString()} on ${platformName}!`,
      { product_id: masterProductId, screen: 'ProductDetail' }
    );

    // Deactivate them
    await PriceAlert.updateMany(
      { _id: { $in: activeAlerts.map(a => a._id) } },
      { $set: { active: false } }
    );
  }
}

module.exports = startPriceDropCron;
