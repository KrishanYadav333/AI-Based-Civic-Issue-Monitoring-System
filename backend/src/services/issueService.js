/**
 * Issue Service
 * Core business logic for issue management
 */

const Issue = require('../models/Issue');
const IssueType = require('../models/IssueType');
const IssueLog = require('../models/IssueLog');
const User = require('../models/User');
const Ward = require('../models/Ward');
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
        const issueType = await IssueType.findOne({
            name: selectedIssueTypeCode
        }).lean();

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
                wardId: ward._id,
                timeOfDay: new Date().getHours()
            }
        );

        // Generate issue number (format: VMC-YYYYMMDD-XXXX)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const issueNumber = `VMC-${dateStr}-${randomSuffix}`;

        // Create issue
        const newIssue = await Issue.create({
            issue_number: issueNumber,
            latitude,
            longitude,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            ward_id: ward._id,
            issue_type: issueType.name,
            department: issueType.department || 'General',
            priority,
            status: ISSUE_STATUS.PENDING,
            image_url,
            description: description || null,
            reporter_id: surveyor_id,
            ai_confidence: processedClassification.confidence
        });

        // Record initial log
        await IssueLog.create({
            issue_id: newIssue._id,
            action: 'created',
            status: ISSUE_STATUS.PENDING,
            changed_by: surveyor_id,
            remarks: 'Issue submitted'
        });

        logger.info(`Issue created successfully: ${newIssue.issue_number}`);

        return {
            duplicate: false,
            issue: newIssue.toObject(),
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
        const issue = await Issue.findById(issueId)
            .populate('ward_id', 'ward_number ward_name')
            .populate('reporter_id', 'username email')
            .populate('assigned_to', 'username email')
            .lean();

        if (!issue) {
            return null;
        }

        // Get history logs
        const logs = await IssueLog.find({ issue_id: issueId })
            .populate('changed_by', 'username')
            .sort({ created_at: -1 })
            .lean();
        issue.history = logs;

        // Calculate SLA status
        issue.sla_breached = isSLABreached(
            issue.created_at,
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

        const skip = (page - 1) * limit;

        // Build query
        const query = {};

        // Apply filters
        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.priority) {
            query.priority = filters.priority;
        }

        if (filters.ward_id) {
            query.ward_id = filters.ward_id;
        }

        if (filters.issue_type) {
            query.issue_type = filters.issue_type;
        }

        if (filters.assigned_to) {
            query.assigned_to = filters.assigned_to;
        }

        if (filters.submitted_by) {
            query.reporter_id = filters.submitted_by;
        }

        // Count total
        const total = await Issue.countDocuments(query);

        // Build sort
        const sortBy = filters.sortBy || 'created_at';
        const order = filters.order || 'DESC';
        const sort = { [sortBy]: order === 'DESC' ? -1 : 1 };

        // Execute query
        const issues = await Issue.find(query)
            .populate('ward_id', 'ward_number ward_name')
            .populate('reporter_id', 'username email')
            .populate('assigned_to', 'username email')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        return formatPaginatedResponse(issues, page, limit, total);

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
        const allowedFields = ['description', 'priority', 'status'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });

        if (Object.keys(updateData).length === 0) {
            throw new Error('No valid fields to update');
        }

        const issue = await Issue.findByIdAndUpdate(
            issueId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!issue) {
            throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
        }

        // Log the update
        await IssueLog.create({
            issue_id: issueId,
            action: 'updated',
            status: issue.status,
            changed_by: userId,
            remarks: `Updated: ${Object.keys(updateData).join(', ')}`
        });

        logger.info(`Issue ${issueId} updated by user ${userId}`);

        return issue;

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

        // Build base query from filters
        const matchQuery = {};
        if (filters.ward_id) matchQuery.ward_id = filters.ward_id;
        if (filters.assigned_to) matchQuery.assigned_to = filters.assigned_to;

        // Total issues
        stats.total_issues = await Issue.countDocuments(matchQuery);

        // Issues by status
        const statusAgg = await Issue.aggregate([
            { $match: matchQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        stats.by_status = statusAgg.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // Issues by priority
        const priorityAgg = await Issue.aggregate([
            { $match: matchQuery },
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);
        stats.by_priority = priorityAgg.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // SLA compliance (simplified - calculate based on creation date vs current date)
        const allIssues = await Issue.find(matchQuery, 'created_at priority status').lean();
        let compliant = 0;
        let breached = 0;
        allIssues.forEach(issue => {
            const slaBreached = isSLABreached(issue.created_at, issue.priority, issue.status);
            if (slaBreached) breached++;
            else compliant++;
        });
        stats.sla_compliance = { compliant, breached };

        // Recent issues (last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        stats.recent_24h = await Issue.countDocuments({
            ...matchQuery,
            created_at: { $gte: oneDayAgo }
        });

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
