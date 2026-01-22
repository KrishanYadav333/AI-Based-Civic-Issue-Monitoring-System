const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * WebSocket notification handler
 * Real-time notifications for issue updates
 */

// Get notification preferences
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const result = await db.query(
      `SELECT email_notifications, push_notifications, sms_notifications, 
              notification_frequency
       FROM notification_preferences 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      // Return defaults
      return res.json({
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        notification_frequency: 'immediate'
      });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching notification preferences', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update notification preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { email_notifications, push_notifications, sms_notifications, notification_frequency } = req.body;
    
    await db.query(
      `INSERT INTO notification_preferences 
       (user_id, email_notifications, push_notifications, sms_notifications, notification_frequency)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         email_notifications = EXCLUDED.email_notifications,
         push_notifications = EXCLUDED.push_notifications,
         sms_notifications = EXCLUDED.sms_notifications,
         notification_frequency = EXCLUDED.notification_frequency,
         updated_at = NOW()`,
      [userId, email_notifications, push_notifications, sms_notifications, notification_frequency]
    );
    
    logger.info('Notification preferences updated', { userId });
    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    logger.error('Error updating notification preferences', { error: error.message });
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get notification history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 20, unread_only = 'false' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT n.*, i.type as issue_type, i.latitude, i.longitude
      FROM notifications n
      LEFT JOIN issues i ON n.issue_id = i.id
      WHERE n.user_id = $1
    `;
    
    const params = [userId];
    
    if (unread_only === 'true') {
      query += ' AND n.read = false';
    }
    
    query += ' ORDER BY n.created_at DESC LIMIT $2 OFFSET $3';
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1' + 
      (unread_only === 'true' ? ' AND read = false' : ''),
      [userId]
    );
    
    res.json({
      notifications: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Error fetching notification history', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    await db.query(
      'UPDATE notifications SET read = true, read_at = NOW() WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read', { error: error.message });
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    
    await db.query(
      'UPDATE notifications SET read = true, read_at = NOW() WHERE user_id = $1 AND read = false',
      [userId]
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read', { error: error.message });
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const result = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );
    
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    logger.error('Error fetching unread count', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

// Send notification (internal use by other services)
async function sendNotification(userId, type, title, message, issueId = null) {
  try {
    // Insert notification
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, issue_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message, issueId]
    );
    
    // Get user preferences
    const prefResult = await db.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [userId]
    );
    
    const preferences = prefResult.rows[0] || {
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false
    };
    
    // Send email if enabled
    if (preferences.email_notifications) {
      const emailService = require('../utils/emailService');
      const userResult = await db.query('SELECT email FROM users WHERE id = $1', [userId]);
      if (userResult.rows[0]) {
        await emailService.sendEmail(
          userResult.rows[0].email,
          title,
          message
        );
      }
    }
    
    // Emit WebSocket event if user is connected
    const io = require('../server').io;
    if (io) {
      io.to(`user_${userId}`).emit('notification', {
        type,
        title,
        message,
        issueId,
        timestamp: new Date()
      });
    }
    
    logger.info('Notification sent', { userId, type, issueId });
  } catch (error) {
    logger.error('Error sending notification', { error: error.message, userId });
  }
}

module.exports = router;
module.exports.sendNotification = sendNotification;
