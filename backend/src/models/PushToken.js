const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true, // Unique per token string to prevent duplicates
    },
    platform: {
      type: String,
      enum: ['android', 'ios', 'web'],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const PushToken = mongoose.model('PushToken', pushTokenSchema);
module.exports = PushToken;
