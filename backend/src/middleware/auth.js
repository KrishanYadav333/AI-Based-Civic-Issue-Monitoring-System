/**
 * Authentication Middleware
 */

const { verifyToken } = require('../services/authService');
const logger = require('../utils/logger');
const { unauthorizedResponse, forbiddenResponse } = require('../utils/response');
const { USER_ROLES } = require('../core/constants');

/**
 * Authenticate JWT token
 */
function authenticate(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return unauthorizedResponse(res, 'Authorization header is required');
        }
        
        if (!authHeader.startsWith('Bearer ')) {
            return unauthorizedResponse(res, 'Invalid authorization format. Use: Bearer <token>');
        }
        
        const token = authHeader.substring(7);
        
        // Verify token
        const decoded = verifyToken(token);
        
        // Attach user to request
        req.user = decoded;
        
        next();
        
    } catch (error) {
        logger.error('Authentication error:', error);
        return unauthorizedResponse(res, 'Invalid or expired token');
    }
}

/**
 * Authorize user role
 */
function authorize(...allowedRoles) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return unauthorizedResponse(res, 'Authentication required');
            }
            
            if (!allowedRoles.includes(req.user.role)) {
                return forbiddenResponse(res, 'Insufficient permissions');
            }
            
            next();
            
        } catch (error) {
            logger.error('Authorization error:', error);
            return forbiddenResponse(res, 'Authorization failed');
        }
    };
}

/**
 * Optional authentication (doesn't fail if no token)
 */
function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);
            req.user = decoded;
        }
        
        next();
        
    } catch (error) {
        // Continue without user
        next();
    }
}

module.exports = {
    authenticate,
    authorize,
    optionalAuth
};
