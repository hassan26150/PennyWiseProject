const mongoose = require('mongoose');
const { Schema } = mongoose;

const priceAlertSchema = new Schema(
  {
    buyer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'MasterProduct',
      required: true,
    },
    target_price: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Users can only have one active alert per product at a time
priceAlertSchema.index({ buyer_id: 1, product_id: 1 }, { unique: true });

const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);
module.exports = PriceAlert;
