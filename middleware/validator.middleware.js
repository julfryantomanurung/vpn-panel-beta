const logger = require('../utils/logger');

/**
 * Validation middleware factory
 * @param {object} schema - Joi validation schema
 * @param {string} property - Property to validate (body, query, params)
 * @returns {function} Express middleware
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn(`Validation error: ${errorMessage}`);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    // Replace the property with validated and sanitized value
    req[property] = value;
    next();
  };
}

module.exports = {
  validate,
};
