/**
 * Issue Service
 * Core business logic for issue management
 */

const db = require('./database');
const geoService = require('./geoService');
const aiService = require('./aiService');
const workflowService = require('./workflowService');
const logger = require('../utils/logger');
const {
    ISSUE_STATUS,
    ISSUE_TYPES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    DUPLICATE_DETECTION
} = require('../core/constants');
const {
    calculateIssuePriority,
    formatPaginatedResponse,
    isSLABreached
} = require('../utils/helpers');
const {
    validateCoordinates,
    validateIssueType,
    validatePagination,
    validateRequiredFields
} = require('../utils/validation');

/**
 * Submit a new issue
 * @param {Object} data - Issue data
 * @returns {Promise<Object>} Created issue
 */
async function submitIssue(data) {
    try {
        // Validate required fields
        const requiredFields = ['latitude', 'longitude', 'image_url', 'surveyor_id'];
        const fieldValidation = validateRequiredFields(data, requiredFields);
        if (!fieldValidation.valid) {
            throw new Error(fieldValidation.error);
        }

        const { latitude, longitude, image_url, surveyor_id, description } = data;

        // Validate coordinates
        const coordValidation = validateCoordinates(latitude, longitude);
        if (!coordValidation.valid) {
            throw new Error(coordValidation.error);
        }

        // Get ward from coordinates
        logger.info(`Getting ward for coordinates: ${latitude}, ${longitude}`);
        const ward = await geoService.getWardFromCoordinates(latitude, longitude);

        if (!ward) {
            throw new Error('Location is outside Vadodara city boundaries');
        }

        // Classify image with AI
        logger.info(`Classifying image: ${image_url}`);
        const classification = await aiService.classifyImageFromFile(image_url);
        const processedClassification = aiService.processClassificationResult(classification);

        // Use manual selection if provided, otherwise fallback to AI
        const selectedIssueTypeCode = data.issueType || processedClassification.issueType;

        // Get issue type from database
        const issueType = await db.findOne('issue_types', {
            code: selectedIssueTypeCode
        });

        if (!issueType) {
            throw new Error(`Issue type not found: ${selectedIssueTypeCode}`);
        }

        // Check for duplicate issues
        logger.info('Checking for duplicate issues...');
        const duplicates = await geoService.checkDuplicateIssues(
            latitude,
            longitude,
            issueType.id,
            new Date()
        );

        if (duplicates.length > 0) {
            logger.warn(`Found ${duplicates.length} duplicate issues`);

            // Return existing issue instead of creating duplicate
            return {
                duplicate: true,
                existing_issue: duplicates[0],
                message: `Similar issue already reported nearby (Issue #${duplicates[0].issue_number})`
            };
        }

        // Calculate priority
        const priority = calculateIssuePriority(
            processedClassification.issueType,
            processedClassification.confidence,
            {
                wardId: ward.id,
                timeOfDay: new Date().getHours()
            }
        );

        // Create issue in transaction
        const issue = await db.transaction(async (client) => {
            // Insert issue
            const insertResult = await client.query(
                `INSERT INTO issues (
                    location,
                    latitude,
                    longitude,
                    ward_id,
                    issue_type_id,
                    priority,
                    status,
                    image_url,
                    description,
                    surveyor_id,
                    ai_confidence,
                    ai_class
                ) VALUES (
                    ST_SetSRID(ST_MakePoint($1, $2), 4326),
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    $13
                ) RETURNING *`,
                [
                    longitude,
                    latitude,
                    latitude,
                    longitude,
                    ward.id,
                    issueType.id,
                    priority,
                    ISSUE_STATUS.PENDING,
                    image_url,
                    description || null,
                    surveyor_id,
                    processedClassification.confidence,
                    processedClassification.aiClass
                ]
            );

            const newIssue = insertResult.rows[0];

            // Record initial history
            await client.query(
                `INSERT INTO issue_history (issue_id, status, changed_by, remarks)
                 VALUES ($1, $2, $3, $4)`,
                [
                    newIssue.id,
                    ISSUE_STATUS.PENDING,
                    surveyor_id,
                    'Issue submitted'
                ]
            );

            // Create notification for admin
            await client.query(
                `INSERT INTO notifications (user_id, issue_id, type, message)
                 SELECT 
                    u.id,
                    $1,
                    'issue_submitted',
                    $2
                 FROM users u
                 WHERE u.role = 'admin'`,
                [
                    newIssue.id,
                    `New ${issueType.name} issue reported in Ward ${ward.ward_number}`
                ]
            );

            return newIssue;
        });

        logger.info(`Issue created successfully: ${issue.issue_number}`);

        return {
            duplicate: false,
            issue,
            ward,
            issue_type: issueType,
            classification: processedClassification,
            message: SUCCESS_MESSAGES.ISSUE_CREATED
        };

    } catch (error) {
        logger.error('Error submitting issue:', error);
        throw error;
    }
}

/**
 * Get issue by ID
 * @param {string} issueId - Issue UUID
 * @returns {Promise<Object|null>} Issue details
 */
