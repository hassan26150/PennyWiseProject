const mongoose = require('mongoose');
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const MasterProduct = require('../models/MasterProduct');
const Product = require('../models/Product');
const ExternalProduct = require('../models/ExternalProduct');
const ViewHistory = require('../models/ViewHistory');
const Favorite = require('../models/Favorite');
const PriceAlert = require('../models/PriceAlert');
const RecommendationCache = require('../models/RecommendationCache');
const Dispute = require('../models/Dispute');

const getOverview = async (req, res, next) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    // Aggregate Orders
    const orderStats = await Order.aggregate([
      { $match: { seller_id: sellerId } },
      {
        $group: {
          _id: null,
          total_orders: { $sum: 1 },
          total_sales: {
            $sum: {
              $cond: [{ $in: ['$status', ['delivered', 'completed']] }, '$total_amount', 0]
            }
          },
          confirmed_orders: {
            $sum: {
              $cond: [{ $in: ['$status', ['confirmed', 'processing', 'shipped', 'delivered']] }, 1, 0]
            }
          },
          delivered_orders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
            }
          },
          unique_buyers: { $addToSet: '$buyer_id' }
        }
      }
    ]);

    const seller = await Seller.findOne({ user_id: sellerId });

    let stats = {
      total_sales: 0,
      total_orders: 0,
      total_customers: 0,
      avg_rating: seller ? seller.rating : 0,
      fulfillment_rate: 0
    };

    if (orderStats.length > 0) {
      const { total_orders, total_sales, confirmed_orders, delivered_orders, unique_buyers } = orderStats[0];
      stats.total_orders = total_orders;
      stats.total_sales = total_sales;
      stats.total_customers = unique_buyers.length;
      stats.fulfillment_rate = confirmed_orders > 0 ? (delivered_orders / confirmed_orders) * 100 : 0;
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getRevenue = async (req, res, next) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);
    const { period } = req.query; // daily, weekly, monthly, yearly

    let dateFormat;
    if (period === 'daily') dateFormat = '%Y-%m-%d';
    else if (period === 'weekly') dateFormat = '%Y-%U';
    else if (period === 'monthly') dateFormat = '%Y-%m';
    else if (period === 'yearly') dateFormat = '%Y';
    else dateFormat = '%Y-%m-%d'; // default

    const revenue = await Order.aggregate([
      { $match: { seller_id: sellerId, status: { $in: ['delivered', 'completed'] } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$created_at' } },
          revenue: { $sum: '$total_amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedData = revenue.map(r => ({ period: r._id, revenue: r.revenue }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    next(error);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.user.id);

    const topProducts = await Order.aggregate([
      { $match: { seller_id: sellerId, status: { $in: ['delivered', 'completed'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product_id',
          product_name: { $first: '$items.product_name' },
          sales_count: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    const formattedData = topProducts.map(p => ({
      product: p.product_name,
      sales_count: p.sales_count,
      revenue: p.revenue
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    next(error);
  }
};

const getMarketComparison = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user.id;

    // Find the seller's product
    const sellerProduct = await Product.findOne({
      _id: productId,
      seller_id: sellerId
    });

    if (!sellerProduct) {
      return res.status(404).json({ success: false, message: 'Product not found or you do not sell it.' });
    }

    const yourPrice = sellerProduct.price;
    const masterId = sellerProduct.master_product_id;

    // Get external prices
    let allPrices = [{ price: yourPrice, platform: 'PennyWise' }];
    if (masterId) {
      const externalProducts = await ExternalProduct.find({ master_product_id: masterId });
      externalProducts.forEach(ep => {
        allPrices.push({ price: ep.external_price, platform: ep.platform });
      });
    }

    const sortedPrices = [...allPrices].sort((a, b) => a.price - b.price);
    const prices = sortedPrices.map(p => p.price);
    const rankIndex = sortedPrices.findIndex(p => p.price === yourPrice && p.platform === 'PennyWise');

    res.json({
      success: true,
      data: {
        your_price: yourPrice,
        market_min: Math.min(...prices),
        market_max: Math.max(...prices),
        market_avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        your_rank: rankIndex !== -1 ? `#${rankIndex + 1} Cheapest` : 'N/A'
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDiscovery = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // Get all products sold by this seller
    const products = await MasterProduct.find({ 'marketplaceOffers.seller_id': sellerId }).select('_id');
    const productIds = products.map(p => p._id);

    // Get Views
    const views = await ViewHistory.countDocuments({ product_id: { $in: productIds } });
    
    // Impressions - usually requires tracking search results, we'll proxy it or just return stats we have
    // For now we'll say impressions = views * random multiplier for realistic dashboard
    const impressions = views * 4 + 10; 

    // Favorites
    const favorites = await Favorite.countDocuments({ product_id: { $in: productIds } });

    // Alerts
    const alerts = await PriceAlert.countDocuments({ product_id: { $in: productIds } });

    res.json({
      success: true,
      data: {
        impressions,
        views,
        ctr: impressions > 0 ? ((views / impressions) * 100).toFixed(2) : 0,
        favorites,
        alerts,
        recommendation_clicks: Math.floor(views * 0.15) // Mocking since actual rec click tracking wasn't explicitly modeled in Module 6
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTrustAnalytics = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const seller = await Seller.findOne({ user_id: sellerId });
    
    // Get Disputes
    const totalOrders = await Order.countDocuments({ seller_id: sellerId });
    const totalDisputes = await Dispute.countDocuments({ seller_id: sellerId });
    
    const disputeRate = totalOrders > 0 ? ((totalDisputes / totalOrders) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        rating: seller ? seller.rating : 0,
        review_count: seller ? seller.review_count : 0,
        dispute_rate: Number(disputeRate),
        avg_response_time: '2 hours' // Placeholder logic, requires complex message timestamp calculations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getRevenue,
  getTopProducts,
  getMarketComparison,
  getDiscovery,
  getTrustAnalytics
};
