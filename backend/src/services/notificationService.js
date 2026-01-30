/**
 * Notification Service
 * Handles In-App, Email, and Push Notifications
 */

const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// NOTIFICATION TYPES
const TYPES = {
    ISSUE_ASSIGNED: 'issue_assigned',
    ISSUE_RESOLVED: 'issue_resolved',
    ISSUE_REJECTED: 'issue_rejected',
    PRIORITY_ESCALATED: 'priority_escalated',
    CIVIC_VOICE_ALERT: 'civic_voice_alert',
    SYSTEM_UPDATE: 'system_update',
    COMMENT_ADDED: 'comment_added',
    STATUS_UPDATED: 'status_updated'
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
        await Notification.create({
            user_id: userId,
            type,
            title,
            message,
            data,
            is_read: false
        });

        logger.info(`[NOTIFICATION] Sent to User ${userId}: ${title}`);

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
 * Notifconst User = require('../models/User');
        // Find all admins
        const admins = await User.find({ role: 'admin' });

        for (const admin of admins) {
            await sendNotification(
                admin._id,
                TYPES.PRIORITY_ESCALATED,
                '🚨 Metric Alarm: Civic Voice Escalation',
                `Issue #${issue.issue_number || issue._id} has received 50+ upvotes and is now CRITICAL. Immediate attention required.`,
                { issueId: issue._n(
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
        '🎉 Your Issue is Fixed!', || issue._id} (${issue.issue_type || issue.issue_type_code}) has been marked as Resolved by the engineering team. Please rate the quality.`,
        { issueId: issue._id, requestRating: true }
    );
}

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {boolean} unreadOnly - Filter unread only
 */
async function getUserNotifications(userId, unreadOnly = false) {
    try {
        const query = { user_id: userId };
        
        if (unreadOnly) {
            query.is_read = false;
        }
        
        const notifications = await Notification.find(query)
            .sort({ created_at: -1 })
            .limit(50)
            .lean();
        
        // Add time ago for each notification
        const notificationsWithTime = notifications.map(n => ({
            ...n,
            id: n._id,
            read: n.is_read,
            time: getTimeAgo(n.created_at)
        }));
        
        return {
            notifications: notificationsWithTime,
            total: notificationsWithTime.length,
            unread: notificationsWithTime.filter(n => !n.read).length
        };
    } catch (error) {
        logger.error('Error fetching notifications:', error);
        throw error;
    }
}

/**
 * Helper function to get time ago string
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for security)
 */
async function markAsRead(notificationId, userId) {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user_id: userId },
            { is_read: true },
            { new: true }
        );
        
        if (!notification) {
            throw new Error('Notification not found or unauthorized');
        }
        
        return notification;
    } catch (error) {
        logger.error('Error marking notification as read:', error);
        throw error;
    }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 */
async function markAllAsRead(userId) {
    try {
        const result = await Notification.updateMany(
            { user_id: userId, is_read: false },
            { is_read: true }
        );
        
        return result.modifiedCount
        return result.rows.length;
    } catch (error) {
        logger.error('Error marking all as read:', error);
        throw error;
    }
}

module.exports = {
    TYPES,
    sendNotification,
    notifyAdminOfEscalation,
    notifyComplainantResolution,
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
