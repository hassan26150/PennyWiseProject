const ApiError = require('../utils/ApiError');

/**
 * Zod validation middleware factory.
 * Validates req.body against the provided Zod schema.
 * Returns structured 422 errors with field-level messages.
 *
 * Usage: validate(signupSchema)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(ApiError.validation(errors));
    }

    // Replace body with parsed/transformed data
    req.body = result.data;
    next();
  };
};

module.exports = validate;
