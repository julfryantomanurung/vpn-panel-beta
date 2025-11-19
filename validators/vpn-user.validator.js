const Joi = require('joi');

/**
 * Validator for creating VPN user
 */
const createVPNUserSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters',
      'any.required': 'Username is required',
    }),
  
  protocol: Joi.string()
    .valid('ssh', 'vmess', 'vless')
    .required()
    .messages({
      'any.only': 'Protocol must be one of: ssh, vmess, vless',
      'any.required': 'Protocol is required',
    }),
  
  expiry_days: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .required()
    .messages({
      'number.min': 'Expiry days must be at least 1',
      'number.max': 'Expiry days must not exceed 365',
      'any.required': 'Expiry days is required',
    }),
  
  password: Joi.when('protocol', {
    is: 'ssh',
    then: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required for SSH protocol',
      }),
    otherwise: Joi.string().optional(),
  }),
});

/**
 * Validator for updating VPN user
 */
const updateVPNUserSchema = Joi.object({
  expiry_days: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .optional()
    .messages({
      'number.min': 'Expiry days must be at least 1',
      'number.max': 'Expiry days must not exceed 365',
    }),
  
  password: Joi.string()
    .min(8)
    .optional()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validator for renewing user
 */
const renewUserSchema = Joi.object({
  additional_days: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .required()
    .messages({
      'number.min': 'Additional days must be at least 1',
      'number.max': 'Additional days must not exceed 365',
      'any.required': 'Additional days is required',
    }),
});

/**
 * Validator for listing users query
 */
const listUsersQuerySchema = Joi.object({
  protocol: Joi.string()
    .valid('ssh', 'vmess', 'vless')
    .optional()
    .messages({
      'any.only': 'Protocol must be one of: ssh, vmess, vless',
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .optional(),
});

/**
 * Validator for username parameter
 */
const usernameParamSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'any.required': 'Username is required',
    }),
});

module.exports = {
  createVPNUserSchema,
  updateVPNUserSchema,
  renewUserSchema,
  listUsersQuerySchema,
  usernameParamSchema,
};
