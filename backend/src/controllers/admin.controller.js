const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Dispute = require('../models/Dispute');
const AdminAuditLog = require('../models/AdminAuditLog');
const ProductReport = require('../models/ProductReport');
const notificationService = require('../services/notification.service');

// Helper to create audit logs
const createAuditLog = async (admin_id, action, target_type, target_id, metadata = {}) => {
  await AdminAuditLog.create({ admin_id, action, target_type, target_id, metadata });
};

// ==========================================
// USER MANAGEMENT
// ==========================================
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ created_at: -1 });

    const count = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // In a real scenario we'd also fetch their orders, reviews, etc.
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!['active', 'suspended', 'deactivated'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await createAuditLog(req.user.id, `User status updated to ${status}`, 'User', user._id, { reason });
    
    if (status === 'suspended') {
      await notificationService.send(user._id, 'account_alert', 'Account Suspended', `Your account has been suspended. Reason: ${reason}`);
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SELLER MANAGEMENT
// ==========================================
const getPendingSellers = async (req, res, next) => {
  try {
    const sellers = await Seller.find({ verified: false }).populate('user_id', 'name email').sort({ created_at: -1 });
    res.json({ success: true, data: sellers });
  } catch (error) {
    next(error);
  }
};

const approveSeller = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const seller = await Seller.findByIdAndUpdate(req.params.id, { verified: true }, { new: true });
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    await createAuditLog(req.user.id, 'Seller Approved', 'Seller', seller._id, { reason });
    await notificationService.send(seller.user_id, 'account_alert', 'Seller Application Approved', 'Congratulations! You can now start selling on PennyWise.');

    res.json({ success: true, data: seller });
  } catch (error) {
    next(error);
  }
};

const rejectSeller = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    await createAuditLog(req.user.id, 'Seller Rejected', 'Seller', seller._id, { reason });
    await notificationService.send(seller.user_id, 'account_alert', 'Seller Application Rejected', `Reason: ${reason}`);
    
    // Optional: Delete the seller record or mark as rejected
    // await Seller.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Seller rejected successfully' });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PRODUCT MODERATION
// ==========================================
const getPendingProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'pending' })
      .populate('seller_id', 'store_name')
      .sort({ created_at: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const approveProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await createAuditLog(req.user.id, 'Product Approved', 'Product', product._id);
    
    const seller = await Seller.findById(product.seller_id);
    if (seller) {
      await notificationService.send(seller.user_id, 'listing_approved', 'Listing Approved', `Your product "${product.name}" is now live.`);
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const rejectProduct = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await createAuditLog(req.user.id, 'Product Rejected', 'Product', product._id, { reason });
    
    const seller = await Seller.findById(product.seller_id);
    if (seller) {
      await notificationService.send(seller.user_id, 'listing_rejected', 'Listing Rejected', `Your product "${product.name}" was rejected. Reason: ${reason}`);
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DISPUTE MANAGEMENT
// ==========================================
const getDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find()
      .populate('buyer_id', 'name email')
      .populate('seller_id', 'name email')
      .sort({ created_at: -1 });
    res.json({ success: true, data: disputes });
  } catch (error) {
    next(error);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    const { resolution, admin_notes } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id, 
      { status: 'resolved', resolution: resolution, resolved_by: req.user.id }, 
      { new: true }
    );
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    await createAuditLog(req.user.id, 'Dispute Resolved', 'Dispute', dispute._id, { resolution, admin_notes });
    
    // buyer_id is a User ref — notify directly
    await notificationService.send(dispute.buyer_id, 'dispute_update', 'Dispute Resolved', `Your dispute has been resolved by an Admin. Resolution: ${resolution}`);
    // seller_id is also a User ref on Dispute model — notify directly
    await notificationService.send(dispute.seller_id, 'dispute_update', 'Dispute Resolved', `A dispute has been resolved by an Admin. Resolution: ${resolution}`);

    res.json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SCRAPER & SYSTEM MONITORING
// ==========================================
const getScraperStatus = async (req, res, next) => {
  try {
    // Mock data for scraper status as requested
    const scrapers = [
      { platform: 'Daraz', status: 'Healthy', last_successful_scrape: new Date(), failures: 0 },
      { platform: 'PriceOye', status: 'Warning', last_successful_scrape: new Date(Date.now() - 3600000), failures: 2 },
      { platform: 'Goto', status: 'Delayed', last_successful_scrape: new Date(Date.now() - 7200000), failures: 5 },
      { platform: 'iShopping', status: 'Healthy', last_successful_scrape: new Date(), failures: 0 },
    ];
    res.json({ success: true, data: scrapers });
  } catch (error) {
    next(error);
  }
};

const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    // Broadcast via socket.io to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('notification', { type: 'SYSTEM_ANNOUNCEMENT', title, message, created_at: new Date() });
    }
    
    await createAuditLog(req.user.id, 'Broadcast Notification Sent', 'System', null, { title, message });

    res.json({ success: true, message: 'Broadcast sent successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers, getUserById, updateUserStatus,
  getPendingSellers, approveSeller, rejectSeller,
  getPendingProducts, approveProduct, rejectProduct,
  getDisputes, resolveDispute,
  getScraperStatus, broadcastNotification
};
