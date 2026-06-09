const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * MasterProduct Model
 * 
 * Represents the core catalog item (e.g., "Apple iPhone 15 Pro Max").
 * Independent of any specific seller. External products (scraped) and 
 * Marketplace products (PennyWise sellers) both link back to this master record.
 */
const masterProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    normalized_title: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      default: 'Unknown',
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // Will be populated manually or via auto-mapping
    },
    description: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    lowest_market_price: {
      type: Number,
      default: 0,
    },
    average_market_price: {
      type: Number,
      default: 0,
    },
    best_platform: {
      type: String,
      default: 'Unknown',
    },
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    total_reviews: {
      type: Number,
      default: 0,
    },
    total_views: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    last_discovered_at: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Indexes for fast querying
masterProductSchema.index({ lowest_market_price: 1 });
masterProductSchema.index({ category_id: 1 });
masterProductSchema.index({ created_at: -1 });

// Text Index for full-text search across the catalog
masterProductSchema.index(
  {
    name: 'text',
    brand: 'text',
    description: 'text',
  },
  {
    weights: {
      name: 10,
      brand: 5,
      description: 1,
    },
    name: 'MasterProductTextIndex',
  }
);

const MasterProduct = mongoose.model('MasterProduct', masterProductSchema);
module.exports = MasterProduct;
