/**
 * Wards Routes
 */

const express = require('express');
const router = express.Router();
const geoService = require('../services/geoService');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');

/**
 * GET /api/wards
 * Get all wards
 */
router.get(
    '/',
    authenticate,
    asyncHandler(async (req, res) => {
        const wards = await geoService.getAllWards();
        
        return successResponse(res, wards, 'Wards retrieved successfully');
    })
);

/**
 * GET /api/wards/:id
 * Get ward by ID
 */
router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const ward = await geoService.getWardById(req.params.id);
        
        if (!ward) {
            return res.status(404).json({
                success: false,
                message: 'Ward not found'
            });
        }
        
        return successResponse(res, ward, 'Ward retrieved successfully');
    })
);

/**
 * GET /api/wards/:id/statistics
 * Get ward statistics
 */
router.get(
    '/:id/statistics',
    authenticate,
    asyncHandler(async (req, res) => {
        const stats = await geoService.getWardStatistics(req.params.id);
        
        return successResponse(res, stats, 'Ward statistics retrieved successfully');
    })
);

/**
 * GET /api/wards/locate
 * Get ward from coordinates
 */
router.get(
    '/locate/coordinates',
    authenticate,
    asyncHandler(async (req, res) => {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const ward = await geoService.getWardFromCoordinates(
            parseFloat(latitude),
            parseFloat(longitude)
        );

        if (!ward) {
            return res.status(404).json({
                success: false,
                message: 'No ward found for these coordinates'
            });
        }

        return successResponse(res, ward, 'Ward located successfully');
    })
);

module.exports = router;
