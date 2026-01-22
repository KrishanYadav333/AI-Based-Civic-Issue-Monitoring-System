const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
const db = require('../../src/config/database');
const path = require('path');
const { createTestJpeg } = require('../helpers/imageHelpers');

describe('Issues API', () => {
  let engineerToken;
  let surveyorToken;
  let adminToken;
  let testWardId;
  let testDepartmentId;
  let testIssueId;

  beforeAll(async () => {
    // Create test ward (using simple JSON for test environment)
    const wardResult = await db.query(
      `INSERT INTO wards (name, boundary_json) VALUES ($1, $2) RETURNING id`,
      ['Test Ward', JSON.stringify({
        type: 'Polygon',
        coordinates: [[[73.18, 22.30], [73.19, 22.30], [73.19, 22.31], [73.18, 22.31], [73.18, 22.30]]]
      })]
    );
    testWardId = wardResult.rows[0].id;

    // Create test department
    const deptResult = await db.query(
      `INSERT INTO departments (name, description)
       VALUES ($1, $2) RETURNING id`,
      ['Test Dept', 'Test Department for unit testing']
    );
    testDepartmentId = deptResult.rows[0].id;

    // Create test users
    const users = await Promise.all([
      db.query(
        `INSERT INTO users (name, email, password_hash, role, ward_id, department_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        ['Engineer', 'engineer@test.com', 'hashed', 'engineer', testWardId, testDepartmentId]
      ),
      db.query(
        `INSERT INTO users (name, email, password_hash, role, ward_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        ['Surveyor', 'surveyor@test.com', 'hashed', 'surveyor', testWardId]
      ),
      db.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        ['Admin', 'admin@test.com', 'hashed', 'admin']
      )
    ]);

    // Generate tokens
    engineerToken = jwt.sign(
      { userId: users[0].rows[0].id, role: 'engineer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    surveyorToken = jwt.sign(
      { userId: users[1].rows[0].id, role: 'surveyor' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    adminToken = jwt.sign(
      { userId: users[2].rows[0].id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await db.query('DELETE FROM issues WHERE ward_id = $1', [testWardId]);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%@test.com']);
    await db.query('DELETE FROM departments WHERE id = $1', [testDepartmentId]);
    await db.query('DELETE FROM wards WHERE id = $1', [testWardId]);
    // Don't call db.end() as it's a shared pool
  });

  describe('POST /api/issues', () => {
    test('should create issue successfully with valid data', async () => {
      const testImage = createTestJpeg();
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${surveyorToken}`)
        .field('latitude', '22.305')
        .field('longitude', '73.185')
        .attach('image', testImage, { filename: 'test.jpg', contentType: 'image/jpeg' });

      if (response.status !== 201) {
        console.log('Issue creation failed:', response.status, JSON.stringify(response.body));
      }
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('issueId');
      expect(response.body).toHaveProperty('wardId'); // Ward ID should be assigned based on coordinates
      testIssueId = response.body.issueId;
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/issues')
        .field('latitude', '22.305')
        .field('longitude', '73.185')
        .field('description', 'Test issue');

      expect(response.status).toBe(401);
    });

    test('should fail with invalid coordinates', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${surveyorToken}`)
        .field('latitude', '200') // Invalid latitude
        .field('longitude', '73.185')
        .field('description', 'Test issue');

      expect(response.status).toBe(400);
    });

    test('should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${surveyorToken}`)
        .field('latitude', '22.305');
        // Missing longitude and description

      expect(response.status).toBe(400);
    });

    test('should fail with engineer role', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${engineerToken}`)
        .field('latitude', '22.305')
        .field('longitude', '73.185')
        .field('description', 'Test issue');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied');
    });
  });

  describe('GET /api/issues', () => {
    test('should get all issues for admin', async () => {
      const response = await request(app)
        .get('/api/issues')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('issues');
      expect(Array.isArray(response.body.issues)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });

    test('should filter issues by status', async () => {
      const response = await request(app)
        .get('/api/issues?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('issues');
      response.body.issues.forEach(issue => {
        expect(issue.status).toBe('pending');
      });
    });

    test('should filter issues by priority', async () => {
      const response = await request(app)
        .get('/api/issues?priority=high')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('issues');
      response.body.issues.forEach(issue => {
        expect(issue.priority).toBe('high');
      });
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/issues?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('issues');
      expect(response.body.issues.length).toBeLessThanOrEqual(100); // API returns max 100
    });
  });

  describe('GET /api/issues/:id', () => {
    test('should get specific issue by ID', async () => {
      const response = await request(app)
        .get(`/api/issues/${testIssueId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testIssueId);
      expect(response.body).toHaveProperty('description');
    });

    test('should fail with invalid ID', async () => {
      const response = await request(app)
        .get('/api/issues/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/issues/:id/resolve', () => {
    test('should resolve issue successfully', async () => {
      const testImage = createTestJpeg();
      const response = await request(app)
        .post(`/api/issues/${testIssueId}/resolve`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .field('resolution_notes', 'Fixed the pothole')
        .attach('resolution_image', testImage, { filename: 'resolved.jpg', contentType: 'image/jpeg' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('resolved');
      expect(response.body).toHaveProperty('issue');
    });

    test('should fail without engineer role', async () => {
      const response = await request(app)
        .post(`/api/issues/${testIssueId}/resolve`)
        .set('Authorization', `Bearer ${surveyorToken}`)
        .field('resolution_notes', 'Fixed');

      expect(response.status).toBe(403);
    });

    test('should fail without resolution image', async () => {
      const response = await request(app)
        .post(`/api/issues/${testIssueId}/resolve`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .field('resolution_notes', 'Trying to resolve without image');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Resolution image is required');
    });
  });
});
