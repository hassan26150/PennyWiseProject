const mongoose = require('mongoose');
const { Schema } = mongoose;

const viewHistorySchema = new Schema(
  {
    buyer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'MasterProduct',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'viewed_at', updatedAt: false },
  }
);

viewHistorySchema.index({ buyer_id: 1, viewed_at: -1 });
viewHistorySchema.index({ product_id: 1, viewed_at: -1 }); // Used for global trending

const ViewHistory = mongoose.model('ViewHistory', viewHistorySchema);
module.exports = ViewHistory;
