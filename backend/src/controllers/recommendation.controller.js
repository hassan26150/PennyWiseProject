const RecommendationCache = require('../models/RecommendationCache');
const MasterProduct = require('../models/MasterProduct');

/**
 * GET /api/recommendations
 * Get personalized recommendations for the user based on cache
 */
const getRecommendations = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    
    // Fetch cached recommendations for this user, sorted by highest score
    const recommendations = await RecommendationCache.find({ buyer_id: buyerId })
      .sort({ score: -1 })
      .limit(20)
      .populate({
        path: 'product_id',
        select: 'name slug images thumbnail category_id lowest_market_price average_rating total_reviews',
      });

    // If cache is empty (new user/cold start), fetch global trending products
    if (recommendations.length === 0) {
      // Find top rated or trending from DB (fallback)
      const trending = await MasterProduct.find({ is_active: true })
        .sort({ total_views: -1, average_rating: -1 })
        .limit(10)
        .select('name slug images thumbnail category_id lowest_market_price average_rating total_reviews');
        
      return res.json({ 
        success: true, 
        data: trending.map(p => ({
          product_id: p,
          recommendation_type: 'trending',
          score: 1
        }))
      });
    }

    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
};
