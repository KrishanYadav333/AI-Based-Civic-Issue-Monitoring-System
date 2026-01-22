/**
 * Issue Workflow Management
 * State machine for issue lifecycle
 */

const db = require('./database');
const logger = require('../utils/logger');
const { ISSUE_STATUS, USER_ROLES, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../core/constants');
const { isSLABreached } = require('../utils/helpers');

// Valid status transitions
const STATUS_TRANSITIONS = {
    [ISSUE_STATUS.PENDING]: [ISSUE_STATUS.ASSIGNED, ISSUE_STATUS.REJECTED],
    [ISSUE_STATUS.ASSIGNED]: [ISSUE_STATUS.IN_PROGRESS, ISSUE_STATUS.PENDING],
    [ISSUE_STATUS.IN_PROGRESS]: [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.ASSIGNED],
    [ISSUE_STATUS.RESOLVED]: [ISSUE_STATUS.CLOSED, ISSUE_STATUS.IN_PROGRESS],
    [ISSUE_STATUS.CLOSED]: [ISSUE_STATUS.IN_PROGRESS], // Allow reopening
    [ISSUE_STATUS.REJECTED]: [ISSUE_STATUS.PENDING] // Allow resubmission
};

/**
 * Validate status transition
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status
 * @returns {Object} Validation result
 */
function validateStatusTransition(currentStatus, newStatus) {
    if (currentStatus === newStatus) {
        return {
            valid: false,
            error: 'Status is already set to this value'
        };
    }
    
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
    
    if (!allowedTransitions) {
        return {
            valid: false,
            error: `Invalid current status: ${currentStatus}`
        };
    }
    
    if (!allowedTransitions.includes(newStatus)) {
        return {
            valid: false,
            error: `Cannot transition from ${currentStatus} to ${newStatus}`
        };
    }
    
    return { valid: true };
}

/**
 * Update issue status
 * @param {string} issueId - Issue UUID
 * @param {string} newStatus - New status
 * @param {string} userId - User ID making the change
 * @param {string} remarks - Optional remarks
 * @returns {Promise<Object>} Updated issue
 */
async function updateIssueStatus(issueId, newStatus, userId, remarks = null) {
    try {
        // Get current issue
        const issue = await db.findOne('issues', { id: issueId });
        
        if (!issue) {
            throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
        }
        
        // Validate transition
        const validation = validateStatusTransition(issue.status, newStatus);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        // Update in transaction
        const result = await db.transaction(async (client) => {
            // Update issue status
            const updateResult = await client.query(
                `UPDATE issues 
                 SET status = $1, updated_at = NOW()
                 WHERE id = $2
                 RETURNING *`,
                [newStatus, issueId]
            );
            
            // Record history
            await client.query(
                `INSERT INTO issue_history 
                 (issue_id, status, changed_by, remarks)
                 VALUES ($1, $2, $3, $4)`,
                [issueId, newStatus, userId, remarks]
            );
            
            // Update metrics if resolved
            if (newStatus === ISSUE_STATUS.RESOLVED) {
                const slaBreached = isSLABreached(
                    issue.submitted_at,
                    issue.priority,
                    newStatus
                );
                
                await client.query(
                    `INSERT INTO issue_metrics 
                     (issue_id, resolved_at, sla_breached)
                     VALUES ($1, NOW(), $2)
                     ON CONFLICT (issue_id) 
                     DO UPDATE SET resolved_at = NOW(), sla_breached = $2`,
                    [issueId, slaBreached]
                );
            }
            
            return updateResult.rows[0];
        });
        
        logger.info(`Issue ${issueId} status updated: ${issue.status} → ${newStatus}`);
        
        return result;
        
    } catch (error) {
        logger.error('Error updating issue status:', error);
        throw error;
    }
}

/**
 * Assign issue to engineer
 * @param {string} issueId - Issue UUID
 * @param {string} engineerId - Engineer user UUID
 * @param {string} assignedBy - User ID assigning the issue
 * @returns {Promise<Object>} Updated issue
 */
async function assignIssue(issueId, engineerId, assignedBy) {
    try {
        // Get issue
        const issue = await db.findOne('issues', { id: issueId });
        
        if (!issue) {
            throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
        }
        
        // Verify engineer exists and has correct role
        const engineer = await db.findOne('users', { id: engineerId });
        
        if (!engineer) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        
        if (engineer.role !== USER_ROLES.ENGINEER) {
            throw new Error('User is not an engineer');
        }
        
        // Update in transaction
        const result = await db.transaction(async (client) => {
            // Assign engineer
            const updateResult = await client.query(
                `UPDATE issues 
                 SET assigned_to = $1, 
                     status = $2, 
                     updated_at = NOW()
                 WHERE id = $3
                 RETURNING *`,
                [engineerId, ISSUE_STATUS.ASSIGNED, issueId]
            );
            
            // Record history
            await client.query(
                `INSERT INTO issue_history 
                 (issue_id, status, changed_by, remarks)
                 VALUES ($1, $2, $3, $4)`,
                [
                    issueId,
                    ISSUE_STATUS.ASSIGNED,
                    assignedBy,
                    `Assigned to engineer: ${engineer.username}`
                ]
            );
            
            return updateResult.rows[0];
        });
        
        logger.info(`Issue ${issueId} assigned to engineer ${engineerId}`);
        
        return result;
        
    } catch (error) {
        logger.error('Error assigning issue:', error);
        throw error;
    }
}

/**
 * Reject issue
 * @param {string} issueId - Issue UUID
 * @param {string} rejectedBy - User ID rejecting the issue
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Updated issue
 */
async function rejectIssue(issueId, rejectedBy, reason) {
    try {
        if (!reason) {
            throw new Error('Rejection reason is required');
        }
        
        return await updateIssueStatus(
            issueId,
            ISSUE_STATUS.REJECTED,
            rejectedBy,
            `Rejected: ${reason}`
        );
        
    } catch (error) {
        logger.error('Error rejecting issue:', error);
        throw error;
    }
}

/**
 * Resolve issue
 * @param {string} issueId - Issue UUID
 * @param {string} resolvedBy - User ID resolving the issue
 * @param {string} resolutionNotes - Resolution notes
 * @returns {Promise<Object>} Updated issue
 */
async function resolveIssue(issueId, resolvedBy, resolutionNotes) {
    try {
        if (!resolutionNotes) {
            throw new Error('Resolution notes are required');
        }
        
        return await updateIssueStatus(
            issueId,
            ISSUE_STATUS.RESOLVED,
            resolvedBy,
            `Resolved: ${resolutionNotes}`
        );
        
    } catch (error) {
        logger.error('Error resolving issue:', error);
        throw error;
    }
}

/**
 * Close issue
 * @param {string} issueId - Issue UUID
 * @param {string} closedBy - User ID closing the issue
 * @param {string} remarks - Optional closing remarks
 * @returns {Promise<Object>} Updated issue
 */
async function closeIssue(issueId, closedBy, remarks = 'Issue verified and closed') {
    try {
        return await updateIssueStatus(
            issueId,
            ISSUE_STATUS.CLOSED,
            closedBy,
            remarks
        );
        
    } catch (error) {
        logger.error('Error closing issue:', error);
        throw error;
    }
}

/**
 * Get issue history
 * @param {string} issueId - Issue UUID
 * @returns {Promise<Array>} Issue history
 */
async function getIssueHistory(issueId) {
    try {
        const result = await db.query(
            `SELECT 
                h.*,
                u.username,
                u.role
             FROM issue_history h
             LEFT JOIN users u ON h.changed_by = u.id
             WHERE h.issue_id = $1
             ORDER BY h.changed_at ASC`,
            [issueId]
        );
        
        return result.rows;
        
    } catch (error) {
        logger.error('Error getting issue history:', error);
        throw error;
    }
}

/**
 * Get issues assigned to engineer
 * @param {string} engineerId - Engineer UUID
 * @param {string} status - Optional status filter
 * @returns {Promise<Array>} Assigned issues
 */
async function getEngineerIssues(engineerId, status = null) {
    try {
        let sql = `
            SELECT i.*,
                   it.name as issue_type_name,
                   it.department,
                   w.ward_number,
                   w.name as ward_name
            FROM issues i
            LEFT JOIN issue_types it ON i.issue_type_id = it.id
            LEFT JOIN wards w ON i.ward_id = w.id
            WHERE i.assigned_to = $1
        `;
        
        const params = [engineerId];
        
        if (status) {
            sql += ' AND i.status = $2';
            params.push(status);
        }
        
        sql += ' ORDER BY i.priority DESC, i.submitted_at ASC';
        
        const result = await db.query(sql, params);
        return result.rows;
        
    } catch (error) {
        logger.error('Error getting engineer issues:', error);
        throw error;
    }
}

/**
 * Get SLA breach candidates
 * @returns {Promise<Array>} Issues at risk of SLA breach
 */
async function getSLABreachCandidates() {
    try {
        const result = await db.query(`
            SELECT i.*,
                   it.name as issue_type_name,
                   it.department,
                   w.ward_number,
                   u.username as assigned_to_username,
                   EXTRACT(EPOCH FROM (NOW() - i.submitted_at))/60 as elapsed_minutes
            FROM issues i
            LEFT JOIN issue_types it ON i.issue_type_id = it.id
            LEFT JOIN wards w ON i.ward_id = w.id
            LEFT JOIN users u ON i.assigned_to = u.id
            WHERE i.status NOT IN ($1, $2, $3)
        `, [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED, ISSUE_STATUS.REJECTED]);
        
        // Filter SLA breach candidates
        const candidates = result.rows.filter(issue => {
            return isSLABreached(
                issue.submitted_at,
                issue.priority,
                issue.status
            );
        });
        
        return candidates;
        
    } catch (error) {
        logger.error('Error getting SLA breach candidates:', error);
        throw error;
    }
}

/**
 * Accept issue (engineer accepts assignment)
 * @param {string} issueId - Issue UUID
 * @param {string} engineerId - Engineer UUID
 * @returns {Promise<Object>} Updated issue
 */
async function acceptIssue(issueId, engineerId) {
    try {
        const issue = await db.findOne('issues', { id: issueId });
        
        if (!issue) {
            throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
        }
        
        // Verify engineer is assigned
        if (issue.assigned_to !== engineerId) {
            throw new Error('Issue is not assigned to this engineer');
        }
        
        // Update to in_progress
        return await updateIssueStatus(
            issueId,
            ISSUE_STATUS.IN_PROGRESS,
            engineerId,
            'Engineer accepted and started working on issue'
        );
        
    } catch (error) {
        logger.error('Error accepting issue:', error);
        throw error;
    }
}

/**
 * Reopen closed issue
 * @param {string} issueId - Issue UUID
 * @param {string} reopenedBy - User ID reopening the issue
 * @param {string} reason - Reason for reopening
 * @returns {Promise<Object>} Updated issue
 */
async function reopenIssue(issueId, reopenedBy, reason) {
    try {
        if (!reason) {
            throw new Error('Reason for reopening is required');
        }
        
        const issue = await db.findOne('issues', { id: issueId });
        
        if (!issue) {
            throw new Error(ERROR_MESSAGES.ISSUE_NOT_FOUND);
        }
        
        if (issue.status !== ISSUE_STATUS.CLOSED && issue.status !== ISSUE_STATUS.REJECTED) {
            throw new Error('Only closed or rejected issues can be reopened');
        }
        
        const newStatus = issue.status === ISSUE_STATUS.CLOSED 
            ? ISSUE_STATUS.IN_PROGRESS 
            : ISSUE_STATUS.PENDING;
        
        return await updateIssueStatus(
            issueId,
            newStatus,
            reopenedBy,
            `Issue reopened: ${reason}`
        );
        
    } catch (error) {
        logger.error('Error reopening issue:', error);
        throw error;
    }
}

/**
 * Auto-assign issue to engineer with load balancing
 * @param {string} issueId - Issue UUID
 * @param {string} wardId - Ward UUID
 * @param {string} assignedBy - User ID assigning the issue
 * @returns {Promise<Object>} Updated issue
 */
async function autoAssignIssue(issueId, wardId, assignedBy) {
    try {
        // Get all engineers for this ward
        const engineers = await db.query(
            `SELECT u.id, u.username,
                    COUNT(i.id) as current_load
             FROM users u
             LEFT JOIN issues i ON i.assigned_to = u.id 
                  AND i.status NOT IN ($1, $2, $3)
             WHERE u.role = $4 
                  AND (u.ward_id = $5 OR u.ward_id IS NULL)
             GROUP BY u.id, u.username
             ORDER BY current_load ASC, RANDOM()
             LIMIT 1`,
            [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED, ISSUE_STATUS.REJECTED, USER_ROLES.ENGINEER, wardId]
        );
        
        if (engineers.rows.length === 0) {
            // No ward-specific engineer, get any available engineer
            const anyEngineer = await db.query(
                `SELECT u.id, u.username,
                        COUNT(i.id) as current_load
                 FROM users u
                 LEFT JOIN issues i ON i.assigned_to = u.id 
                      AND i.status NOT IN ($1, $2, $3)
                 WHERE u.role = $4
                 GROUP BY u.id, u.username
                 ORDER BY current_load ASC, RANDOM()
                 LIMIT 1`,
                [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED, ISSUE_STATUS.REJECTED, USER_ROLES.ENGINEER]
            );
            
            if (anyEngineer.rows.length === 0) {
                throw new Error('No engineers available for assignment');
            }
            
            const engineer = anyEngineer.rows[0];
            logger.info(`Auto-assigning to engineer ${engineer.username} (load: ${engineer.current_load})`);
            return await assignIssue(issueId, engineer.id, assignedBy);
        }
        
        const engineer = engineers.rows[0];
        logger.info(`Auto-assigning to ward engineer ${engineer.username} (load: ${engineer.current_load})`);
        return await assignIssue(issueId, engineer.id, assignedBy);
        
    } catch (error) {
        logger.error('Error auto-assigning issue:', error);
        throw error;
    }
}

module.exports = {
    validateStatusTransition,
    updateIssueStatus,
    assignIssue,
    autoAssignIssue,
    acceptIssue,
    rejectIssue,
    resolveIssue,
    closeIssue,
    reopenIssue,
    getIssueHistory,
    getEngineerIssues,
    getSLABreachCandidates,
    STATUS_TRANSITIONS
};
