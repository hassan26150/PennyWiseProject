const tokenService = require('../services/token.service');
const ApiError = require('../utils/ApiError');

/**
 * JWT authentication middleware.
 * Extracts Bearer token from Authorization header,
 * verifies it, and attaches decoded user to req.user.
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required. Please login.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access token is required. Please login.');
    }

    // Verify and decode
    const decoded = tokenService.verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token expired. Please refresh your token.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid access token.'));
    }
    next(error);
  }
};

module.exports = authenticate;
