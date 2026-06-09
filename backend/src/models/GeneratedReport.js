const mongoose = require('mongoose');

const generatedReportSchema = new mongoose.Schema(
  {
    report_type: {
      type: String,
      required: true,
      enum: ['platform_activity', 'seller_performance', 'order_statistics', 'product_statistics', 'dispute_reports'],
    },
    format: {
      type: String,
      required: true,
      enum: ['csv', 'pdf'],
    },
    file_url: {
      type: String,
      required: true,
    },
    generated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'generated_at', updatedAt: false },
  }
);

const GeneratedReport = mongoose.model('GeneratedReport', generatedReportSchema);

module.exports = GeneratedReport;
