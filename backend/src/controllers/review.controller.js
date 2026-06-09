const Review = require('../models/Review');
const Order = require('../models/Order');
const reviewService = require('../services/review.service');
const { z } = require('zod');

const submitReviewSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

const submitReview = async (req, res, next) => {
  try {
    const { orderId, productId, rating, comment } = submitReviewSchema.parse(req.body);
    const buyerId = req.user.id;

    // Validate Order
    const order = await Order.findOne({ _id: orderId, buyer_id: buyerId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or does not belong to you.' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can only review delivered orders.' });
    }

    // Verify order contains the product
    const hasProduct = order.items.some(item => item.product_id.toString() === productId);
    if (!hasProduct) {
      return res.status(400).json({ success: false, message: 'This product was not in the specified order.' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ order_id: orderId, product_id: productId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product for this order.' });
    }

    const review = await Review.create({
      buyer_id: buyerId,
      product_id: productId,
      seller_id: order.seller_id,
      order_id: orderId,
      rating,
      comment: comment || ''
    });

    // Trigger service layer to update averages and notify seller
    await reviewService.handleNewReview(review);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid input data', errors: error.errors });
    }
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product_id: id })
      .populate('buyer_id', 'name profile_image')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product_id: id });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSellerReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ seller_id: id })
      .populate('buyer_id', 'name profile_image')
      .populate('product_id', 'name thumbnail')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ seller_id: id });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getProductReviews,
  getSellerReviews
};
