const mongoose = require('mongoose');
const { Schema } = mongoose;

const recommendationCacheSchema = new Schema(
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
    recommendation_type: {
      type: String,
      enum: ['bought_together', 'category_affinity', 'trending', 'similar_products'],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'generated_at', updatedAt: false },
  }
);

// We replace recommendations on a nightly basis per user, so this unique index helps with upserts
recommendationCacheSchema.index({ buyer_id: 1, product_id: 1, recommendation_type: 1 }, { unique: true });
recommendationCacheSchema.index({ buyer_id: 1, score: -1 });

const RecommendationCache = mongoose.model('RecommendationCache', recommendationCacheSchema);
module.exports = RecommendationCache;
