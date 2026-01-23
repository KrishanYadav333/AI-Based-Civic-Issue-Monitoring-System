const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const db = require('../services/database');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Generate QR code for issue feedback
 */
router.get('/issue/:id/qr', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify issue exists and is resolved
    const issueResult = await db.query(
      'SELECT id, status FROM issues WHERE id = $1',
      [id]
    );

    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    if (issueResult.rows[0].status !== 'resolved') {
      return res.status(400).json({ error: 'Only resolved issues can have feedback' });
    }

    // Generate feedback URL
    const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/feedback/${id}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(feedbackUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1
    });

    res.json({
      issueId: id,
      feedbackUrl,
      qrCode // base64 image data URL
    });
  } catch (error) {
    logger.error('Error generating QR code', { error: error.message });
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

/**
 * Submit citizen feedback (public endpoint)
 */
router.post('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, location_verified } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify issue exists and is resolved
    const issueResult = await db.query(
      'SELECT id, status FROM issues WHERE id = $1 AND status = $2',
      [id, 'resolved']
    );

    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resolved issue not found' });
    }

    // Check if feedback already exists
    const existingFeedback = await db.query(
      'SELECT id FROM citizen_feedback WHERE issue_id = $1',
      [id]
    );

    if (existingFeedback.rows.length > 0) {
      return res.status(400).json({ error: 'Feedback already submitted for this issue' });
    }

    // Insert feedback
    await db.query(
      `INSERT INTO citizen_feedback (issue_id, rating, comment, location_verified)
       VALUES ($1, $2, $3, $4)`,
      [id, rating, comment || null, location_verified || false]
    );

    logger.info('Citizen feedback submitted', { issueId: id, rating });
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    logger.error('Error submitting feedback', { error: error.message });
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

/**
 * Get feedback for an issue
 */
router.get('/feedback/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT cf.*, i.type, i.ward_id
       FROM citizen_feedback cf
       JOIN issues i ON cf.issue_id = i.id
       WHERE cf.issue_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching feedback', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

/**
 * Get feedback statistics
 */
router.get('/feedback/stats/summary', authenticate, async (req, res) => {
  try {
    const { ward_id, start_date, end_date } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_feedbacks,
        ROUND(AVG(rating), 2) as average_rating,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_feedbacks,
        COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_feedbacks,
        COUNT(CASE WHEN location_verified THEN 1 END) as verified_locations
      FROM citizen_feedback cf
      JOIN issues i ON cf.issue_id = i.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (ward_id) {
      query += ` AND i.ward_id = $${paramCount}`;
      params.push(ward_id);
      paramCount++;
    }

    if (start_date) {
      query += ` AND cf.submitted_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND cf.submitted_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    const result = await db.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Error fetching feedback stats', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * Get recent feedback comments
 */
router.get('/feedback/recent', authenticate, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT 
        cf.id, cf.rating, cf.comment, cf.submitted_at,
        i.id as issue_id, i.type, i.ward_id, w.name as ward_name
       FROM citizen_feedback cf
       JOIN issues i ON cf.issue_id = i.id
       JOIN wards w ON i.ward_id = w.id
       WHERE cf.comment IS NOT NULL
       ORDER BY cf.submitted_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching recent feedback', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

/**
 * Generate bulk QR codes for resolved issues
 */
router.post('/bulk-qr', authenticate, async (req, res) => {
  try {
    const { issue_ids } = req.body;

    if (!Array.isArray(issue_ids) || issue_ids.length === 0) {
      return res.status(400).json({ error: 'Issue IDs array required' });
    }

    const qrCodes = await Promise.all(
      issue_ids.map(async (id) => {
        try {
          const feedbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/feedback/${id}`;
          const qrCode = await QRCode.toDataURL(feedbackUrl, {
            errorCorrectionLevel: 'H',
            width: 300
          });
          return { issueId: id, qrCode, success: true };
        } catch (error) {
          return { issueId: id, error: error.message, success: false };
        }
      })
    );

    res.json({ qrCodes });
  } catch (error) {
    logger.error('Error generating bulk QR codes', { error: error.message });
    res.status(500).json({ error: 'Failed to generate QR codes' });
  }
});

module.exports = router;
