const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const ApiError = require('./utils/ApiError');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const adminRoutes = require('./routes/admin.routes');
const comparisonRoutes = require('./routes/comparison.routes');
const discoveryRoutes = require('./routes/discovery.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const sellerOrderRoutes = require('./routes/seller.order.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const priceAlertRoutes = require('./routes/priceAlert.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const reviewRoutes = require('./routes/review.routes');
const disputeRoutes = require('./routes/dispute.routes');
const sellerAnalyticsRoutes = require('./routes/sellerAnalytics.routes');
const adminAnalyticsRoutes = require('./routes/adminAnalytics.routes');

const app = express();

// ── Security Headers ──
app.use(helmet());

// ── CORS — allow mobile app + localhost ──
app.use(cors({
  origin: '*', // Allow all origins for mobile app development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── HTTP request logging ──
app.use(morgan('dev', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PennyWise API is running', timestamp: new Date().toISOString() });
});

// ── Mount routes ──
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/products', comparisonRoutes); // Must come before productRoutes (/:id pattern)
app.use('/api/products', productRoutes);

// Temporary debug endpoint
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller/orders', sellerOrderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/price-alerts', priceAlertRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/seller/analytics', sellerAnalyticsRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);

// ── 404 handler ──
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
    errors = [{ field, message }];
  }

  // Log to debug.log
  try {
    const fs = require('fs');
    fs.appendFileSync('debug.log', new Date().toISOString() + ' ERROR: ' + message + ' ' + JSON.stringify(errors) + '\n' + (err.stack || '') + '\n\n');
  } catch (e) {}

  // Log error using Winston (or console)id ObjectId etc)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, { stack: err.stack });
  } else {
    logger.warn(`${statusCode} - ${message}`);
  }

  // Never expose stack traces in production
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
});

module.exports = app;
