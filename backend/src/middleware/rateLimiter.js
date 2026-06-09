const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for auth routes.
 * Prevents brute-force login attacks.
 * Max 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
});

/**
 * General rate limiter factory.
 * @param {number} maxRequests - Max requests per window
 * @param {number} windowMinutes - Window size in minutes
 */
const createLimiter = (maxRequests = 100, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      statusCode: 429,
      message: 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = { authLimiter, createLimiter };
