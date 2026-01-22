/**
 * Analytics Routes
 */

const express = require('express');
const router = express.Router();
const issueService = require('../services/issueService');
const workflowService = require('../services/workflowService');
const geoService = require('../services/geoService');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');
const { USER_ROLES } = require('../core/constants');

/**
 * GET /api/analytics/dashboard
 * Get dashboard statistics
 */
router.get(
    '/dashboard',
    authenticate,
    authorize(USER_ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        const stats = await issueService.getDashboardStats();
        
        return successResponse(res, stats, 'Dashboard statistics retrieved successfully');
    })
);

/**
 * GET /api/analytics/sla-breaches
 * Get SLA breach candidates
 */
router.get(
    '/sla-breaches',
    authenticate,
    authorize(USER_ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        const candidates = await workflowService.getSLABreachCandidates();
        
        return successResponse(res, candidates, 'SLA breach candidates retrieved successfully');
    })
);

/**
 * GET /api/analytics/wards
 * Get all ward statistics
 */
router.get(
    '/wards',
    authenticate,
    authorize(USER_ROLES.ADMIN),
    asyncHandler(async (req, res) => {
        const stats = await geoService.getWardStatistics();
        
        return successResponse(res, stats, 'Ward statistics retrieved successfully');
    })
);

module.exports = router;
