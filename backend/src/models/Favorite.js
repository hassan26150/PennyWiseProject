const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterProduct',
      required: true,
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

favoriteSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
