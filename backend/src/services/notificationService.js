/**
 * Notification Service
 * Handles In-App, Email, and Push Notifications
 */

const db = require('./database');
const logger = require('../utils/logger');

// NOTIFICATION TYPES
const TYPES = {
    ISSUE_RESOLVED: 'issue_resolved',
    ISSUE_REJECTED: 'issue_rejected',
    PRIORITY_ESCALATED: 'priority_escalated',
    CIVIC_VOICE_ALERT: 'civic_voice_alert'
};

/**
 * Send a notification to a user
 * @param {string} userId - Recipient
 * @param {string} type - Notification Type
 * @param {string} title - Title
 * @param {string} message - Body
 * @param {Object} data - Metadata (e.g. issueId)
 */
async function sendNotification(userId, type, title, message, data = {}) {
    try {
        // 1. Save to Database (In-App History)
        await db.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, type, title, message, JSON.stringify(data)]
        );

        // 2. Mock Push Notification (Mobile)
        // In real app: firebase.send(user.fcmToken, ...)
        logger.info(`[PUSH] To User ${userId}: ${title} - ${message}`);

        // 3. Mock Email (if critical/resolved)
        // In real app: mailer.send(...)
        if (type === TYPES.ISSUE_RESOLVED || type === TYPES.PRIORITY_ESCALATED) {
            logger.info(`[EMAIL] To User ${userId}: ${title} - ${message}`);
        }

    } catch (error) {
        logger.error('Error sending notification:', error);
    }
}

/**
 * Notify Admin about Civic Voice Escalation
 * @param {Object} issue 
 */
async function notifyAdminOfEscalation(issue) {
    try {
        // Find all admins
        const admins = await db.query("SELECT id FROM users WHERE role = 'admin'");

        for (const admin of admins.rows) {
            await sendNotification(
                admin.id,
                TYPES.PRIORITY_ESCALATED,
                '🚨 Metric Alarm: Civic Voice Escalation',
                `Issue #${issue.issue_number} has received 50+ upvotes and is now CRITICAL. Immediate attention required.`,
                { issueId: issue.id }
            );
        }
    } catch (error) {
        logger.error('Error notifying admins:', error);
    }
}

/**
 * Notify Complainant about Resolution
 * @param {Object} issue 
 */
async function notifyComplainantResolution(issue) {
    if (!issue.submitted_by) return;

    await sendNotification(
        issue.submitted_by,
        TYPES.ISSUE_RESOLVED,
        '🎉 Your Issue is Fixed!',
        `Good news! Issue #${issue.issue_number} (${issue.issue_type_code}) has been marked as Resolved by the engineering team. Please rate the quality.`,
        { issueId: issue.id, requestRating: true }
    );
}

module.exports = {
    TYPES,
    sendNotification,
    notifyAdminOfEscalation,
    notifyComplainantResolution
};
