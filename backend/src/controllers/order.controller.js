const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const notificationService = require('../services/notification.service');
const Invoice = require('../models/Invoice');
const invoiceService = require('../services/invoice.service');
const ApiError = require('../utils/ApiError');

/**
 * POST /api/orders
 * Checkout: Create orders from cart, split by seller, decrement stock
 */
const checkout = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const buyerId = req.user.id;
    const { shipping_address, payment_method = 'COD' } = req.body;

    if (!shipping_address) {
      throw ApiError.badRequest('Shipping address is required');
    }

    const cart = await Cart.findOne({ buyer_id: buyerId }).populate('items.product_id');
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // 1. Group items by seller and validate stock
    const ordersBySeller = {};
    
    for (const item of cart.items) {
      const product = item.product_id;
      
      if (!product) throw ApiError.badRequest('A product in your cart no longer exists.');
      if (product.status !== 'approved' && product.status !== 'active') throw ApiError.badRequest(`${product.name} is no longer available.`);
      if (product.stock_quantity < item.quantity) throw ApiError.badRequest(`Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.`);
      if (product.availability_source === 'external') throw ApiError.badRequest(`${product.name} is an external product and cannot be checked out here.`);

      const sellerId = product.seller_id.toString();
      if (!ordersBySeller[sellerId]) {
        ordersBySeller[sellerId] = {
          seller_id: sellerId,
          items: [],
          total_amount: 0,
        };
      }

      ordersBySeller[sellerId].items.push({
        product_id: product._id,
        quantity: item.quantity,
        price: product.price, // use current real price, not snapshot
        product_name: product.name,
        thumbnail: product.thumbnail,
      });
      ordersBySeller[sellerId].total_amount += product.price * item.quantity;
      
      // Decrement stock
      await Product.findByIdAndUpdate(product._id, { $inc: { stock_quantity: -item.quantity } }, { session });
    }

    const createdOrders = [];

    // 2. Create an order for each seller
    for (const sellerId in ordersBySeller) {
      const orderData = ordersBySeller[sellerId];
      
      const newOrder = new Order({
        buyer_id: buyerId,
        seller_id: sellerId,
        status: 'pending',
        total_amount: orderData.total_amount,
        shipping_address,
        payment_method,
        items: orderData.items,
      });

      await newOrder.save({ session });
      createdOrders.push(newOrder);

      // Record History
      await OrderStatusHistory.create([{
        order_id: newOrder._id,
        status: 'pending',
        changed_by: buyerId,
      }], { session });

      // Notify Buyer
      notificationService.send(
        buyerId,
        'order_placed',
        'Order Placed Successfully',
        `Your order #${newOrder._id.toString().slice(-6)} has been placed.`,
        { order_id: newOrder._id, screen: 'OrderDetail' }
      );

      // Notify Seller
      notificationService.send(
        sellerId,
        'order_placed',
        'New Order Received',
        `You have received a new order #${newOrder._id.toString().slice(-6)}.`,
        { order_id: newOrder._id, screen: 'OrderDetail' }
      );

      // Generate Invoice
      try {
        // Need to populate buyer info for invoice
        await newOrder.populate('buyer_id', 'name email');
        await newOrder.populate('seller_id', 'store_name email');
        
        const invoiceUrl = await invoiceService.generateAndUploadInvoice(newOrder);
        const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        await Invoice.create([{
          order_id: newOrder._id,
          invoice_number: invoiceNumber,
          amount: newOrder.total_amount,
          pdf_url: invoiceUrl,
        }], { session });
      } catch (err) {
        console.error('Invoice generation failed during checkout', err);
        // We don't want to fail the whole transaction if PDF generation fails, 
        // but in a production app we might queue this for retry.
      }
    }

    // 3. Clear the cart
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
      success: true, 
      message: 'Orders placed successfully', 
      data: createdOrders 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * GET /api/orders
 * Buyer order history
 */
const getMyOrders = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const orders = await Order.find({ buyer_id: buyerId })
      .populate('seller_id', 'name email')
      .sort({ created_at: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 * Get full order details
 */
const getOrderDetails = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, buyer_id: buyerId })
      .populate('seller_id', 'name email')
      .populate('items.product_id', 'name slug thumbnail');

    if (!order) return next(ApiError.notFound('Order not found'));

    const history = await OrderStatusHistory.find({ order_id: order._id }).sort({ changed_at: 1 });
    const invoice = await Invoice.findOne({ order_id: order._id });

    res.json({ 
      success: true, 
      data: {
        ...order.toObject(),
        timeline: history,
        invoice: invoice ? invoice.pdf_url : null
      } 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/orders/:id
 * Cancel pending order + restore stock
 */
const cancelOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const buyerId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, buyer_id: buyerId }).session(session);
    if (!order) throw ApiError.notFound('Order not found');

    if (order.status !== 'pending') {
      throw ApiError.badRequest('Only pending orders can be cancelled');
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
      changed_by: buyerId,
    }], { session });

    // Notify Seller that buyer cancelled
    notificationService.send(
      order.seller_id,
      'order_cancelled',
      'Order Cancelled',
      `Order #${order._id.toString().slice(-6)} was cancelled by the buyer.`,
      { order_id: order._id, screen: 'OrderDetail' }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * GET /api/orders/:id/invoice
 * Return invoice PDF URL
 */
const getOrderInvoice = async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, buyer_id: buyerId });
    if (!order) return next(ApiError.notFound('Order not found'));

    const invoice = await Invoice.findOne({ order_id: order._id });
    if (!invoice) return next(ApiError.notFound('Invoice not found for this order'));

    res.json({ success: true, data: { pdf_url: invoice.pdf_url } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  getOrderInvoice
};
