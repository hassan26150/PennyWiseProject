const mongoose = require('mongoose');

const disputeMessageSchema = new mongoose.Schema(
  {
    dispute_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
      required: true,
      index: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false }, // Only need created_at
  }
);

const DisputeMessage = mongoose.model('DisputeMessage', disputeMessageSchema);

module.exports = DisputeMessage;
