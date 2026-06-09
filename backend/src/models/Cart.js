const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Links to the internal PennyWise Product inventory
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price_snapshot: {
      type: Number,
      required: true, // Frozen at add-time
    },
  },
  { _id: true } // Let mongoose generate IDs for cart items
);

const cartSchema = new mongoose.Schema(
  {
    buyer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per buyer
    },
    items: [cartItemSchema],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
