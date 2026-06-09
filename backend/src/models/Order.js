const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    product_name: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    shipping_address: {
      type: mongoose.Schema.Types.Mixed, // flexible object for address
      required: true,
    },
    payment_method: {
      type: String,
      default: 'COD',
    },
    tracking_number: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    items: [orderItemSchema],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
