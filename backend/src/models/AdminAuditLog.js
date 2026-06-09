const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    target_type: {
      type: String,
      enum: ['User', 'Seller', 'Product', 'Dispute', 'System'],
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema);

module.exports = AdminAuditLog;
