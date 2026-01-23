/**
 * Error Handling Middleware
 */

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

/**
 * Global error handler
 */
function errorHandler(err, req, res, next) {
    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        user: req.user?.id
    });
    
    // Send response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    
    return errorResponse(res, message, statusCode);
}

/**
 * Not found handler
 */
function notFoundHandler(req, res) {
    return errorResponse(res, `Route not found: ${req.method} ${req.path}`, 404);
}

/**
 * Async route wrapper to catch errors
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
