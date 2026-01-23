/**
 * Issues Routes
 */

const express = require('express');
const router = express.Router();
const issueService = require('../services/issueService');
const workflowService = require('../services/workflowService');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBody } = require('../middleware/validation');
const { successResponse, createdResponse } = require('../utils/response');
const { USER_ROLES } = require('../core/constants');
const { validateCoordinates } = require('../utils/validation');

/**
 * POST /api/issues
 * Submit a new issue
 */
router.post(
    '/',
    authenticate,
    validateBody({
        latitude: {
            required: true,
            type: 'number',
            validate: (val) => validateCoordinates(val, 0).valid || 'Invalid latitude'
        },
        longitude: {
            required: true,
            type: 'number',
            validate: (val) => validateCoordinates(0, val).valid || 'Invalid longitude'
        },
        image_url: {
            required: true,
            type: 'string'
        },
        description: {
            required: false,
            type: 'string'
        }
    }),
    asyncHandler(async (req, res) => {
        const data = {
            ...req.body,
            submitted_by: req.user.id
        };
        
        const result = await issueService.submitIssue(data);
        
        if (result.duplicate) {
            return successResponse(res, result, result.message);
        }
        
        return createdResponse(res, result.issue, result.message);
    })
);

/**
 * GET /api/issues
 * Get all issues with filters
 */
router.get(
    '/',
    authenticate,
    asyncHandler(async (req, res) => {
        const filters = {
            status: req.query.status,
            priority: req.query.priority,
            ward_id: req.query.ward_id,
            issue_type_id: req.query.issue_type_id,
            assigned_to: req.query.assigned_to,
            submitted_by: req.query.submitted_by,
            sortBy: req.query.sortBy,
            order: req.query.order
        };
        
        const pagination = {
            page: req.query.page,
            limit: req.query.limit
        };
        
        const result = await issueService.getIssues(filters, pagination);
        
        return successResponse(res, result, 'Issues retrieved successfully');
    })
);

/**
 * GET /api/issues/nearby
 * Get issues near location
 */
router.get(
    '/nearby',
    authenticate,
    asyncHandler(async (req, res) => {
        const { latitude, longitude, radius } = req.query;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }
        
        const radiusMeters = parseInt(radius) || 1000;
        
        const issues = await issueService.getIssuesNearLocation(
            parseFloat(latitude),
            parseFloat(longitude),
            radiusMeters
        );
        
        return successResponse(res, issues, 'Nearby issues retrieved successfully');
    })
);

/**
 * GET /api/issues/:id
 * Get issue by ID
 */
router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const issue = await issueService.getIssueById(req.params.id);
        
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue not found'
            });
        }
        
        return successResponse(res, issue, 'Issue retrieved successfully');
    })
);

/**
 * PATCH /api/issues/:id
 * Update issue details
 */
router.patch(
    '/:id',
    authenticate,
    authorize(USER_ROLES.ADMIN, USER_ROLES.ENGINEER),
    asyncHandler(async (req, res) => {
        const updatedIssue = await issueService.updateIssue(
            req.params.id,
            req.body,
            req.user.id
        );
        
        return successResponse(res, updatedIssue, 'Issue updated successfully');
    })
);

/**
 * POST /api/issues/:id/assign
 * Assign issue to engineer
 */
router.post(
    '/:id/assign',
    authenticate,
    authorize(USER_ROLES.ADMIN),
    validateBody({
        engineer_id: {
            required: true,
            type: 'string'
        }
    }),
    asyncHandler(async (req, res) => {
        const updatedIssue = await workflowService.assignIssue(
            req.params.id,
            req.body.engineer_id,
            req.user.id
        );
        
        return successResponse(res, updatedIssue, 'Issue assigned successfully');
    })
);

/**
 * POST /api/issues/:id/status
 * Update issue status
 */
router.post(
    '/:id/status',
    authenticate,
    authorize(USER_ROLES.ADMIN, USER_ROLES.ENGINEER),
    validateBody({
        status: {
            required: true,
            type: 'string'
        },
        remarks: {
            required: false,
            type: 'string'
        }
    }),
    asyncHandler(async (req, res) => {
        const updatedIssue = await workflowService.updateIssueStatus(
            req.params.id,
            req.body.status,
            req.user.id,
            req.body.remarks
        );
        
        return successResponse(res, updatedIssue, 'Issue status updated successfully');
    })
);

/**
 * POST /api/issues/:id/resolve
 * Resolve issue
 */
router.post(
    '/:id/resolve',
    authenticate,
    authorize(USER_ROLES.ENGINEER),
    validateBody({
        resolution_notes: {
            required: true,
            type: 'string'
        }
    }),
    asyncHandler(async (req, res) => {
        const updatedIssue = await workflowService.resolveIssue(
            req.params.id,
            req.user.id,
            req.body.resolution_notes
        );
        
        return successResponse(res, updatedIssue, 'Issue resolved successfully');
    })
);

/**
 * POST /api/issues/:id/reject
 * Reject issue
 */
router.post(
    '/:id/reject',
    authenticate,
    authorize(USER_ROLES.ADMIN),
    validateBody({
        reason: {
            required: true,
            type: 'string'
        }
    }),
    asyncHandler(async (req, res) => {
        const updatedIssue = await workflowService.rejectIssue(
            req.params.id,
            req.user.id,
            req.body.reason
        );
        
        return successResponse(res, updatedIssue, 'Issue rejected successfully');
    })
);

/**
 * POST /api/issues/:id/accept
 * Engineer accepts assigned issue
 */
router.post(
    '/:id/accept',
    authenticate,
    authorize(USER_ROLES.ENGINEER),
    asyncHandler(async (req, res) => {
        const updatedIssue = await workflowService.acceptIssue(
            req.params.id,
            req.user.id
        );
        
        return successResponse(res, updatedIssue, 'Issue accepted successfully');
    })
);

/**
 * POST /api/issues/:id/reopen
 * Reopen closed or rejected issue
 */
router.post(
    '/:id/reopen',
    authenticate,
    validateBody({
        reason: {
            required: true,
            type: 'string'
        }
    }),
    asyncHandler(async (req, res) => {
        const updatedIssue = await workflowService.reopenIssue(
            req.params.id,
            req.user.id,
            req.body.reason
        );
        
        return successResponse(res, updatedIssue, 'Issue reopened successfully');
    })
);

/**
 * GET /api/issues/:id/history
 * Get issue history
 */
router.get(
    '/:id/history',
    authenticate,
    asyncHandler(async (req, res) => {
        const history = await workflowService.getIssueHistory(req.params.id);
        
        return successResponse(res, history, 'Issue history retrieved successfully');
    })
);

module.exports = router;
