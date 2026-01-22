/**
 * Notification Service
 * Handles FCM push notifications and email notifications
 */

const db = require('./database');
const logger = require('../utils/logger');
const { NOTIFICATION_TYPES } = require('../core/constants');
const { generateNotificationPayload } = require('../utils/helpers');

/**
 * Send notification to user
 * @param {string} userId - User UUID
 * @param {string} issueId - Issue UUID
 * @param {string} type - Notification type
 * @param {Object} data - Additional data
 * @returns {Promise<Object>} Created notification
 */
async function sendNotification(userId, issueId, type, data = {}) {
    try {
        // Generate notification payload
        const payload = generateNotificationPayload(type, data);
        
        // Create notification record
        const notification = await db.insert('notifications', {
            user_id: userId,
            issue_id: issueId,
            type,
            title: payload.title,
            message: payload.message,
            data: JSON.stringify(data),
            read: false
        });
        
        logger.info(`Notification created: ${type} for user ${userId}`);
        
        // TODO: Send FCM push notification
        // await sendFCMNotification(userId, payload);
        
        // TODO: Send email notification if enabled
        // await sendEmailNotification(userId, payload);
        
        return notification;
        
    } catch (error) {
        logger.error('Error sending notification:', error);
        throw error;
    }
}

/**
 * Send bulk notifications to multiple users
 * @param {Array} userIds - Array of user UUIDs
 * @param {string} issueId - Issue UUID
 * @param {string} type - Notification type
 * @param {Object} data - Additional data
 * @returns {Promise<Array>} Created notifications
 */
async function sendBulkNotifications(userIds, issueId, type, data = {}) {
    try {
        const notifications = await Promise.all(
            userIds.map(userId => sendNotification(userId, issueId, type, data))
        );
        
        logger.info(`Sent ${notifications.length} bulk notifications`);
        
        return notifications;
        
    } catch (error) {
        logger.error('Error sending bulk notifications:', error);
        throw error;
    }
}

/**
 * Notify issue submitted
 * @param {Object} issue - Issue object
 * @param {Object} ward - Ward object
 * @returns {Promise<void>}
 */
async function notifyIssueSubmitted(issue, ward) {
    try {
        // Notify all admins
        const admins = await db.query(
            `SELECT id FROM users WHERE role = 'admin'`
        );
        
        const adminIds = admins.rows.map(a => a.id);
        
        await sendBulkNotifications(
            adminIds,
            issue.id,
            NOTIFICATION_TYPES.ISSUE_SUBMITTED,
            {
                issue_number: issue.issue_number,
                ward_number: ward.ward_number,
                priority: issue.priority
            }
        );
        
    } catch (error) {
        logger.error('Error notifying issue submitted:', error);
    }
}

/**
 * Notify issue assigned
 * @param {Object} issue - Issue object
 * @param {string} engineerId - Engineer UUID
 * @returns {Promise<void>}
 */
async function notifyIssueAssigned(issue, engineerId) {
    try {
        await sendNotification(
            engineerId,
            issue.id,
            NOTIFICATION_TYPES.ISSUE_ASSIGNED,
            {
                issue_number: issue.issue_number,
                priority: issue.priority
            }
        );
        
    } catch (error) {
        logger.error('Error notifying issue assigned:', error);
    }
}

/**
 * Notify issue resolved
 * @param {Object} issue - Issue object
 * @returns {Promise<void>}
 */
async function notifyIssueResolved(issue) {
    try {
        // Notify submitter
        await sendNotification(
            issue.submitted_by,
            issue.id,
            NOTIFICATION_TYPES.ISSUE_RESOLVED,
            {
                issue_number: issue.issue_number
            }
        );
        
    } catch (error) {
        logger.error('Error notifying issue resolved:', error);
    }
}

/**
 * Notify SLA breach
 * @param {Object} issue - Issue object
 * @returns {Promise<void>}
 */
async function notifySLABreach(issue) {
    try {
        // Notify admins and assigned engineer
        const recipients = [issue.assigned_to];
        
        const admins = await db.query(
            `SELECT id FROM users WHERE role = 'admin'`
        );
        
        recipients.push(...admins.rows.map(a => a.id));
        
        await sendBulkNotifications(
            recipients.filter(Boolean),
            issue.id,
            NOTIFICATION_TYPES.SLA_BREACH,
            {
                issue_number: issue.issue_number,
                priority: issue.priority
            }
        );
        
    } catch (error) {
        logger.error('Error notifying SLA breach:', error);
    }
}

/**
 * Get user notifications
 * @param {string} userId - User UUID
 * @param {boolean} unreadOnly - Only unread notifications
 * @returns {Promise<Array>} Notifications
 */
async function getUserNotifications(userId, unreadOnly = false) {
    try {
        let sql = `
            SELECT n.*,
                   i.issue_number,
                   i.priority,
                   i.status
            FROM notifications n
            LEFT JOIN issues i ON n.issue_id = i.id
            WHERE n.user_id = $1
        `;
        
        const params = [userId];
        
        if (unreadOnly) {
            sql += ' AND n.read = false';
        }
        
        sql += ' ORDER BY n.created_at DESC LIMIT 50';
        
        const result = await db.query(sql, params);
        return result.rows;
        
    } catch (error) {
        logger.error('Error getting user notifications:', error);
        throw error;
    }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification UUID
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Updated notification
 */
async function markAsRead(notificationId, userId) {
    try {
        const result = await db.update(
            'notifications',
            { read: true, read_at: new Date() },
            { id: notificationId, user_id: userId }
        );
        
        if (result.length === 0) {
            throw new Error('Notification not found');
        }
        
        return result[0];
        
    } catch (error) {
        logger.error('Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Mark all notifications as read
 * @param {string} userId - User UUID
 * @returns {Promise<number>} Number of notifications marked
 */
async function markAllAsRead(userId) {
    try {
        const result = await db.query(
            `UPDATE notifications 
             SET read = true, read_at = NOW()
             WHERE user_id = $1 AND read = false`,
            [userId]
        );
        
        return result.rowCount;
        
    } catch (error) {
        logger.error('Error marking all notifications as read:', error);
        throw error;
    }
}

/**
 * Send FCM push notification (placeholder for future implementation)
 * @param {string} userId - User UUID
 * @param {Object} payload - Notification payload
 * @returns {Promise<void>}
 */
async function sendFCMNotification(userId, payload) {
    // TODO: Implement FCM integration
    // const fcmToken = await getUserFCMToken(userId);
    // await fcm.send({ token: fcmToken, notification: payload });
    logger.debug('FCM notification would be sent here', { userId, payload });
}

/**
 * Send email notification (placeholder for future implementation)
 * @param {string} userId - User UUID
 * @param {Object} payload - Notification payload
 * @returns {Promise<void>}
 */
async function sendEmailNotification(userId, payload) {
    // TODO: Implement email integration (SendGrid/Nodemailer)
    // const user = await db.findOne('users', { id: userId });
    // await sendEmail(user.email, payload.title, payload.message);
    logger.debug('Email notification would be sent here', { userId, payload });
}

module.exports = {
    sendNotification,
    sendBulkNotifications,
    notifyIssueSubmitted,
    notifyIssueAssigned,
    notifyIssueResolved,
    notifySLABreach,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
