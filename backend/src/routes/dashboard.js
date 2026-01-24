const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Ward = require('../models/Ward');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { successResponse } = require('../utils/response');

// GET /api/dashboard/engineer/:engineerId - Get assigned issues for engineer
router.get('/engineer/:engineerId', authenticate, authorize('engineer', 'admin'), async (req, res, next) => {
  try {
    const engineerId = req.params.engineerId;

    // Authorization check
    if (req.user.role === 'engineer' && req.user._id.toString() !== engineerId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { priority } = req.query;
    const query = { assigned_to: engineerId };
    if (priority) query.priority = priority;

    const issues = await Issue.find(query)
      .populate('ward_id', 'ward_name ward_number')
      .sort({ priority: -1, created_at: -1 })
      .lean();

    // Get statistics
    const allIssues = await Issue.find({ assigned_to: engineerId }).lean();
    const statistics = {
      total_issues: allIssues.length,
      pending_issues: allIssues.filter(i => i.status === 'pending').length,
      assigned_issues: allIssues.filter(i => i.status === 'assigned').length,
      resolved_issues: allIssues.filter(i => i.status === 'resolved').length,
      high_priority_count: allIssues.filter(i => i.priority === 'high').length,
      medium_priority_count: allIssues.filter(i => i.priority === 'medium').length,
      low_priority_count: allIssues.filter(i => i.priority === 'low').length
    };

    res.json({
      success: true,
      data: {
        issues,
        statistics
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/admin/stats - Get system statistics
router.get('/admin/stats', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    // Overall statistics
    const allIssues = await Issue.find({}).lean();
    const resolvedIssues = allIssues.filter(i => i.status === 'resolved');
    
    const avgResolutionTime = resolvedIssues.length > 0
      ? resolvedIssues.reduce((sum, issue) => {
          const hours = issue.resolved_at 
            ? (new Date(issue.resolved_at) - new Date(issue.created_at)) / (1000 * 60 * 60)
            : 0;
          return sum + hours;
        }, 0) / resolvedIssues.length
      : null;

    const overallStats = {
      total_issues: allIssues.length,
      resolved_issues: allIssues.filter(i => i.status === 'resolved').length,
      pending_issues: allIssues.filter(i => i.status === 'pending').length,
      assigned_issues: allIssues.filter(i => i.status === 'assigned').length,
      high_priority_issues: allIssues.filter(i => i.priority === 'high').length,
      avg_resolution_time_hours: avgResolutionTime
    };

    // Ward-wise statistics
    const wards = await Ward.find({}).sort({ ward_number: 1 }).lean();
    const wardStats = await Promise.all(wards.map(async (ward) => {
      const wardIssues = await Issue.find({ ward_id: ward._id }).lean();
      return {
        id: ward._id,
        name: ward.ward_name,
        total_issues: wardIssues.length,
        resolved_issues: wardIssues.filter(i => i.status === 'resolved').length,
        pending_issues: wardIssues.filter(i => i.status === 'pending').length,
        high_priority_issues: wardIssues.filter(i => i.priority === 'high').length
      };
    }));

    // Issue type statistics
    const typeStats = await Issue.aggregate([
      {
        $group: {
          _id: '$issue_type',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          avg_confidence: { $avg: '$ai_confidence' }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1,
          resolved: 1,
          avg_confidence: 1
        }
      }
    ]);

    // Recent activity from IssueLog
    const IssueLog = require('../models/IssueLog');
    const recentActivity = await IssueLog.find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('changed_by', 'full_name')
      .populate('issue_id', 'issue_type issue_number')
      .lean();

    const formattedActivity = recentActivity.map(log => ({
      id: log._id,
      action: log.action,
      timestamp: log.timestamp,
      notes: log.remarks,
      user_name: log.changed_by?.full_name,
      issue_id: log.issue_id?._id,
      issue_type: log.issue_id?.issue_type
    }));

    return successResponse(res, {
      overall: overallStats,
      wardStats,
      typeStats,
      recentActivity: formattedActivity
    }, 'Admin statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/admin/heatmap - Get issue heatmap data
router.get('/admin/heatmap', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { status, type, startDate, endDate } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.issue_type = type;
    }

    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) query.created_at.$gte = new Date(startDate);
      if (endDate) query.created_at.$lte = new Date(endDate);
    }

    const issues = await Issue.find(query)
      .select('issue_type latitude longitude priority status created_at ward_id')
      .lean();

    // Format for heatmap
    const heatmapData = issues.map(issue => ({
      lat: parseFloat(issue.latitude),
      lng: parseFloat(issue.longitude),
      intensity: issue.priority === 'high' ? 3 : issue.priority === 'medium' ? 2 : 1,
      type: issue.issue_type,
      status: issue.status,
      issueId: issue._id
    }));

    return successResponse(res, {
      points: heatmapData,
      count: heatmapData.length
    }, 'Heatmap data retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/ward/:wardId - Get ward-specific dashboard
router.get('/ward/:wardId', authenticate, async (req, res, next) => {
  try {
    const wardId = req.params.wardId;

    // Authorization check for engineers
    if (req.user.role === 'engineer' && req.user.ward_id?.toString() !== wardId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Ward statistics
    const wardIssues = await Issue.find({ ward_id: wardId }).lean();
    const stats = {
      total_issues: wardIssues.length,
      resolved_issues: wardIssues.filter(i => i.status === 'resolved').length,
      pending_issues: wardIssues.filter(i => i.status === 'pending').length,
      high_priority_issues: wardIssues.filter(i => i.priority === 'high').length
    };

    // Recent issues in ward
    const issues = await Issue.find({ ward_id: wardId })
      .populate('assigned_to', 'full_name')
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    const formattedIssues = issues.map(issue => ({
      ...issue,
      engineer_name: issue.assigned_to?.full_name
    }));

    return successResponse(res, {
      statistics: stats,
      issues: formattedIssues
    }, 'Ward dashboard data retrieved successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