async function getIssueById(issueId) {
    try {
        const result = await db.query(
            `SELECT 
                i.*,
                it.name as issue_type_name,
                it.code as issue_type_code,
                it.department,
                w.ward_number,
                w.ward_name,
                u_sub.username as submitted_by_username,
                u_sub.email as submitted_by_email,
                u_asn.username as assigned_to_username,
                u_asn.email as assigned_to_email,
                ST_AsGeoJSON(i.location) as location_geojson
             FROM issues i
             LEFT JOIN issue_types it ON i.issue_type_id = it.id
             LEFT JOIN wards w ON i.ward_id = w.id
             LEFT JOIN users u_sub ON i.surveyor_id = u_sub.id
             LEFT JOIN users u_asn ON i.engineer_id = u_asn.id
             WHERE i.id = $1`,
            [issueId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const issue = result.rows[0];

        // Get history
        issue.history = await workflowService.getIssueHistory(issueId);

        // Calculate SLA status
        issue.sla_breached = isSLABreached(
            issue.submitted_at,
            issue.priority,
            issue.status
        );

        return issue;

    } catch (error) {
        logger.error('Error getting issue by ID:', error);
        throw error;
    }
}

/**
 * Get issues with filters and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination options
 * @returns {Promise<Object>} Paginated issues
 */
async function getIssues(filters = {}, pagination = {}) {
    try {
        const { page = 1, limit = 20 } = validatePagination(
            pagination.page,
            pagination.limit
        );

        const offset = (page - 1) * limit;

        // Build query
        let sql = `
            SELECT 
                i.*,
                it.name as issue_type_name,
                it.code as issue_type_code,
                it.department,
                w.ward_number,
                w.ward_name,
                u_sub.username as submitted_by_username,
                u_asn.username as assigned_to_username
            FROM issues i
            LEFT JOIN issue_types it ON i.issue_type_id = it.id
            LEFT JOIN wards w ON i.ward_id = w.id
            LEFT JOIN users u_sub ON i.surveyor_id = u_sub.id
            LEFT JOIN users u_asn ON i.engineer_id = u_asn.id
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        // Apply filters
        if (filters.status) {
            sql += ` AND i.status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }

        if (filters.priority) {
            sql += ` AND i.priority = $${paramIndex}`;
            params.push(filters.priority);
            paramIndex++;
        }

        if (filters.ward_id) {
            sql += ` AND i.ward_id = $${paramIndex}`;
            params.push(filters.ward_id);
            paramIndex++;
        }

        if (filters.issue_type_id) {
            sql += ` AND i.issue_type_id = $${paramIndex}`;
            params.push(filters.issue_type_id);
            paramIndex++;
        }

        if (filters.assigned_to) {
            sql += ` AND i.engineer_id = $${paramIndex}`;
            params.push(filters.assigned_to);
            paramIndex++;
        }

        if (filters.submitted_by) {
            sql += ` AND i.surveyor_id = $${paramIndex}`;
            params.push(filters.submitted_by);
            paramIndex++;
        }

        // Count total
        const countSql = sql.replace(
            /SELECT.*FROM/s,
            'SELECT COUNT(*) FROM'
        );
        const countResult = await db.query(countSql, params);
        const total = parseInt(countResult.rows[0].count);

        // Add sorting
        const sortBy = filters.sortBy || 'submitted_at';
        const order = filters.order || 'DESC';
        sql += ` ORDER BY i.${sortBy} ${order}`;

        // Add pagination
        sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await db.query(sql, params);

        return formatPaginatedResponse(result.rows, page, limit, total);

    } catch (error) {
        logger.error('Error getting issues:', error);
        throw error;
    }
}

/**
 * Get issues near location
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} radiusMeters - Radius in meters
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Nearby issues
 */
async function getIssuesNearLocation(latitude, longitude, radiusMeters = 1000, filters = {}) {
    try {
        const issues = await geoService.findIssuesWithinRadius(
            latitude,
            longitude,
            radiusMeters,
            filters
        );

        return issues;

    } catch (error) {
        logger.error('Error getting issues near location:', error);
        throw error;
    }
}

/**
 * Update issue
 * @param {string} issueId - Issue UUID
 * @param {Object} data - Update data
 * @param {string} userId - User making the update
 * @returns {Promise<Object>} Updated issue
 */
async function updateIssue(issueId, data, userId) {
    try {
        const allowedFields = ['description', 'priority'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            throw new Error('No valid fields to update');
        }

        updateData.updated_at = new Date();

        const result = await db.update('issues', updateData, { id: issueId });

        if (result.length === 0) {
            throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
        }

        logger.info(`Issue ${issueId} updated by user ${userId}`);

        return result[0];

    } catch (error) {
        logger.error('Error updating issue:', error);
        throw error;
    }
}

/**
 * Get dashboard statistics
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Object>} Statistics
 */
async function getDashboardStats(filters = {}) {
    try {
        const stats = {};

        // Total issues
        stats.total_issues = await db.count('issues', filters);

        // Issues by status
        const statusResult = await db.query(
            `SELECT status, COUNT(*) as count
             FROM issues
             GROUP BY status`
        );
        stats.by_status = statusResult.rows.reduce((acc, row) => {
            acc[row.status] = parseInt(row.count);
            return acc;
        }, {});

        // Issues by priority
        const priorityResult = await db.query(
            `SELECT priority, COUNT(*) as count
             FROM issues
             GROUP BY priority`
        );
        stats.by_priority = priorityResult.rows.reduce((acc, row) => {
            acc[row.priority] = parseInt(row.count);
            return acc;
        }, {});

        // SLA compliance
        const slaResult = await db.query(
            `SELECT 
                COUNT(*) FILTER (WHERE sla_breached = false) as compliant,
                COUNT(*) FILTER (WHERE sla_breached = true) as breached
             FROM issue_metrics`
        );
        stats.sla_compliance = slaResult.rows[0] || { compliant: 0, breached: 0 };

        // Recent issues (last 24 hours)
        const recentResult = await db.query(
            `SELECT COUNT(*) as count
             FROM issues
             WHERE submitted_at >= NOW() - INTERVAL '24 hours'`
        );
        stats.recent_24h = parseInt(recentResult.rows[0].count);

        return stats;

    } catch (error) {
        logger.error('Error getting dashboard stats:', error);
        throw error;
    }
}

module.exports = {
    submitIssue,
    getIssueById,
    getIssues,
    getIssuesNearLocation,
    updateIssue,
    getDashboardStats
};
