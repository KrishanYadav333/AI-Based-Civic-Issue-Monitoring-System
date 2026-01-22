const admin = require('firebase-admin');
const logger = require('./logger');

// Initialize Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  logger.info('Firebase Admin SDK initialized');
} else {
  logger.warn('Firebase credentials not configured. Push notifications disabled.');
}

class PushNotificationService {
  /**
   * Send push notification to specific user
   * @param {number} userId - User ID
   * @param {Object} notification - Notification data
   */
  async sendToUser(userId, notification) {
    try {
      if (!serviceAccount) {
        logger.debug('Skipping push notification (Firebase not configured)');
        return;
      }

      const db = require('../config/database');
      
      // Get user's FCM tokens
      const result = await db.query(
        'SELECT fcm_token FROM user_devices WHERE user_id = $1 AND fcm_token IS NOT NULL',
        [userId]
      );

      if (result.rows.length === 0) {
        logger.debug('No FCM tokens found for user', { userId });
        return;
      }

      const tokens = result.rows.map(row => row.fcm_token);

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          type: notification.type,
          issueId: notification.issueId?.toString() || '',
          priority: notification.priority || '',
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        tokens: tokens
      };

      // Add Android-specific config
      message.android = {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'civic_issues',
          priority: notification.priority === 'high' ? 'max' : 'default'
        }
      };

      // Add iOS-specific config
      message.apns = {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            alert: {
              title: notification.title,
              body: notification.body
            }
          }
        }
      };

      const response = await admin.messaging().sendMulticast(message);

      logger.info('Push notifications sent', {
        userId,
        success: response.successCount,
        failure: response.failureCount
      });

      // Remove invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && 
              (resp.error.code === 'messaging/invalid-registration-token' ||
               resp.error.code === 'messaging/registration-token-not-registered')) {
            invalidTokens.push(tokens[idx]);
          }
        });

        if (invalidTokens.length > 0) {
          await db.query(
            'DELETE FROM user_devices WHERE fcm_token = ANY($1)',
            [invalidTokens]
          );
          logger.info('Removed invalid FCM tokens', { count: invalidTokens.length });
        }
      }

      return response;
    } catch (error) {
      logger.error('Error sending push notification', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Send push notification to multiple users
   * @param {Array<number>} userIds - Array of user IDs
   * @param {Object} notification - Notification data
   */
  async sendToMultipleUsers(userIds, notification) {
    const promises = userIds.map(userId => this.sendToUser(userId, notification));
    return Promise.allSettled(promises);
  }

  /**
   * Send push notification to all users with specific role
   * @param {string} role - User role
   * @param {Object} notification - Notification data
   */
  async sendToRole(role, notification) {
    try {
      const db = require('../config/database');
      
      const result = await db.query(
        'SELECT id FROM users WHERE role = $1',
        [role]
      );

      const userIds = result.rows.map(row => row.id);
      return this.sendToMultipleUsers(userIds, notification);
    } catch (error) {
      logger.error('Error sending push to role', { error: error.message, role });
      throw error;
    }
  }

  /**
   * Register FCM token for user device
   * @param {number} userId - User ID
   * @param {string} token - FCM token
   * @param {string} deviceId - Device identifier
   * @param {string} platform - 'android' or 'ios'
   */
  async registerToken(userId, token, deviceId, platform) {
    try {
      const db = require('../config/database');
      
      await db.query(
        `INSERT INTO user_devices (user_id, device_id, fcm_token, platform)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (device_id) 
         DO UPDATE SET 
           fcm_token = EXCLUDED.fcm_token,
           updated_at = NOW()`,
        [userId, deviceId, token, platform]
      );

      logger.info('FCM token registered', { userId, deviceId, platform });
    } catch (error) {
      logger.error('Error registering FCM token', { error: error.message });
      throw error;
    }
  }

  /**
   * Unregister device token
   * @param {string} deviceId - Device identifier
   */
  async unregisterToken(deviceId) {
    try {
      const db = require('../config/database');
      
      await db.query('DELETE FROM user_devices WHERE device_id = $1', [deviceId]);
      logger.info('FCM token unregistered', { deviceId });
    } catch (error) {
      logger.error('Error unregistering FCM token', { error: error.message });
      throw error;
    }
  }

  /**
   * Send issue assignment notification
   */
  async notifyIssueAssigned(engineerId, issue) {
    return this.sendToUser(engineerId, {
      title: 'New Issue Assigned',
      body: `${issue.type} issue assigned to you in ${issue.ward_name}`,
      type: 'issue_assigned',
      issueId: issue.id,
      priority: issue.priority,
      imageUrl: issue.image_url
    });
  }

  /**
   * Send issue resolved notification
   */
  async notifyIssueResolved(surveyorId, issue) {
    return this.sendToUser(surveyorId, {
      title: 'Issue Resolved',
      body: `Your reported ${issue.type} issue has been resolved`,
      type: 'issue_resolved',
      issueId: issue.id,
      imageUrl: issue.resolution_image_url
    });
  }

  /**
   * Send SLA breach alert
   */
  async notifySLABreach(issue) {
    return this.sendToRole('admin', {
      title: 'SLA Breach Alert',
      body: `${issue.priority} priority issue #${issue.id} breached SLA`,
      type: 'sla_breach',
      issueId: issue.id,
      priority: 'high'
    });
  }

  /**
   * Send high priority issue alert
   */
  async notifyHighPriority(issue) {
    return this.sendToRole('admin', {
      title: 'High Priority Issue',
      body: `New high priority ${issue.type} reported in ${issue.ward_name}`,
      type: 'high_priority',
      issueId: issue.id,
      priority: 'high',
      imageUrl: issue.image_url
    });
  }
}

module.exports = new PushNotificationService();
