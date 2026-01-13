const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Joi = require('joi');
const { query, transaction } = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'issue-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 }, // 10MB default
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
  }
});

// Helper function to call AI service
async function detectIssue(imagePath) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
    const formData = new FormData();
    const imageBuffer = fs.readFileSync(imagePath);
    const blob = new Blob([imageBuffer]);
    formData.append('image', blob, path.basename(imagePath));

    const response = await axios.post(`${aiServiceUrl}/api/detect`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000
    });

    return response.data;
  } catch (error) {
    logger.error('AI service error', { error: error.message });
    // Return default values if AI service fails
    return {
      issueType: 'unknown',
      confidence: 0.0,
      priority: 'medium'
    };
  }
}

// Helper function to get department by issue type
async function getDepartmentByIssueType(issueType) {
  const result = await query(
    "SELECT name FROM departments WHERE $1 = ANY(issue_types)",
    [issueType]
  );
  return result.rows.length > 0 ? result.rows[0].name : 'General';
}

// POST /api/issues - Submit new issue
router.post('/', authMiddleware, authorize('surveyor'), upload.single('image'), async (req, res, next) => {
  try {
    // Validate input
    const schema = Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const { latitude, longitude } = value;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Perform geo-fencing to find ward
    const wardResult = await query(
      'SELECT get_ward_by_coordinates($1, $2) as ward_id',
      [latitude, longitude]
    );
    const wardId = wardResult.rows[0].ward_id;

    if (!wardId) {
      return res.status(400).json({ error: 'Location is outside service area' });
    }

    // Call AI service to detect issue
    const aiResult = await detectIssue(path.join(uploadDir, req.file.filename));
    const issueType = aiResult.issueType || 'unknown';
    const confidence = aiResult.confidence || 0.0;
    const priority = aiResult.priority || 'medium';

    // Get department
    const department = await getDepartmentByIssueType(issueType);

    // Create issue in database
    const result = await transaction(async (client) => {
      // Insert issue
      const issueResult = await client.query(
        `INSERT INTO issues 
        (type, latitude, longitude, ward_id, status, priority, confidence_score, image_url, department)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [issueType, latitude, longitude, wardId, 'pending', priority, confidence, imageUrl, department]
      );

      const issue = issueResult.rows[0];

      // Log the creation
      await client.query(
        'INSERT INTO issue_logs (issue_id, action, user_id, notes) VALUES ($1, $2, $3, $4)',
        [issue.id, 'created', req.user.id, `Issue created by surveyor`]
      );

      return issue;
    });

    logger.info('Issue created', { issueId: result.id, wardId, issueType });

    res.status(201).json({
      issueId: result.id,
      wardId: result.ward_id,
      issueType: result.type,
      priority: result.priority,
      confidence: result.confidence_score,
      department: result.department,
      status: result.status
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/issues/:id - Get issue details
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const issueId = parseInt(req.params.id);
    
    const result = await query(
      `SELECT i.*, u.name as engineer_name, w.name as ward_name
       FROM issues i
       LEFT JOIN users u ON i.engineer_id = u.id
       LEFT JOIN wards w ON i.ward_id = w.id
       WHERE i.id = $1`,
      [issueId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = result.rows[0];

    // Check authorization
    if (req.user.role === 'engineer' && issue.engineer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(issue);
  } catch (error) {
    next(error);
  }
});

// POST /api/issues/:id/resolve - Upload resolution image
router.post('/:id/resolve', authMiddleware, authorize('engineer'), upload.single('resolution_image'), async (req, res, next) => {
  try {
    const issueId = parseInt(req.params.id);

    if (!req.file) {
      return res.status(400).json({ error: 'Resolution image is required' });
    }

    const resolutionImageUrl = `/uploads/${req.file.filename}`;

    // Update issue
    const result = await transaction(async (client) => {
      // Check if engineer is assigned to this issue
      const checkResult = await client.query(
        'SELECT * FROM issues WHERE id = $1',
        [issueId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error('Issue not found');
      }

      const issue = checkResult.rows[0];

      // Assign engineer if not already assigned
      if (!issue.engineer_id) {
        await client.query(
          'UPDATE issues SET engineer_id = $1 WHERE id = $2',
          [req.user.id, issueId]
        );
      } else if (issue.engineer_id !== req.user.id && req.user.role !== 'admin') {
        throw new Error('Not authorized to resolve this issue');
      }

      // Update issue status
      const updateResult = await client.query(
        `UPDATE issues 
         SET resolution_image_url = $1, status = 'resolved', resolved_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [resolutionImageUrl, issueId]
      );

      // Log resolution
      await client.query(
        'INSERT INTO issue_logs (issue_id, action, user_id, notes) VALUES ($1, $2, $3, $4)',
        [issueId, 'resolved', req.user.id, 'Issue resolved with image']
      );

      return updateResult.rows[0];
    });

    logger.info('Issue resolved', { issueId, engineerId: req.user.id });

    res.json({
      status: 'resolved',
      issue: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/issues - List issues (with filters)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, priority, wardId, engineerId } = req.query;
    
    let queryStr = `
      SELECT i.*, u.name as engineer_name, w.name as ward_name
      FROM issues i
      LEFT JOIN users u ON i.engineer_id = u.id
      LEFT JOIN wards w ON i.ward_id = w.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;

    if (status) {
      queryStr += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      queryStr += ` AND i.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (wardId) {
      queryStr += ` AND i.ward_id = $${paramCount}`;
      params.push(wardId);
      paramCount++;
    }

    if (engineerId) {
      queryStr += ` AND i.engineer_id = $${paramCount}`;
      params.push(engineerId);
      paramCount++;
    }

    // Role-based filtering
    if (req.user.role === 'engineer') {
      queryStr += ` AND (i.engineer_id = $${paramCount} OR i.ward_id = $${paramCount + 1})`;
      params.push(req.user.id, req.user.wardId);
      paramCount += 2;
    }

    queryStr += ' ORDER BY i.created_at DESC LIMIT 100';

    const result = await query(queryStr, params);

    res.json({
      issues: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
