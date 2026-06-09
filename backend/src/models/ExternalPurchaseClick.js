const mongoose = require('mongoose');

const externalPurchaseClickSchema = new mongoose.Schema(
  {
    buyer_id: {
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
    platform: {
      type: String,
      required: true,
    },
    external_url: {
      type: String,
      required: true,
    },
    clicked_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const ExternalPurchaseClick = mongoose.model('ExternalPurchaseClick', externalPurchaseClickSchema);
module.exports = ExternalPurchaseClick;
