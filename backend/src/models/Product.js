const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    master_product_id: {
      type: Schema.Types.ObjectId,
      ref: 'MasterProduct',
      default: null, // Can be null if the seller creates an entirely new product not in catalog yet
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    short_description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String], // Array of Cloudinary URLs
      default: [],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'inactive'],
      default: 'pending',
    },
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
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
    availability_source: {
      type: String,
      enum: ['pennywise', 'external', 'both'],
      default: 'pennywise',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for fast querying and sorting
productSchema.index({ status: 1, category_id: 1 });
productSchema.index({ price: 1 });
productSchema.index({ created_at: -1 });

// Create a Text Index for full-text search across name, description, and short_description
productSchema.index(
  {
    name: 'text',
    description: 'text',
    short_description: 'text',
  },
  {
    weights: {
      name: 10,
      short_description: 5,
      description: 1,
    },
    name: 'ProductTextIndex',
  }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
