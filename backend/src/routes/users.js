const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { query, transaction } = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

// GET /api/users - List users
router.get('/', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const { role, wardId } = req.query;

    let queryStr = `
      SELECT u.id, u.name, u.email, u.role, u.ward_id, u.created_at, w.name as ward_name
      FROM users u
      LEFT JOIN wards w ON u.ward_id = w.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (role) {
      queryStr += ` AND u.role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (wardId) {
      queryStr += ` AND u.ward_id = $${paramCount}`;
      params.push(wardId);
      paramCount++;
    }

    queryStr += ' ORDER BY u.created_at DESC';

    const result = await query(queryStr, params);

    res.json({
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users - Create user
router.post('/', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(2).max(255).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid('surveyor', 'engineer', 'admin').required(),
      wardId: Joi.number().integer().allow(null)
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, role, wardId } = value;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, ward_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, ward_id, created_at`,
      [name, email, passwordHash, role, wardId]
    );

    const user = result.rows[0];

    logger.info('User created', { userId: user.id, email: user.email, role: user.role });

    res.status(201).json({ user });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const schema = Joi.object({
      name: Joi.string().min(2).max(255),
      email: Joi.string().email(),
      password: Joi.string().min(6),
      role: Joi.string().valid('surveyor', 'engineer', 'admin'),
      wardId: Joi.number().integer().allow(null)
    }).min(1);

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (value.name) {
      updates.push(`name = $${paramCount}`);
      params.push(value.name);
      paramCount++;
    }

    if (value.email) {
      updates.push(`email = $${paramCount}`);
      params.push(value.email);
      paramCount++;
    }

    if (value.password) {
      const passwordHash = await bcrypt.hash(value.password, 10);
      updates.push(`password_hash = $${paramCount}`);
      params.push(passwordHash);
      paramCount++;
    }

    if (value.role) {
      updates.push(`role = $${paramCount}`);
      params.push(value.role);
      paramCount++;
    }

    if ('wardId' in value) {
      updates.push(`ward_id = $${paramCount}`);
      params.push(value.wardId);
      paramCount++;
    }

    params.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, name, email, role, ward_id, created_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User updated', { userId });

    res.json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User deleted', { userId });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get user details
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.ward_id, u.created_at, w.name as ward_name
       FROM users u
       LEFT JOIN wards w ON u.ward_id = w.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
