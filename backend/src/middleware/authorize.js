const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware.
 * Usage: authorize('admin', 'seller')
 * Must be used AFTER authenticate middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. This resource requires one of the following roles: ${roles.join(', ')}.`
        )
      );
    }

    next();
  };
};

module.exports = authorize;
