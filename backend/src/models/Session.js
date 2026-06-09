const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refresh_token: {
      type: String,
      required: true,
      index: true,
    },
    device_info: {
      type: String,
    },
    ip_address: {
      type: String,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL — MongoDB auto-deletes expired docs
    },
  },
  {
    timestamps: { createdAt: 'created_at' },
  }
);

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
