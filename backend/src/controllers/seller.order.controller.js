const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const notificationService = require('../services/notification.service');
const ApiError = require('../utils/ApiError');

/**
 * Helper function to transition order status
 */
const transitionOrderStatus = async (orderId, sellerId, fromStatus, toStatus, reqBody = {}, session) => {
  const order = await Order.findOne({ _id: orderId, seller_id: sellerId }).session(session);
  if (!order) throw ApiError.notFound('Order not found');

  if (order.status !== fromStatus) {
    throw ApiError.badRequest(`Order cannot be moved to ${toStatus} because it is currently ${order.status}`);
  }

  order.status = toStatus;
  
  if (toStatus === 'shipped') {
    if (!reqBody.tracking_number) throw ApiError.badRequest('Tracking number is required to ship an order');
    order.tracking_number = reqBody.tracking_number;
  }

  await order.save({ session });

  await OrderStatusHistory.create([{
    order_id: order._id,
    status: toStatus,
    changed_by: sellerId,
  }], { session });

  // Notify buyer
  let message = '';
  if (toStatus === 'confirmed') message = 'Your order has been confirmed by the seller.';
  if (toStatus === 'processing') message = 'Your order is now being processed.';
  if (toStatus === 'shipped') message = `Your order has been shipped. Tracking: ${order.tracking_number}`;
  if (toStatus === 'delivered') message = 'Your order has been delivered successfully.';

  // Notify buyer asynchronously
  notificationService.send(
    order.buyer_id,
    `order_${toStatus}`,
    `Order ${toStatus.charAt(0).toUpperCase() + toStatus.slice(1)}`,
    message,
    { order_id: order._id, screen: 'OrderDetail' }
  ).catch(err => console.error('Failed to send status notification', err));

  return order;
};

/**
 * GET /api/seller/orders
 * Get seller's orders
 */
const getSellerOrders = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { status } = req.query;

    const query = { seller_id: sellerId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('buyer_id', 'name email')
      .sort({ created_at: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/seller/orders/:id/confirm
 */
const confirmOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await transitionOrderStatus(req.params.id, req.user.id, 'pending', 'confirmed', req.body, session);
    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, message: 'Order confirmed', data: order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * PATCH /api/seller/orders/:id/process
 */
const processOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await transitionOrderStatus(req.params.id, req.user.id, 'confirmed', 'processing', req.body, session);
    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, message: 'Order processing', data: order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * PATCH /api/seller/orders/:id/ship
 */
const shipOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await transitionOrderStatus(req.params.id, req.user.id, 'processing', 'shipped', req.body, session);
    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, message: 'Order shipped', data: order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * PATCH /api/seller/orders/:id/deliver
 */
const deliverOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await transitionOrderStatus(req.params.id, req.user.id, 'shipped', 'delivered', req.body, session);
    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, message: 'Order delivered', data: order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * PATCH /api/seller/orders/:id/cancel
 * Cancel order + restore stock
 */
const cancelOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findOne({ _id: req.params.id, seller_id: req.user.id }).session(session);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw ApiError.badRequest(`Cannot cancel a ${order.status} order`);
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product_id, { $inc: { stock_quantity: item.quantity } }, { session });
    }

    order.status = 'cancelled';
    await order.save({ session });

    await OrderStatusHistory.create([{
      order_id: order._id,
      status: 'cancelled',
      changed_by: req.user.id,
    }], { session });

    // Notify Buyer that seller cancelled
    notificationService.send(
      order.buyer_id,
      'order_cancelled',
      'Order Cancelled',
      `Your order #${order._id.toString().slice(-6)} was cancelled by the seller.`,
      { order_id: order._id, screen: 'OrderDetail' }
    ).catch(err => console.error('Failed to notify cancellation', err));

    await session.commitTransaction();
    session.endSession();
    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

module.exports = {
  getSellerOrders,
  confirmOrder,
  processOrder,
  shipOrder,
  deliverOrder,
  cancelOrder
};
