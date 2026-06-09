const Review = require('../models/Review');
const Seller = require('../models/Seller');
const MasterProduct = require('../models/MasterProduct');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

class ReviewService {
  /**
   * Recalculates the average rating for a seller based on all their reviews
   * and updates the Seller document.
   * Also recalculates the average rating for the product.
   */
  async updateAverages(sellerId, productId) {
    try {
      // 1. Update Seller Average
      const sellerReviews = await Review.aggregate([
        { $match: { seller_id: sellerId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);

      const sellerAvg = sellerReviews.length > 0 ? sellerReviews[0].avgRating : 0;
      const sellerCount = sellerReviews.length > 0 ? sellerReviews[0].count : 0;

      await Seller.updateOne(
        { user_id: sellerId },
        { 
          rating: Number(sellerAvg.toFixed(1)), 
          review_count: sellerCount 
        }
      );

      // 2. Update Product Average (Optional but good for Product Catalog)
      const productReviews = await Review.aggregate([
        { $match: { product_id: productId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);

      const prodAvg = productReviews.length > 0 ? productReviews[0].avgRating : 0;
      const prodCount = productReviews.length > 0 ? productReviews[0].count : 0;

      await MasterProduct.findByIdAndUpdate(productId, {
        average_rating: Number(prodAvg.toFixed(1)),
        review_count: prodCount
      });

      logger.info(`Updated averages for seller ${sellerId} and product ${productId}`);
    } catch (error) {
      logger.error('Failed to update averages after review', error);
    }
  }

  async handleNewReview(review) {
    // 1. Update averages asynchronously
    this.updateAverages(review.seller_id, review.product_id);

    // 2. Notify Seller
    await notificationService.createNotification({
      user_id: review.seller_id,
      type: 'NEW_REVIEW',
      title: 'New Product Review',
      message: `You received a ${review.rating}-star review for your product.`,
      metadata: { review_id: review._id, product_id: review.product_id }
    });
  }
}

module.exports = new ReviewService();
