const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
