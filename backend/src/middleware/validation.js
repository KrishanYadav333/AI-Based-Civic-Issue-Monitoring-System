const Joi = require('joi');

// Common validation schemas
const schemas = {
  // Email validation
  email: Joi.string().email().lowercase().trim().max(255),

  // Password validation (strong password required)
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),

  // Coordinates validation
  latitude: Joi.number().min(-90).max(90).precision(8),
  longitude: Joi.number().min(-180).max(180).precision(8),

  // ID validation
  id: Joi.number().integer().positive(),

  // Name validation
  name: Joi.string().trim().min(2).max(255).pattern(/^[a-zA-Z\s]+$/),

  // User role validation
  role: Joi.string().valid('surveyor', 'engineer', 'admin'),

  // Issue type validation
  issueType: Joi.string().valid('pothole', 'garbage', 'debris', 'stray_cattle', 'broken_road', 'open_manhole'),

  // Issue status validation
  issueStatus: Joi.string().valid('pending', 'assigned', 'resolved'),

  // Priority validation
  priority: Joi.string().valid('high', 'medium', 'low'),

  // Date validation
  date: Joi.date().iso(),

  // Pagination
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
};

// Validate request middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    req.body = value;
    next();
  };
};

// Validate query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    req.query = value;
    next();
  };
};

// Specific validation schemas for routes
const validationSchemas = {
  // Auth
  login: Joi.object({
    email: schemas.email.required(),
    password: Joi.string().required()
  }),

  // User creation
  createUser: Joi.object({
    name: schemas.name.required(),
    email: schemas.email.required(),
    password: schemas.password.required(),
    role: schemas.role.required(),
    wardId: schemas.id.allow(null)
  }),

  // User update
  updateUser: Joi.object({
    name: schemas.name,
    email: schemas.email,
    password: schemas.password,
    role: schemas.role,
    wardId: schemas.id.allow(null)
  }).min(1),

  // Issue submission
  createIssue: Joi.object({
    latitude: schemas.latitude.required(),
    longitude: schemas.longitude.required()
  }),

  // Issue filters
  issueFilters: Joi.object({
    status: schemas.issueStatus,
    priority: schemas.priority,
    wardId: schemas.id,
    engineerId: schemas.id,
    type: schemas.issueType,
    page: schemas.page,
    limit: schemas.limit,
    startDate: schemas.date,
    endDate: schemas.date
  }),

  // Heatmap filters
  heatmapFilters: Joi.object({
    status: schemas.issueStatus,
    type: schemas.issueType,
    startDate: schemas.date,
    endDate: schemas.date
  })
};

module.exports = {
  schemas,
  validate,
  validateQuery,
  validationSchemas
};
