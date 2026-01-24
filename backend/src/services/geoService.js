/**
 * Geo-Fencing Service
 * MongoDB geospatial queries for ward detection and duplicate checking
 */

const Ward = require('../models/Ward');
const Issue = require('../models/Issue');
const logger = require('../utils/logger');
const { GEO_CONFIG, DUPLICATE_DETECTION } = require('../core/constants');
const { validateCoordinates } = require('../utils/validation');

/**
 * Get ward from coordinates using database lookup
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object|null>} Ward object or null
 */
async function getWardFromCoordinates(latitude, longitude) {
    try {
        // Validate coordinates
        const validation = validateCoordinates(latitude, longitude);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Use MongoDB $geoWithin to find which ward polygon contains the point
        const ward = await Ward.findOne({
            boundary: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude] // GeoJSON is [lng, lat]
                    }
                }
            }
        }).lean();

        if (!ward) {
            logger.warn(`No ward found for coordinates: ${latitude}, ${longitude}`);
            return null;
        }

        logger.info(`Ward ${ward.ward_number} (${ward.ward_name}) found for coordinates: ${latitude}, ${longitude}`);

        return ward;

    } catch (error) {
        logger.error('Error getting ward from coordinates:', error);
        throw error;
    }
}

/**
 * Check for duplicate issues nearby
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} issueTypeId - Issue type UUID
 * @param {Date} submittedAt - Submission time
 * @returns {Promise<Array>} Array of duplicate issues
 */
async function checkDuplicateIssues(latitude, longitude, issueTypeId, submittedAt = new Date()) {
    try {
        // Validate coordinates
        const validation = validateCoordinates(latitude, longitude);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Check for nearby issues using MongoDB $nearSphere
        const radiusMeters = 100; // 100 meters radius
        const oneHourAgo = new Date(submittedAt.getTime() - 60 * 60 * 1000);

        const duplicates = await Issue.find({
            issue_type: issueTypeId,
            created_at: { $gt: oneHourAgo },
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radiusMeters
                }
            }
        }).limit(10).lean();

        if (duplicates.length > 0) {
            logger.info(`Found ${duplicates.length} duplicate issues within ${radiusMeters}m`);
        }

        return duplicates;

    } catch (error) {
        logger.error('Error checking duplicate issues:', error);
        throw error;
    }
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {Promise<number>} Distance in meters
 */
async function calculateDistancePostGIS(lat1, lon1, lat2, lon2) {
    try {
        // Haversine formula
        const R = 6371000; // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;

    } catch (error) {
        logger.error('Error calculating distance:', error);
        throw error;
    }
}

/**
 * Find issues within radius
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusMeters - Radius in meters
 * @param {Object} filters - Additional filters (issue_type, status)
 * @returns {Promise<Array>} Issues within radius
 */
async function findIssuesWithinRadius(latitude, longitude, radiusMeters, filters = {}) {
    try {
        // Validate coordinates
        const validation = validateCoordinates(latitude, longitude);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const query = {
            location: {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radiusMeters
                }
            }
        };

        // Add filters
        if (filters.issue_type) {
            query.issue_type = filters.issue_type;
        }

        if (filters.status) {
            query.status = filters.status;
        }

        const issues = await Issue.find(query)
            .populate('assigned_to', 'username email')
            .populate('ward_id', 'ward_number ward_name')
            .lean();

        return issues;

    } catch (error) {
        logger.error('Error finding issues within radius:', error);
        throw error;
    }
}

/**
 * Get all wards
 * @returns {Promise<Array>} All wards
 */
async function getAllWards() {
    try {
        const wards = await Ward.find({})
            .sort({ ward_number: 1 })
            .lean();

        return wards;

    } catch (error) {
        logger.error('Error getting all wards:', error);
        throw error;
    }
}

/**
 * Get ward by ID
 * @param {string} wardId - Ward UUID
 * @returns {Promise<Object|null>} Ward object or null
 */
async function getWardById(wardId) {
    try {
        const ward = await Ward.findById(wardId).lean();

        if (!ward) {
            logger.warn(`Ward not found: ${wardId}`);
            return null;
        }

        return ward;

    } catch (error) {
        logger.error('Error getting ward by ID:', error);
        throw error;
    }
}

/**
 * Get ward statistics
 * @param {string} wardId - Ward UUID (optional)
 * @returns {Promise<Array>} Ward statistics
 */
async function getWardStatistics(wardId = null) {
    try {
        const matchStage = wardId ? { ward_id: wardId } : {};

        const stats = await Issue.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$ward_id',
                    total_issues: { $sum: 1 },
                    pending_issues: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    in_progress_issues: {
                        $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                    },
                    resolved_issues: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'wards',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'ward'
                }
            },
            { $unwind: { path: '$ward', preserveNullAndEmptyArrays: true } },
            { $sort: { total_issues: -1 } }
        ]);

        return stats;

    } catch (error) {
        logger.error('Error getting ward statistics:', error);
        throw error;
    }
}

/**
 * Check if point is within ward boundary
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {string} wardId - Ward UUID
 * @returns {Promise<boolean>} True if point is within ward
 */
async function isPointInWard(latitude, longitude, wardId) {
    try {
        const ward = await Ward.findOne({
            _id: wardId,
            boundary: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    }
                }
            }
        });

        return !!ward;

    } catch (error) {
        logger.error('Error checking point in ward:', error);
        throw error;
    }
}

/**
 * Get nearest ward to coordinates
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object|null>} Nearest ward
 */
async function getNearestWard(latitude, longitude) {
    try {
        // Find ward whose boundary is closest to the point
        const wards = await Ward.find({}).lean();
        
        if (wards.length === 0) return null;
        
        // Calculate distance to each ward's centroid
        let nearestWard = null;
        let minDistance = Infinity;
        
        for (const ward of wards) {
            // Simple distance calculation
            const distance = Math.sqrt(
                Math.pow(ward.latitude - latitude, 2) + 
                Math.pow(ward.longitude - longitude, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestWard = ward;
            }
        }

        return nearestWard;

    } catch (error) {
        logger.error('Error getting nearest ward:', error);
        throw error;
    }
}

/**
 * Validate coordinates are within Vadodara city bounds
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} True if within bounds
 */
function isWithinVadodaraBounds(latitude, longitude) {
    return (
        latitude >= GEO_CONFIG.VADODARA_BOUNDS.LAT_MIN &&
        latitude <= GEO_CONFIG.VADODARA_BOUNDS.LAT_MAX &&
        longitude >= GEO_CONFIG.VADODARA_BOUNDS.LNG_MIN &&
        longitude <= GEO_CONFIG.VADODARA_BOUNDS.LNG_MAX
    );
}

module.exports = {
    getWardFromCoordinates,
    checkDuplicateIssues,
    calculateDistancePostGIS,
    findIssuesWithinRadius,
    getAllWards,
    getWardById,
    getWardStatistics,
    isPointInWard,
    getNearestWard,
    isWithinVadodaraBounds
};
