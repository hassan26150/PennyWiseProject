const cron = require('node-cron');
const RecommendationCache = require('../models/RecommendationCache');
const ViewHistory = require('../models/ViewHistory');
const Order = require('../models/Order');
const MasterProduct = require('../models/MasterProduct');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

const startRecommendationCron = () => {
  // Run every night at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running nightly recommendation engine cron job...');
    try {
      // 1. Clear old cache
      await RecommendationCache.deleteMany({});

      // 2. Compute "Bought Together" (Type 1)
      await computeBoughtTogether();

      // 3. Compute "Category Affinity" (Type 2)
      await computeCategoryAffinity();

      // 4. Compute "Trending Products" (Type 5)
      await computeTrendingProducts();

      logger.info('Nightly recommendation engine finished.');
    } catch (error) {
      logger.error('Error running recommendation cron:', error);
    }
  });
  logger.info('⏱️ Recommendation engine cron job scheduled (runs at 2:00 AM)');
};

async function computeBoughtTogether() {
  // Mocked simple logic: we look at orders, but since we don't have multiple items per order natively
  // easily queryable without aggregate, we'll just skip complex aggregate for now and insert a stub
  // For production, we'd use an aggregation pipeline to find frequently paired product_ids
}

async function computeCategoryAffinity() {
  // Find top categories per buyer
  const affinity = await ViewHistory.aggregate([
    {
      $lookup: {
        from: 'masterproducts',
        localField: 'product_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: { buyer_id: '$buyer_id', category_id: '$product.category_id' },
        views: { $sum: 1 }
      }
    },
    { $sort: { views: -1 } }
  ]);

  // For each buyer's top category, recommend highly-rated products in that category
  for (const record of affinity) {
    if (record.views < 3) continue; // Only strong affinity
    
    const topProducts = await MasterProduct.find({ category_id: record._id.category_id, is_active: true })
      .sort({ average_rating: -1, total_reviews: -1 })
      .limit(5);

    for (const p of topProducts) {
      await RecommendationCache.updateOne(
        { buyer_id: record._id.buyer_id, product_id: p._id, recommendation_type: 'category_affinity' },
        { score: record.views * 2 },
        { upsert: true }
      );
    }
  }
}

async function computeTrendingProducts() {
  // Trending is based on global views in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trending = await ViewHistory.aggregate([
    { $match: { viewed_at: { $gte: sevenDaysAgo } } },
    { $group: { _id: '$product_id', score: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 20 }
  ]);

  // For all users, or as a global base... since RecommendationCache is per user, 
  // trending might just be fetched at runtime. 
  // However, we can inject trending into active users' caches for speed.
  // We'll skip injecting to every user to save DB space, and instead handle trending at runtime fallback.
}

module.exports = startRecommendationCron;
