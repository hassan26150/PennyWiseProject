const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * External Price History
 * Tracks price changes for external products over time.
 * Used for trend analysis, charts, and future AI predictions.
 */
const externalPriceHistorySchema = new Schema(
  {
    external_product_id: {
      type: Schema.Types.ObjectId,
      ref: 'ExternalProduct',
      required: true,
    },
    master_product_id: {
      type: Schema.Types.ObjectId,
      ref: 'MasterProduct',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      // Optional for legacy or direct seller product links
    },
    platform: {
      type: String,
      required: true,
    },
    price: {
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

// Indexes for efficient querying
externalPriceHistorySchema.index({ master_product_id: 1, recorded_at: -1 });
externalPriceHistorySchema.index({ product_id: 1, recorded_at: -1 });
externalPriceHistorySchema.index({ external_product_id: 1, recorded_at: -1 });
externalPriceHistorySchema.index({ platform: 1, recorded_at: -1 });

const ExternalPriceHistory = mongoose.model('ExternalPriceHistory', externalPriceHistorySchema);
module.exports = ExternalPriceHistory;
