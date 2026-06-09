const Dispute = require('../models/Dispute');
const DisputeMessage = require('../models/DisputeMessage');
const Order = require('../models/Order');
const notificationService = require('../services/notification.service');
const { z } = require('zod');

const openDisputeSchema = z.object({
  orderId: z.string(),
  issueType: z.enum([
    'PRODUCT_NOT_RECEIVED',
    'DAMAGED_PRODUCT',
    'WRONG_PRODUCT',
    'MISSING_ITEMS',
    'REFUND_REQUEST',
    'SELLER_UNRESPONSIVE',
    'OTHER',
  ]),
  description: z.string().min(10)
});

const openDispute = async (req, res, next) => {
  try {
    const { orderId, issueType, description } = openDisputeSchema.parse(req.body);
    const buyerId = req.user.id;

    // Validate Order
    const order = await Order.findOne({ _id: orderId, buyer_id: buyerId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if order is within 30 days of delivery (if delivered)
    // Or if not delivered but older than expected... we'll just check it's not pending.
    if (order.status === 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot dispute a pending order.' });
    }

    if (order.status === 'delivered') {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - order.updated_at.getTime() > thirtyDaysMs) {
         return res.status(400).json({ success: false, message: 'Dispute window closed (30 days past delivery).' });
      }
    }

    const existingDispute = await Dispute.findOne({ order_id: orderId });
    if (existingDispute) {
      return res.status(400).json({ success: false, message: 'Dispute already exists for this order.' });
    }

    const dispute = await Dispute.create({
      order_id: orderId,
      buyer_id: buyerId,
      seller_id: order.seller_id,
      issue_type: issueType,
      description
    });

    // Notify Seller
    await notificationService.createNotification({
      user_id: order.seller_id,
      type: 'SYSTEM_ALERT',
      title: 'New Dispute Opened',
      message: `A dispute has been opened by the buyer for order #${orderId.toString().slice(-6)}`,
      metadata: { dispute_id: dispute._id, order_id: orderId }
    });

    res.status(201).json({ success: true, data: dispute });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid inputs', errors: error.errors });
    }
    next(error);
  }
};

const getDisputes = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'buyer') {
      query.buyer_id = req.user.id;
    } else if (req.user.role === 'seller') {
      query.seller_id = req.user.id;
    } // Admin sees all

    const disputes = await Dispute.find(query)
      .populate('buyer_id', 'name')
      .populate('seller_id', 'name')
      .populate('order_id', 'status total_amount')
      .sort({ created_at: -1 });

    res.json({ success: true, data: disputes });
  } catch (error) {
    next(error);
  }
};

const getDisputeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dispute = await Dispute.findById(id)
      .populate('buyer_id', 'name profile_image')
      .populate('seller_id', 'name profile_image')
      .populate('order_id', 'status total_amount');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    // Security check
    if (req.user.role === 'buyer' && dispute.buyer_id._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (req.user.role === 'seller' && dispute.seller_id._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const messages = await DisputeMessage.find({ dispute_id: id })
      .populate('sender_id', 'name role profile_image')
      .sort({ created_at: 1 });

    res.json({ success: true, data: { dispute, messages } });
  } catch (error) {
    next(error);
  }
};

const addMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    const dispute = await Dispute.findById(id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return res.status(400).json({ success: false, message: 'Dispute is closed. Cannot add messages.' });
    }

    const newMessage = await DisputeMessage.create({
      dispute_id: id,
      sender_id: req.user.id,
      message
    });

    // Notifications
    const isBuyer = req.user.id === dispute.buyer_id.toString();
    const recipientId = isBuyer ? dispute.seller_id : dispute.buyer_id;

    await notificationService.createNotification({
      user_id: recipientId,
      type: 'ORDER_UPDATE',
      title: 'New Dispute Message',
      message: `You received a new message in dispute #${id.toString().slice(-6)}`,
      metadata: { dispute_id: id }
    });

    const populatedMessage = await DisputeMessage.findById(newMessage._id).populate('sender_id', 'name role profile_image');
    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    next(error);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolution, status } = req.body; // status: resolved, closed

    const dispute = await Dispute.findById(id);
    if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });

    dispute.status = status;
    dispute.resolution = resolution;
    dispute.resolved_by = req.user.id;
    await dispute.save();

    await notificationService.createNotification({
      user_id: dispute.buyer_id,
      type: 'SYSTEM_ALERT',
      title: 'Dispute Resolved',
      message: `Your dispute for order #${dispute.order_id.toString().slice(-6)} was marked as ${status}.`,
      metadata: { dispute_id: id }
    });

    await notificationService.createNotification({
      user_id: dispute.seller_id,
      type: 'SYSTEM_ALERT',
      title: 'Dispute Resolved',
      message: `A dispute for order #${dispute.order_id.toString().slice(-6)} was marked as ${status}.`,
      metadata: { dispute_id: id }
    });

    res.json({ success: true, data: dispute });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  openDispute,
  getDisputes,
  getDisputeDetails,
  addMessage,
  resolveDispute
};
