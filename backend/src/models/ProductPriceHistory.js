const mongoose = require('mongoose');
const { Schema } = mongoose;

const productPriceHistorySchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    old_price: {
      type: Number,
      required: true,
    },
    new_price: {
      type: Number,
      required: true,
    },
    recorded_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We use recorded_at
  }
);

// Index for querying history for a specific product
productPriceHistorySchema.index({ product_id: 1, recorded_at: -1 });

const ProductPriceHistory = mongoose.model('ProductPriceHistory', productPriceHistorySchema);
module.exports = ProductPriceHistory;
