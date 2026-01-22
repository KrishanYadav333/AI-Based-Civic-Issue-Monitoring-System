const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, authorize } = require('../middleware/auth');
const cacheService = require('../utils/cacheService');
const logger = require('../utils/logger');

/**
 * Get heatmap data with clustering
 */
router.get('/heatmap', authMiddleware, authorize('admin', 'engineer'), async (req, res) => {
  try {
    const { ward_id, status, priority, start_date, end_date, cluster_radius = 0.01 } = req.query;

    const cacheKey = `heatmap:${ward_id}:${status}:${priority}:${start_date}:${end_date}:${cluster_radius}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    let query = `
      SELECT 
        id,
        latitude,
        longitude,
        type,
        status,
        priority,
        created_at,
        ST_AsGeoJSON(location)::json as geojson
      FROM issues
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (ward_id) {
      query += ` AND ward_id = $${paramCount}`;
      params.push(ward_id);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      query += ` AND priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (start_date) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    const result = await db.query(query, params);

    // Cluster nearby points
    const clusters = clusterPoints(result.rows, parseFloat(cluster_radius));

    const response = {
      type: 'FeatureCollection',
      features: clusters.map(cluster => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [cluster.longitude, cluster.latitude]
        },
        properties: {
          count: cluster.count,
          issueIds: cluster.issueIds,
          types: cluster.types,
          priorities: cluster.priorities,
          statuses: cluster.statuses
        }
      }))
    };

    await cacheService.set(cacheKey, JSON.stringify(response), 300); // 5 minutes
    res.json(response);
  } catch (error) {
    logger.error('Error fetching heatmap data', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

/**
 * Get ward boundaries as GeoJSON
 */
router.get('/wards/boundaries', authMiddleware, async (req, res) => {
  try {
    const cached = await cacheService.getWardBoundary();
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await db.query(`
      SELECT 
        id,
        number,
        name,
        ST_AsGeoJSON(boundary)::json as geometry,
        ST_Area(boundary::geography) / 1000000 as area_sq_km
      FROM wards
      ORDER BY number
    `);

    const geoJSON = {
      type: 'FeatureCollection',
      features: result.rows.map(ward => ({
        type: 'Feature',
        id: ward.id,
        geometry: ward.geometry,
        properties: {
          wardNumber: ward.number,
          wardName: ward.name,
          areaSqKm: parseFloat(ward.area_sq_km.toFixed(2))
        }
      }))
    };

    await cacheService.set('ward_boundaries', JSON.stringify(geoJSON), 86400); // 24 hours
    res.json(geoJSON);
  } catch (error) {
    logger.error('Error fetching ward boundaries', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch ward boundaries' });
  }
});

/**
 * Calculate route between points (for engineer navigation)
 */
router.post('/route', authMiddleware, authorize('engineer', 'admin'), async (req, res) => {
  try {
    const { start, waypoints, end } = req.body;

    // Validate coordinates
    if (!start || !start.latitude || !start.longitude) {
      return res.status(400).json({ error: 'Start location required' });
    }

    if (!end || !end.latitude || !end.longitude) {
      return res.status(400).json({ error: 'End location required' });
    }

    // Build coordinates array
    const coordinates = [
      [start.longitude, start.latitude],
      ...(waypoints || []).map(wp => [wp.longitude, wp.latitude]),
      [end.longitude, end.latitude]
    ];

    // For production, integrate with OSRM or Google Maps Directions API
    // This is a simplified response structure
    const route = {
      distance: calculateTotalDistance(coordinates),
      duration: estimateDuration(coordinates),
      geometry: {
        type: 'LineString',
        coordinates
      },
      waypoints: coordinates.length
    };

    res.json(route);
  } catch (error) {
    logger.error('Error calculating route', { error: error.message });
    res.status(500).json({ error: 'Failed to calculate route' });
  }
});

/**
 * Find nearest issues to a location
 */
router.get('/nearby', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, radius = 1, status, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    let query = `
      SELECT 
        i.id,
        i.type,
        i.status,
        i.priority,
        i.description,
        i.latitude,
        i.longitude,
        i.created_at,
        ST_Distance(
          i.location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance_meters,
        w.name as ward_name
      FROM issues i
      LEFT JOIN wards w ON i.ward_id = w.id
      WHERE ST_DWithin(
        i.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $3
      )
    `;

    const params = [parseFloat(longitude), parseFloat(latitude), parseFloat(radius) * 1000];
    let paramCount = 4;

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY distance_meters LIMIT $${paramCount}`;
    params.push(parseInt(limit));

    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (error) {
    logger.error('Error finding nearby issues', { error: error.message });
    res.status(500).json({ error: 'Failed to find nearby issues' });
  }
});

/**
 * Get spatial statistics
 */
router.get('/stats/spatial', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { ward_id } = req.query;

    let query = `
      WITH spatial_stats AS (
        SELECT 
          w.id as ward_id,
          w.name as ward_name,
          w.number as ward_number,
          COUNT(i.id) as total_issues,
          ST_Area(w.boundary::geography) / 1000000 as area_sq_km,
          ST_Centroid(w.boundary) as centroid
        FROM wards w
        LEFT JOIN issues i ON w.id = i.ward_id
        ${ward_id ? 'WHERE w.id = $1' : ''}
        GROUP BY w.id, w.name, w.number, w.boundary
      )
      SELECT 
        ward_id,
        ward_name,
        ward_number,
        total_issues,
        ROUND(area_sq_km::numeric, 2) as area_sq_km,
        ROUND((total_issues::numeric / NULLIF(area_sq_km, 0))::numeric, 2) as issues_per_sq_km,
        ST_X(centroid) as centroid_lng,
        ST_Y(centroid) as centroid_lat
      FROM spatial_stats
      ORDER BY issues_per_sq_km DESC
    `;

    const params = ward_id ? [ward_id] : [];
    const result = await db.query(query, params);

    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching spatial statistics', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch spatial statistics' });
  }
});

