/**
 * Users Routes
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const workflowService = require('../services/workflowService');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');
const { USER_ROLES } = require('../core/constants');

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get(
    '/',
    authenticate,
    authorize(USER_ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        const filters = {
            role: req.query.role,
            ward_id: req.query.ward_id
        };
        
        const users = await authService.getUsers(filters);
        
        return successResponse(res, users, 'Users retrieved successfully');
    })
);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get(
    '/:id',
    authenticate,
    authorize(USER_ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        const user = await authService.getUserById(req.params.id);
        
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
 * GET /api/users/:id/issues
 * Get issues assigned to engineer
 */
router.get(
    '/:id/issues',
    authenticate,
    asyncHandler(async (req, res) => {
        // Engineers can only see their own issues, admins can see anyone's
        if (req.user.role !== USER_ROLES.ADMIN && req.user.id !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden'
            });
        }
        
        const issues = await workflowService.getEngineerIssues(
            req.params.id,
            req.query.status
        );
        
        return successResponse(res, issues, 'Engineer issues retrieved successfully');
    })
);

/**
 * PATCH /api/users/:id
 * Update user (admin only)
 */
router.patch(
    '/:id',
    authenticate,
    authorize(USER_ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        const updatedUser = await authService.updateUser(req.params.id, req.body);
        
        return successResponse(res, updatedUser, 'User updated successfully');
    })
);

module.exports = router;
