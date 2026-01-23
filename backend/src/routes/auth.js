/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBody } = require('../middleware/validation');
const { successResponse, createdResponse } = require('../utils/response');

/**
 * POST /api/auth/register
 * Register new user
 */
router.post(
    '/register',
    validateBody({
        username: {
            required: true,
            type: 'string'
        },
        email: {
            required: true,
            type: 'string'
        },
        password: {
            required: true,
            type: 'string'
        },
        role: {
            required: false,
            type: 'string'
        },
        full_name: {
            required: false,
            type: 'string'
        }
    }),
    asyncHandler(async (req, res) => {
        const result = await authService.register(req.body);
        
        return createdResponse(res, result, 'User registered successfully');
    })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
    '/login',
    validateBody({
        username: {
            required: true,
            type: 'string'
        },
        password: {
            required: true,
            type: 'string'
        }
    }),
    asyncHandler(async (req, res) => {
        const result = await authService.login(
            req.body.username,
            req.body.password
        );
        
        return successResponse(res, result, 'Login successful');
    })
);

/**
 * GET /api/auth/me
 * Get current user
 */
router.get(
    '/me',
    authenticate,
    asyncHandler(async (req, res) => {
        const user = await authService.getUserById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        return successResponse(res, user, 'User retrieved successfully');
    })
);

/**
 * PATCH /api/auth/me
 * Update current user
 */
router.patch(
    '/me',
    authenticate,
    asyncHandler(async (req, res) => {
        const updatedUser = await authService.updateUser(req.user.id, req.body);
        
        return successResponse(res, updatedUser, 'User updated successfully');
    })
);

/**
 * POST /api/auth/change-password
 * Change password
 */
router.post(
    '/change-password',
    authenticate,
    validateBody({
        old_password: {
            required: true,
            type: 'string'
        },
        new_password: {
            required: true,
            type: 'string'
        }
    }),
    asyncHandler(async (req, res) => {
        await authService.changePassword(
            req.user.id,
            req.body.old_password,
            req.body.new_password
        );
        
        return successResponse(res, null, 'Password changed successfully');
    })
);

module.exports = router;
