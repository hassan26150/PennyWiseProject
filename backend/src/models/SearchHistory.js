const mongoose = require('mongoose');
const { Schema } = mongoose;

const searchHistorySchema = new Schema(
  {
    buyer_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

searchHistorySchema.index({ buyer_id: 1, created_at: -1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
module.exports = SearchHistory;
