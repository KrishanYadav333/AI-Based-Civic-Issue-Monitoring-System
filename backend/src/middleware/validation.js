/**
 * Request Validation Middleware
 */

const { validationErrorResponse } = require('../utils/response');

/**
 * Validate request body fields
 */
function validateBody(schema) {
    return (req, res, next) => {
        const errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];
            
            // Check required
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            
            // Skip validation if optional and not provided
            if (!rules.required && (value === undefined || value === null)) {
                continue;
            }
            
            // Type validation
            if (rules.type && typeof value !== rules.type) {
                errors.push(`${field} must be of type ${rules.type}`);
            }
            
            // Custom validation
            if (rules.validate && typeof rules.validate === 'function') {
                const result = rules.validate(value);
                if (result !== true) {
                    errors.push(result || `${field} is invalid`);
                }
            }
        }
        
        if (errors.length > 0) {
            return validationErrorResponse(res, errors);
        }
        
        next();
    };
}

/**
 * Validate query parameters
 */
function validateQuery(schema) {
    return (req, res, next) => {
        const errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = req.query[field];
            
            if (rules.required && !value) {
                errors.push(`Query parameter '${field}' is required`);
                continue;
            }
            
            if (!rules.required && !value) {
                continue;
            }
            
            if (rules.validate && typeof rules.validate === 'function') {
                const result = rules.validate(value);
                if (result !== true) {
                    errors.push(result || `Query parameter '${field}' is invalid`);
                }
            }
        }
        
        if (errors.length > 0) {
            return validationErrorResponse(res, errors);
        }
        
        next();
    };
}

module.exports = {
    validateBody,
    validateQuery
};
