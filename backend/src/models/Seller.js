const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    store_name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    store_slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    store_description: {
      type: String,
      trim: true,
    },
    store_logo: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    review_count: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    store_location: {
      type: String,
      trim: true,
    },
    total_products: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// ── Pre-save: generate store_slug from store_name ──
sellerSchema.pre('save', function (next) {
  if (this.isModified('store_name') && !this.store_slug) {
    this.store_slug = this.store_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
  }
  next();
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
