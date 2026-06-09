const mongoose = require('mongoose');

const notificationEventSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'order_placed', 'order_confirmed', 'order_processing', 'order_shipped', 'order_delivered', 'order_cancelled',
        'price_drop', 'dispute_opened', 'dispute_resolved', 
        'seller_approved', 'seller_rejected', 'listing_approved', 'listing_rejected', 
        'new_review', 'low_stock_alert', 'promotion', 'system_announcement'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

notificationEventSchema.index({ user_id: 1, read: 1, created_at: -1 });

const NotificationEvent = mongoose.model('NotificationEvent', notificationEventSchema);
module.exports = NotificationEvent;
