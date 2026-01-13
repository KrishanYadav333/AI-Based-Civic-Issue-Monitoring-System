const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/server');
const db = require('../../src/config/database');

/**
 * Integration test for complete issue lifecycle:
 * 1. Surveyor submits issue
 * 2. System assigns to engineer based on ward
 * 3. AI classifies issue type
 * 4. Issue appears in engineer dashboard
 * 5. Engineer resolves issue
 * 6. Admin views analytics
 */
describe('Complete Issue Lifecycle', () => {
  let tokens = {};
  let users = {};
  let testWard;
  let testDept;
  let issueId;

  beforeAll(async () => {
    // Set up test environment
    const wardResult = await db.query(
      `INSERT INTO wards (name, boundary) 
       VALUES ($1, ST_GeomFromGeoJSON($2)) RETURNING *`,
      ['Integration Test Ward', JSON.stringify({
        type: 'Polygon',
        coordinates: [[[73.20, 22.32], [73.21, 22.32], [73.21, 22.33], [73.20, 22.33], [73.20, 22.32]]]
      })]
    );
    testWard = wardResult.rows[0];

    const deptResult = await db.query(
      `INSERT INTO departments (name, head_name, contact_email, contact_phone, issue_types)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      ['Integration Dept', 'Head', 'dept@int.com', '9999999999', ['pothole', 'streetlight']]
    );
    testDept = deptResult.rows[0];

    // Create users for each role
    const userResults = await Promise.all([
      db.query(
        `INSERT INTO users (name, email, password, role, ward_id, department_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        ['Int Engineer', 'engineer@int.com', 'hash', 'engineer', testWard.id, testDept.id]
      ),
      db.query(
        `INSERT INTO users (name, email, password, role, ward_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        ['Int Surveyor', 'surveyor@int.com', 'hash', 'surveyor', testWard.id]
      ),
      db.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        ['Int Admin', 'admin@int.com', 'hash', 'admin']
      )
    ]);

    users.engineer = userResults[0].rows[0];
    users.surveyor = userResults[1].rows[0];
    users.admin = userResults[2].rows[0];

    // Generate tokens
    tokens.engineer = jwt.sign(
      { userId: users.engineer.id, role: 'engineer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    tokens.surveyor = jwt.sign(
      { userId: users.surveyor.id, role: 'surveyor' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    tokens.admin = jwt.sign(
      { userId: users.admin.id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  });

  afterAll(async () => {
    // Clean up
    await db.query('DELETE FROM issues WHERE ward_id = $1', [testWard.id]);
    await db.query('DELETE FROM users WHERE email LIKE $1', ['%@int.com']);
    await db.query('DELETE FROM departments WHERE id = $1', [testDept.id]);
    await db.query('DELETE FROM wards WHERE id = $1', [testWard.id]);
    await db.end();
  });

  test('Step 1: Surveyor submits new issue', async () => {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${tokens.surveyor}`)
      .field('latitude', '22.325')
      .field('longitude', '73.205')
      .field('description', 'Large pothole on main road causing traffic issues')
      .attach('image', Buffer.from('test-image-data'), 'pothole.jpg');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('issueId');
    expect(response.body.wardId).toBe(testWard.id);
    expect(response.body).toHaveProperty('issueType');
    expect(response.body).toHaveProperty('priority');

    issueId = response.body.issueId;

    // Verify issue was logged
    const logResult = await db.query(
      'SELECT * FROM issue_logs WHERE issue_id = $1 AND action = $2',
      [issueId, 'created']
    );
    expect(logResult.rows.length).toBe(1);
    expect(logResult.rows[0].performed_by).toBe(users.surveyor.id);
  });

  test('Step 2: Issue assigned to ward engineer', async () => {
    const issueResult = await db.query(
      'SELECT * FROM issues WHERE id = $1',
      [issueId]
    );

    expect(issueResult.rows[0].assigned_engineer_id).toBe(users.engineer.id);
    expect(issueResult.rows[0].department_id).toBe(testDept.id);
  });

  test('Step 3: Issue appears in engineer dashboard', async () => {
    const response = await request(app)
      .get(`/api/dashboard/engineer/${users.engineer.id}`)
      .set('Authorization', `Bearer ${tokens.engineer}`);

    expect(response.status).toBe(200);
    expect(response.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: issueId })
      ])
    );
    expect(response.body.statistics.total_issues).toBeGreaterThan(0);
  });

  test('Step 4: Engineer views issue details', async () => {
    const response = await request(app)
      .get(`/api/issues/${issueId}`)
      .set('Authorization', `Bearer ${tokens.engineer}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(issueId);
    expect(response.body.description).toContain('pothole');
    expect(response.body.status).toBe('assigned');
    expect(response.body).toHaveProperty('image_url');
    expect(response.body).toHaveProperty('created_at');
  });

  test('Step 5: Engineer resolves issue', async () => {
    const response = await request(app)
      .post(`/api/issues/${issueId}/resolve`)
      .set('Authorization', `Bearer ${tokens.engineer}`)
      .field('resolution_notes', 'Pothole filled with asphalt, road leveled and compacted')
      .attach('resolution_image', Buffer.from('resolution-data'), 'resolved.jpg');

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('resolved');

    // Verify status updated
    const issueResult = await db.query(
      'SELECT status, resolution_notes FROM issues WHERE id = $1',
      [issueId]
    );
    expect(issueResult.rows[0].status).toBe('resolved');
    expect(issueResult.rows[0].resolution_notes).toContain('asphalt');

    // Verify resolution logged
    const logResult = await db.query(
      'SELECT * FROM issue_logs WHERE issue_id = $1 AND action = $2',
      [issueId, 'resolved']
    );
    expect(logResult.rows.length).toBe(1);
    expect(logResult.rows[0].performed_by).toBe(users.engineer.id);
  });

  test('Step 6: Admin views statistics', async () => {
    const response = await request(app)
      .get('/api/dashboard/admin/stats')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(response.status).toBe(200);
    expect(response.body.total_issues).toBeGreaterThan(0);
    expect(response.body.resolved_issues).toBeGreaterThan(0);
    expect(response.body).toHaveProperty('resolution_rate');
    expect(response.body).toHaveProperty('avg_resolution_time');
    expect(response.body).toHaveProperty('issue_distribution');
  });

  test('Step 7: Admin views ward performance', async () => {
    const response = await request(app)
      .get('/api/dashboard/admin/ward-performance')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    const testWardData = response.body.find(w => w.ward_id === testWard.id);
    expect(testWardData).toBeDefined();
    expect(testWardData.total_issues).toBeGreaterThan(0);
    expect(testWardData.resolved_issues).toBeGreaterThan(0);
  });

  test('Step 8: Admin views heatmap data', async () => {
    const response = await request(app)
      .get('/api/dashboard/admin/heatmap')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    const testIssue = response.body.find(i => i.issue_id === issueId);
    expect(testIssue).toBeDefined();
    expect(testIssue).toHaveProperty('latitude');
    expect(testIssue).toHaveProperty('longitude');
    expect(testIssue).toHaveProperty('priority');
  });

  test('Step 9: Verify audit trail', async () => {
    const logResult = await db.query(
      'SELECT * FROM issue_logs WHERE issue_id = $1 ORDER BY performed_at',
      [issueId]
    );

    expect(logResult.rows.length).toBeGreaterThanOrEqual(2);
    
    // Check created log
    const createdLog = logResult.rows.find(log => log.action === 'created');
    expect(createdLog).toBeDefined();
    expect(createdLog.performed_by).toBe(users.surveyor.id);

    // Check resolved log
    const resolvedLog = logResult.rows.find(log => log.action === 'resolved');
    expect(resolvedLog).toBeDefined();
    expect(resolvedLog.performed_by).toBe(users.engineer.id);
  });

  test('Step 10: Verify geographic assignment', async () => {
    // Test point outside ward boundary
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${tokens.surveyor}`)
      .field('latitude', '22.50') // Outside test ward
      .field('longitude', '73.50')
      .field('description', 'Issue outside test ward');

    // Should still create issue but with different ward
    expect(response.status).toBe(201);
    expect(response.body.wardId).not.toBe(testWard.id);
  });
});
