const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
const db = require('../../src/config/database');
const path = require('path');

describe('Issues API', () => {
  let engineerToken;
  let surveyorToken;
  let adminToken;
  let testWardId;
  let testDepartmentId;
  let testIssueId;

  beforeAll(async () => {
    // Create test ward
    const wardResult = await db.query(
      `INSERT INTO wards (name, boundary) VALUES ($1, ST_GeomFromGeoJSON($2)) RETURNING id`,
      ['Test Ward', JSON.stringify({
        type: 'Polygon',
        coordinates: [[[73.18, 22.30], [73.19, 22.30], [73.19, 22.31], [73.18, 22.31], [73.18, 22.30]]]
      })]
    );
    testWardId = wardResult.rows[0].id;

    // Create test department
    const deptResult = await db.query(
      `INSERT INTO departments (name, head_name, contact_email, contact_phone, issue_types)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Test Dept', 'Head', 'dept@test.com', '1234567890', ['pothole']]
    );
    testDepartmentId = deptResult.rows[0].id;

    // Create test users
    const users = await Promise.all([
      db.query(
        `INSERT INTO users (name, email, password, role, ward_id, department_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        ['Engineer', 'engineer@test.com', 'hashed', 'engineer', testWardId, testDepartmentId]
      ),
      db.query(
        `INSERT INTO users (name, email, password, role, ward_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        ['Surveyor', 'surveyor@test.com', 'hashed', 'surveyor', testWardId]
      ),
      db.query(
        `INSERT INTO users (name, email, password, role)
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
    await db.end();
  });

  describe('POST /api/issues', () => {
    test('should create issue successfully with valid data', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', `Bearer ${surveyorToken}`)
        .field('latitude', '22.305')
        .field('longitude', '73.185')
        .field('description', 'Test pothole issue')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('issueId');
      expect(response.body.wardId).toBe(testWardId);
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
      expect(response.body.error).toContain('Unauthorized');
    });
  });

  describe('GET /api/issues', () => {
    test('should get all issues for admin', async () => {
      const response = await request(app)
        .get('/api/issues')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should filter issues by status', async () => {
      const response = await request(app)
        .get('/api/issues?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.forEach(issue => {
        expect(issue.status).toBe('pending');
      });
    });

    test('should filter issues by priority', async () => {
      const response = await request(app)
        .get('/api/issues?priority=high')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.forEach(issue => {
        expect(issue.priority).toBe('high');
      });
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/issues?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeLessThanOrEqual(5);
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
      const response = await request(app)
        .post(`/api/issues/${testIssueId}/resolve`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .field('resolution_notes', 'Fixed the pothole')
        .attach('resolution_image', Buffer.from('resolution-image'), 'resolved.jpg');

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('resolved');
    });

    test('should fail without engineer role', async () => {
      const response = await request(app)
        .post(`/api/issues/${testIssueId}/resolve`)
        .set('Authorization', `Bearer ${surveyorToken}`)
        .field('resolution_notes', 'Fixed');

      expect(response.status).toBe(403);
    });

    test('should fail with already resolved issue', async () => {
      const response = await request(app)
        .post(`/api/issues/${testIssueId}/resolve`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .field('resolution_notes', 'Trying to resolve again');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already resolved');
    });
  });
});
