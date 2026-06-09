const User = require('../models/User');
const Seller = require('../models/Seller');
const MasterProduct = require('../models/MasterProduct');
const Order = require('../models/Order');
const Dispute = require('../models/Dispute');
const SearchHistory = require('../models/SearchHistory');
const GeneratedReport = require('../models/GeneratedReport');
const reportGenerator = require('../utils/reportGenerator');

const getOverview = async (req, res, next) => {
  try {
    const total_users = await User.countDocuments({ role: 'buyer' });
    const active_sellers = await Seller.countDocuments({ verified: true });
    const pending_sellers = await Seller.countDocuments({ verified: false });
    const total_products = await MasterProduct.countDocuments();
    const total_orders = await Order.countDocuments();
    
    const revenueStats = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);
    const total_revenue = revenueStats.length > 0 ? revenueStats[0].total : 0;
    
    const total_disputes = await Dispute.countDocuments();
    const active_disputes = await Dispute.countDocuments({ status: { $in: ['open', 'under_review'] } });

    res.json({
      success: true,
      data: {
        total_users,
        active_sellers,
        pending_sellers,
        total_products,
        total_orders,
        total_revenue,
        total_disputes,
        active_disputes
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserActivity = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    const activity = await User.aggregate([
      { $match: { created_at: { $gte: dateLimit } } },
      {
        $group: {
          _id: { 
            date: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Format output
    const formattedMap = new Map();
    activity.forEach(a => {
      const date = a._id.date;
      if (!formattedMap.has(date)) {
        formattedMap.set(date, { date, buyer_count: 0, seller_count: 0 });
      }
      const current = formattedMap.get(date);
      if (a._id.role === 'buyer') current.buyer_count = a.count;
      if (a._id.role === 'seller') current.seller_count = a.count;
    });

    res.json({ success: true, data: Array.from(formattedMap.values()) });
  } catch (error) {
    next(error);
  }
};

const getPlatformGrowth = async (req, res, next) => {
  try {
    // Quick simplified version of growth
    const new_users = await User.countDocuments();
    const new_sellers = await Seller.countDocuments();
    const new_products = await MasterProduct.countDocuments();
    const new_orders = await Order.countDocuments();

    res.json({
      success: true,
      data: { new_users, new_sellers, new_products, new_orders }
    });
  } catch (error) {
    next(error);
  }
};

const getProductDiscovery = async (req, res, next) => {
  try {
    const popularSearches = await SearchHistory.aggregate([
      { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        most_searched: popularSearches.map(s => ({ query: s._id, count: s.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAIAnalytics = async (req, res, next) => {
  try {
    const aiQueries = await SearchHistory.countDocuments();
    
    // Get actual popular queries from search history
    const popularQueriesAgg = await SearchHistory.aggregate([
      { $group: { _id: { $toLower: '$query' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const popular_queries = popularQueriesAgg.map(q => ({ query: q._id, count: q.count }));

    res.json({
      success: true,
      data: {
        chatbot_usage: aiQueries,
        popular_queries,
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDisputeAnalytics = async (req, res, next) => {
  try {
    const opened = await Dispute.countDocuments({ status: { $in: ['open', 'under_review'] } });
    const resolved = await Dispute.countDocuments({ status: 'resolved' });

    // Compute avg resolution time from actual data
    const resolutionTimes = await Dispute.aggregate([
      { $match: { status: 'resolved' } },
      { $project: { resolution_days: { $divide: [{ $subtract: ['$updated_at', '$created_at'] }, 86400000] } } },
      { $group: { _id: null, avg: { $avg: '$resolution_days' } } }
    ]);
    const avg_resolution_days = resolutionTimes.length > 0 ? resolutionTimes[0].avg.toFixed(1) : '0';

    // Top dispute reasons from actual data
    const topReasons = await Dispute.aggregate([
      { $group: { _id: '$issue_type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        disputes_opened: opened,
        disputes_resolved: resolved,
        avg_resolution_time: `${avg_resolution_days} days`,
        top_reasons: topReasons.map(r => ({ reason: r._id, count: r.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};

const generateReport = async (req, res, next) => {
  try {
    const { type, format } = req.query; // format: csv, pdf. type: platform_activity, seller_performance, order_statistics
    
    if (!type || !format) {
      return res.status(400).json({ success: false, message: 'Type and format required' });
    }

    // Mock data fetching based on type
    let dataToExport = [];
    let reportTitle = '';

    if (type === 'platform_activity') {
      reportTitle = 'Platform Activity Report';
      const users = await User.countDocuments();
      const orders = await Order.countDocuments();
      dataToExport = [{ metric: 'Total Users', value: users }, { metric: 'Total Orders', value: orders }];
    } else if (type === 'order_statistics') {
      reportTitle = 'Order Statistics Report';
      const stats = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
      dataToExport = stats.map(s => ({ Status: s._id, Count: s.count }));
    } else {
      dataToExport = [{ Data: 'Sample Data', Value: 100 }];
      reportTitle = 'General Report';
    }

    let fileUrl = '';
    if (format === 'csv') {
      fileUrl = await reportGenerator.generateAndUploadCSV(dataToExport, type);
    } else if (format === 'pdf') {
      fileUrl = await reportGenerator.generateAndUploadPDF(dataToExport, type, reportTitle);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid format' });
    }

    const report = await GeneratedReport.create({
      report_type: type,
      format,
      file_url: fileUrl,
      generated_by: req.user.id
    });

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getUserActivity,
  getPlatformGrowth,
  getProductDiscovery,
  getAIAnalytics,
  getDisputeAnalytics,
  generateReport
};
