/**
 * Notification Routes
 * Handles user notifications
 */

const express = require('express');
const router = express.Router();

const notificationService = require('../services/notificationService');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/response');

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get('/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { unread_only = 'false' } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      req.user.id,
      unread_only === 'true'
    );
    
    return successResponse(res, notifications, 'Notifications retrieved successfully');
  })
);

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch('/:id/read',
  authenticate,
  asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    
    return successResponse(res, notification, 'Notification marked as read');
  })
);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    const count = await notificationService.markAllAsRead(req.user.id);
    
    return successResponse(
      res,
      { count },
      `${count} notification(s) marked as read`
    );
  })
);

module.exports = router;