/**
 * Identify issue density hotspots
 */
router.get('/hotspots', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const { days = 30, min_issues = 5 } = req.query;

    // Use ST_ClusterDBSCAN for hotspot detection
    const result = await db.query(`
      WITH recent_issues AS (
        SELECT 
          id,
          type,
          priority,
          latitude,
          longitude,
          location,
          created_at
        FROM issues
        WHERE created_at >= NOW() - INTERVAL '${days} days'
      ),
      clusters AS (
        SELECT 
          id,
          type,
          priority,
          latitude,
          longitude,
          ST_ClusterDBSCAN(location::geometry, eps := 0.01, minpoints := $1) OVER () as cluster_id
        FROM recent_issues
      )
      SELECT 
        cluster_id,
        COUNT(*) as issue_count,
        AVG(latitude) as center_lat,
        AVG(longitude) as center_lng,
        JSON_AGG(DISTINCT type) as issue_types,
        JSON_AGG(DISTINCT priority) as priorities,
        ARRAY_AGG(id) as issue_ids
      FROM clusters
      WHERE cluster_id IS NOT NULL
      GROUP BY cluster_id
      HAVING COUNT(*) >= $1
      ORDER BY issue_count DESC
    `, [parseInt(min_issues)]);

    res.json(result.rows);
  } catch (error) {
    logger.error('Error identifying hotspots', { error: error.message });
    res.status(500).json({ error: 'Failed to identify hotspots' });
  }
});

// Helper functions

function clusterPoints(points, radius) {
  const clusters = [];
  const processed = new Set();

  for (const point of points) {
    if (processed.has(point.id)) continue;

    const cluster = {
      latitude: point.latitude,
      longitude: point.longitude,
      count: 1,
      issueIds: [point.id],
      types: { [point.type]: 1 },
      priorities: { [point.priority]: 1 },
      statuses: { [point.status]: 1 }
    };

    // Find nearby points
    for (const other of points) {
      if (processed.has(other.id) || point.id === other.id) continue;

      const distance = Math.sqrt(
        Math.pow(point.latitude - other.latitude, 2) +
        Math.pow(point.longitude - other.longitude, 2)
      );

      if (distance <= radius) {
        cluster.count++;
        cluster.issueIds.push(other.id);
        cluster.types[other.type] = (cluster.types[other.type] || 0) + 1;
        cluster.priorities[other.priority] = (cluster.priorities[other.priority] || 0) + 1;
        cluster.statuses[other.status] = (cluster.statuses[other.status] || 0) + 1;
        
        // Update cluster center
        cluster.latitude = (cluster.latitude * (cluster.count - 1) + other.latitude) / cluster.count;
        cluster.longitude = (cluster.longitude * (cluster.count - 1) + other.longitude) / cluster.count;
        
        processed.add(other.id);
      }
    }

    processed.add(point.id);
    clusters.push(cluster);
  }

  return clusters;
}

function calculateTotalDistance(coordinates) {
  let total = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    
    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return total;
}

function estimateDuration(coordinates) {
  const distance = calculateTotalDistance(coordinates);
  const avgSpeed = 30; // km/h average in city
  return (distance / avgSpeed) * 60; // minutes
}

module.exports = router;
