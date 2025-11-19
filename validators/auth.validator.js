const Joi = require('joi');
const { ValidationError } = require('../middleware/errorHandler');

// Schema for login request
const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'Username is required',
      'string.empty': 'Username cannot be empty'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    })
});

// Middleware to validate login request
const validateLogin = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return next(new ValidationError('Login validation failed', errors));
  }
  
  // Replace request body with validated data
  req.body = value;
  next();
};

module.exports = {
  validateLogin
};
