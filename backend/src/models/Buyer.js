const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    shopping_address: {
      type: String,
      trim: true,
    },
    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    saved_items_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = Buyer;
