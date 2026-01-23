const express = require('express');
const router = express.Router();
const db = require('../services/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/dashboard/engineer/:engineerId - Get assigned issues for engineer
router.get('/engineer/:engineerId', authenticate, authorize('engineer', 'admin'), async (req, res, next) => {
  try {
    const engineerId = parseInt(req.params.engineerId);
    const { priority } = req.query;

    // Authorization check
    if (req.user.role === 'engineer' && req.user.id !== engineerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let queryStr = `
      SELECT i.*, w.name as ward_name
      FROM issues i
      LEFT JOIN wards w ON i.ward_id = w.id
      WHERE i.engineer_id = $1
    `;

    const params = [engineerId];

    if (priority) {
      queryStr += ` AND i.priority = $2`;
      params.push(priority);
    }

    queryStr += ' ORDER BY i.priority DESC, i.created_at DESC';

    const result = await db.query(queryStr, params);

    // Get statistics
    const statsResult = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
        COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
        COUNT(*) FILTER (WHERE priority = 'low') as low_priority
       FROM issues
       WHERE engineer_id = $1`,
      [engineerId]
    );

    res.json({
      issues: result.rows,
      statistics: statsResult.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/admin/stats - Get system statistics
router.get('/admin/stats', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    // Overall statistics
    const overallStats = await db.query(`
      SELECT 
        COUNT(*) as total_issues,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_issues,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_issues,
        COUNT(*) FILTER (WHERE status = 'assigned') as assigned_issues,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority_issues,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE status = 'resolved') as avg_resolution_time_hours
      FROM issues
    `);

    // Ward-wise statistics
    const wardStats = await db.query(`
      SELECT 
        w.id,
        w.name,
        COUNT(i.id) as total_issues,
        COUNT(i.id) FILTER (WHERE i.status = 'resolved') as resolved_issues,
        COUNT(i.id) FILTER (WHERE i.status = 'pending') as pending_issues,
        COUNT(i.id) FILTER (WHERE i.priority = 'high') as high_priority_issues
      FROM wards w
      LEFT JOIN issues i ON w.id = i.ward_id
      GROUP BY w.id, w.name
      ORDER BY w.id
    `);

    // Issue type statistics
    const typeStats = await db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        AVG(confidence_score) as avg_confidence
      FROM issues
      GROUP BY type
      ORDER BY count DESC
    `);

    // Recent activity
    const recentActivity = await db.query(`
      SELECT 
        il.id,
        il.action,
        il.created_at as timestamp,
        il.notes,
        u.name as user_name,
        i.id as issue_id,
        i.type as issue_type
      FROM issue_logs il
      JOIN users u ON il.user_id = u.id
      JOIN issues i ON il.issue_id = i.id
      ORDER BY il.created_at DESC
      LIMIT 50
    `);

    res.json({
      overall: overallStats.rows[0],
      wardStats: wardStats.rows,
      typeStats: typeStats.rows,
      recentActivity: recentActivity.rows
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/admin/heatmap - Get issue heatmap data
router.get('/admin/heatmap', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status, type, startDate, endDate } = req.query;

    let queryStr = `
      SELECT 
        id,
        type,
        latitude,
        longitude,
        priority,
        status,
        created_at,
        ward_id
      FROM issues
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (status) {
      queryStr += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (type) {
      queryStr += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (startDate) {
      queryStr += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryStr += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    const result = await db.query(queryStr, params);

    // Format for heatmap
    const heatmapData = result.rows.map(issue => ({
      lat: parseFloat(issue.latitude),
      lng: parseFloat(issue.longitude),
      intensity: issue.priority === 'high' ? 3 : issue.priority === 'medium' ? 2 : 1,
      type: issue.type,
      status: issue.status,
      issueId: issue.id
    }));

    res.json({
      points: heatmapData,
      count: heatmapData.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/ward/:wardId - Get ward-specific dashboard
router.get('/ward/:wardId', authenticate, async (req, res, next) => {
  try {
    const wardId = parseInt(req.params.wardId);

    // Authorization check for engineers
    if (req.user.role === 'engineer' && req.user.wardId !== wardId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Ward statistics
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_issues,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_issues,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_issues,
        COUNT(*) FILTER (WHERE priority = 'high') as high_priority_issues
      FROM issues
      WHERE ward_id = $1
    `, [wardId]);

    // Recent issues in ward
    const issues = await db.query(`
      SELECT i.*, u.name as engineer_name
      FROM issues i
      LEFT JOIN users u ON i.engineer_id = u.id
      WHERE i.ward_id = $1
      ORDER BY i.created_at DESC
      LIMIT 50
    `, [wardId]);

    res.json({
      statistics: stats.rows[0],
      issues: issues.rows
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
