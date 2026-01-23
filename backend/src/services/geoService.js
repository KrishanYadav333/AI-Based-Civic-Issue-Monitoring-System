/**
 * Geo-Fencing Service
 * PostGIS spatial queries for ward detection and duplicate checking
 */

const db = require('./database');
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

        // Since the actual DB uses boundary_json (JSONB) not PostGIS geometry,
        // we find the nearest ward by centroid distance as a fallback.
        // For a production system, you would parse boundary_json and do proper containment.
        const result = await db.query(`
            SELECT *,
                   SQRT(POWER(centroid_lat - $1, 2) + POWER(centroid_lng - $2, 2)) as distance
            FROM wards
            ORDER BY distance ASC
            LIMIT 1
        `, [latitude, longitude]);

        if (result.rows.length === 0) {
            logger.warn(`No ward found for coordinates: ${latitude}, ${longitude}`);
            return null;
        }

        const ward = result.rows[0];
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

        // Use a simple distance calculation (approximation using degrees)
        // 0.001 degree ~ 111 meters at equator. For ~100m radius, use ~0.0009
        const radiusDegrees = 0.001; // Approx 100m
        const oneHourAgo = new Date(submittedAt.getTime() - 60 * 60 * 1000);

        const result = await db.query(`
            SELECT i.*, 
                   SQRT(POWER(i.latitude - $1, 2) + POWER(i.longitude - $2, 2)) as distance_degrees
            FROM issues i
            WHERE i.issue_type_id = $3
              AND i.created_at > $4
              AND ABS(i.latitude - $1) < $5
              AND ABS(i.longitude - $2) < $5
              AND i.status NOT IN ('closed', 'rejected')
            ORDER BY distance_degrees ASC
            LIMIT 5
        `, [latitude, longitude, issueTypeId, oneHourAgo, radiusDegrees]);

        if (result.rows.length > 0) {
            logger.warn(`Found ${result.rows.length} potential duplicate issues nearby`);
        }

        return result.rows;

    } catch (error) {
        logger.error('Error checking duplicate issues:', error);
        throw error;
    }
}

/**
 * Calculate distance between two points using PostGIS
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {Promise<number>} Distance in meters
 */
async function calculateDistancePostGIS(lat1, lon1, lat2, lon2) {
    try {
        const result = await db.query(
            `SELECT ST_Distance(
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
            ) as distance`,
            [lon1, lat1, lon2, lat2]
        );

        return parseFloat(result.rows[0].distance);

    } catch (error) {
        logger.error('Error calculating distance with PostGIS:', error);
        throw error;
    }
}

/**
 * Find issues within radius
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusMeters - Radius in meters
 * @param {Object} filters - Additional filters (issue_type_id, status)
 * @returns {Promise<Array>} Issues within radius
 */
async function findIssuesWithinRadius(latitude, longitude, radiusMeters, filters = {}) {
    try {
        // Validate coordinates
        const validation = validateCoordinates(latitude, longitude);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        let sql = `
            SELECT i.*, 
                   ST_Distance(
                       i.location::geography,
                       ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                   ) as distance_meters
            FROM issues i
            WHERE ST_DWithin(
                i.location::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                $3
            )
        `;

        const params = [longitude, latitude, radiusMeters];
        let paramIndex = 4;

        // Add filters
        if (filters.issue_type_id) {
            sql += ` AND i.issue_type_id = $${paramIndex}`;
            params.push(filters.issue_type_id);
            paramIndex++;
        }

        if (filters.status) {
            sql += ` AND i.status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        sql += ' ORDER BY distance_meters ASC';

        const result = await db.query(sql, params);
        return result.rows;

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
        const result = await db.query(`
            SELECT 
                id,
                ward_number,
                name,
                ST_AsGeoJSON(boundary) as boundary_geojson,
                ST_AsGeoJSON(centroid) as centroid_geojson,
                ST_X(centroid) as centroid_longitude,
                ST_Y(centroid) as centroid_latitude,
                area_sq_km,
                population,
                created_at,
                updated_at
            FROM wards
            ORDER BY ward_number ASC
        `);

        return result.rows;

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
        const result = await db.query(`
            SELECT 
                id,
                ward_number,
                name,
                ST_AsGeoJSON(boundary) as boundary_geojson,
                ST_AsGeoJSON(centroid) as centroid_geojson,
                ST_X(centroid) as centroid_longitude,
                ST_Y(centroid) as centroid_latitude,
                area_sq_km,
                population,
                created_at,
                updated_at
            FROM wards
            WHERE id = $1
        `, [wardId]);

        return result.rows[0] || null;

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
        let sql = 'SELECT * FROM ward_statistics';
        const params = [];

        if (wardId) {
            sql += ' WHERE ward_id = $1';
            params.push(wardId);
        }

        sql += ' ORDER BY total_issues DESC';

        const result = await db.query(sql, params);
        return result.rows;

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
        const result = await db.query(`
            SELECT ST_Contains(
                boundary,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)
            ) as is_within
            FROM wards
            WHERE id = $3
        `, [longitude, latitude, wardId]);

        return result.rows[0]?.is_within || false;

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
        const result = await db.query(`
            SELECT 
                id,
                ward_number,
                name,
                ST_Distance(
                    centroid::geography,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) as distance_meters
            FROM wards
            ORDER BY distance_meters ASC
            LIMIT 1
        `, [longitude, latitude]);

        return result.rows[0] || null;

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
