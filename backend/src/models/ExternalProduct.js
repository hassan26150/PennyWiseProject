const mongoose = require('mongoose');
const { Schema } = mongoose;

const externalProductSchema = new Schema(
  {
    master_product_id: {
      type: Schema.Types.ObjectId,
      ref: 'MasterProduct',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      // Optional now, since we primarily link to master_product_id
    },
    platform: {
      type: String, // e.g., "Daraz", "PriceOye"
      required: true,
    },
    product_name: {
      type: String,
      default: '',
    },
    external_url: {
      type: String,
      required: true,
    },
    external_price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    availability: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: null,
    },
    match_score: {
      type: Number,
      default: 0,
    },
    source_platform: {
      type: String,
      default: '',
    },
    in_stock: {
      type: Boolean,
      default: true,
    },
    scrape_status: {
      type: String,
      enum: ['success', 'partial_success', 'failed'],
      default: 'success',
    },
    image_url: {
      type: String,
      default: null,
    },
    last_scraped_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index: one entry per master product per platform per URL
externalProductSchema.index({ master_product_id: 1, platform: 1, external_url: 1 }, { unique: true });
// Query by master product
externalProductSchema.index({ master_product_id: 1 });
// Query by seller product (for legacy or direct links)
externalProductSchema.index({ product_id: 1 });
// Query by platform
externalProductSchema.index({ platform: 1 });

const ExternalProduct = mongoose.model('ExternalProduct', externalProductSchema);
module.exports = ExternalProduct;
