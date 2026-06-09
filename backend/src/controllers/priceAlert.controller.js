const PriceAlert = require('../models/PriceAlert');
const MasterProduct = require('../models/MasterProduct');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/price-alerts
 * Get active alerts for user
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({ buyer_id: req.user.id, active: true })
      .populate('product_id', 'name thumbnail slug category_id')
      .sort({ created_at: -1 });

    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/price-alerts
 * Create or update a price alert
 */
const createAlert = async (req, res, next) => {
  try {
    const { productId, targetPrice } = req.body;

    if (!productId || !targetPrice) {
      throw ApiError.badRequest('productId and targetPrice are required');
    }

    const productExists = await MasterProduct.exists({ _id: productId });
    if (!productExists) {
      throw ApiError.notFound('Product not found');
    }

    const alert = await PriceAlert.findOneAndUpdate(
      { buyer_id: req.user.id, product_id: productId },
      { 
        buyer_id: req.user.id, 
        product_id: productId, 
        target_price: targetPrice,
        active: true 
      },
      { upsert: true, new: true }
    ).populate('product_id', 'name thumbnail slug category_id');

    res.status(201).json({ success: true, message: 'Price alert set successfully', data: alert });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/price-alerts/:id
 * Delete (or deactivate) an alert
 */
const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // We can hard delete or deactivate
    const alert = await PriceAlert.findOneAndDelete({
      _id: id,
      buyer_id: req.user.id,
    });

    if (!alert) {
      throw ApiError.notFound('Alert not found');
    }

    res.json({ success: true, message: 'Price alert removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  createAlert,
  deleteAlert,
};
