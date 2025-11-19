const Joi = require('joi');

/**
 * Validator for creating menu
 */
const createMenuSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'Menu name must be at least 3 characters long',
      'string.max': 'Menu name must not exceed 50 characters',
      'any.required': 'Menu name is required',
    }),
  
  action: Joi.string()
    .required()
    .messages({
      'any.required': 'Action is required',
    }),
  
  icon: Joi.string()
    .optional()
    .default('circle'),
  
  order: Joi.number()
    .integer()
    .min(0)
    .optional(),
  
  parent_id: Joi.string()
    .uuid()
    .allow(null)
    .optional(),
  
  roles: Joi.array()
    .items(Joi.string())
    .optional()
    .default(['admin']),
  
  visible: Joi.boolean()
    .optional()
    .default(true),
  
  description: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 200 characters',
    }),
});

/**
 * Validator for updating menu
 */
const updateMenuSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Menu name must be at least 3 characters long',
      'string.max': 'Menu name must not exceed 50 characters',
    }),
  
  action: Joi.string()
    .optional(),
  
  icon: Joi.string()
    .optional(),
  
  order: Joi.number()
    .integer()
    .min(0)
    .optional(),
  
  parent_id: Joi.string()
    .uuid()
    .allow(null)
    .optional(),
  
  roles: Joi.array()
    .items(Joi.string())
    .optional(),
  
  visible: Joi.boolean()
    .optional(),
  
  description: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 200 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Validator for reordering menus
 */
const reorderMenusSchema = Joi.object({
  orders: Joi.array()
    .items(
      Joi.object({
        id: Joi.string()
          .uuid()
          .required()
          .messages({
            'any.required': 'Menu ID is required',
          }),
        order: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'any.required': 'Order is required',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one menu order must be provided',
      'any.required': 'Orders array is required',
    }),
});

/**
 * Validator for menu ID parameter
 */
const menuIdParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid menu ID format',
      'any.required': 'Menu ID is required',
    }),
});

module.exports = {
  createMenuSchema,
  updateMenuSchema,
  reorderMenusSchema,
  menuIdParamSchema,
};
