const Favorite = require('../models/Favorite');
const MasterProduct = require('../models/MasterProduct');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/favorites
 * Get current user's favorites with basic product details
 */
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user_id: req.user.id })
      .populate('product_id', 'name slug images thumbnail category_id')
      .sort({ created_at: -1 });

    res.json({ success: true, data: favorites });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/favorites/:productId
 * Add product to favorites
 */
const addToFavorites = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Validate product exists
    const productExists = await MasterProduct.exists({ _id: productId });
    if (!productExists) {
      throw ApiError.notFound('Product not found');
    }

    // Upsert
    const item = await Favorite.findOneAndUpdate(
      { user_id: req.user.id, product_id: productId },
      { user_id: req.user.id, product_id: productId },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Added to favorites', data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/favorites/:productId
 * Remove product from favorites
 */
const removeFromFavorites = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    await Favorite.findOneAndDelete({
      user_id: req.user.id,
      product_id: productId,
    });

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/favorites/:productId/status
 * Check if a product is favorited
 */
const isFavorited = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const exists = await Favorite.exists({
      user_id: req.user.id,
      product_id: productId,
    });
    
    res.json({ success: true, data: { isFavorited: !!exists } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorited,
};
