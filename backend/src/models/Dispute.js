const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // One dispute per order
    },
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
      enum: ['open', 'under_review', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
    issue_type: {
      type: String,
      enum: [
        'PRODUCT_NOT_RECEIVED',
        'DAMAGED_PRODUCT',
        'WRONG_PRODUCT',
        'MISSING_ITEMS',
        'REFUND_REQUEST',
        'SELLER_UNRESPONSIVE',
        'OTHER',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    resolution: {
      type: String,
      default: null,
    },
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;
