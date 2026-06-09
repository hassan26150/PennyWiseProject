const ExternalPurchaseClick = require('../models/ExternalPurchaseClick');
const SearchHistory = require('../models/SearchHistory');
const ViewHistory = require('../models/ViewHistory');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/analytics/external-click
 * Record an external purchase click (Analytics)
 */
const trackExternalClick = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { product_id, platform, external_url } = req.body;

    if (!product_id || !platform || !external_url) {
      return next(ApiError.badRequest('product_id, platform, and external_url are required'));
    }

    const clickEvent = new ExternalPurchaseClick({
      buyer_id: buyerId,
      product_id,
      platform,
      external_url,
    });

    await clickEvent.save();

    res.status(201).json({ success: true, message: 'Click tracked successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/analytics/view
 * Record a product view
 */
const trackView = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return next(ApiError.badRequest('productId is required'));

    await ViewHistory.create({
      buyer_id: req.user.id,
      product_id: productId,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/analytics/search
 * Record a search query
 */
const trackSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return next(ApiError.badRequest('query is required'));

    await SearchHistory.create({
      buyer_id: req.user.id,
      query,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackExternalClick,
  trackView,
  trackSearch,
};
