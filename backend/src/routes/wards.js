const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// GET /api/wards - List all wards
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, name, ST_AsGeoJSON(boundary) as boundary, created_at FROM wards ORDER BY id'
    );

    const wards = result.rows.map(ward => ({
      id: ward.id,
      name: ward.name,
      boundary: ward.boundary ? JSON.parse(ward.boundary) : null,
      createdAt: ward.created_at
    }));

    res.json({ wards });
  } catch (error) {
    next(error);
  }
});

// GET /api/wards/:lat/:lng - Get ward ID from coordinates
router.get('/:lat/:lng', authMiddleware, async (req, res, next) => {
  try {
    const lat = parseFloat(req.params.lat);
    const lng = parseFloat(req.params.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Coordinates out of range' });
    }

    const result = await query(
      'SELECT get_ward_by_coordinates($1, $2) as ward_id',
      [lat, lng]
    );

    const wardId = result.rows[0].ward_id;

    if (!wardId) {
      return res.status(404).json({ error: 'No ward found for these coordinates' });
    }

    // Get ward details
    const wardResult = await query(
      'SELECT id, name FROM wards WHERE id = $1',
      [wardId]
    );

    res.json({
      wardId: wardResult.rows[0].id,
      wardName: wardResult.rows[0].name
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/wards/:id - Get ward details
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const wardId = parseInt(req.params.id);

    const result = await query(
      'SELECT id, name, ST_AsGeoJSON(boundary) as boundary, created_at FROM wards WHERE id = $1',
      [wardId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ward not found' });
    }

    const ward = result.rows[0];
    res.json({
      id: ward.id,
      name: ward.name,
      boundary: ward.boundary ? JSON.parse(ward.boundary) : null,
      createdAt: ward.created_at
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
