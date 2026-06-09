const mongoose = require('mongoose');

const orderStatusHistorySchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true,
    },
    changed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changed_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // only using changed_at
  }
);

const OrderStatusHistory = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);
module.exports = OrderStatusHistory;
