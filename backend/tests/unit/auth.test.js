const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../../src/server');
const db = require('../../src/config/database');

describe('Authentication API', () => {
  let server;
  let testUser;
  
  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password, role, ward_id, department_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      ['Test User', 'test@example.com', hashedPassword, 'engineer', 1, 1]
    );
    testUser = result.rows[0];
  });

  afterAll(async () => {
    // Clean up test user
    await db.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    await db.end();
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@123'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Test@123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    test('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Test@123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });
  });

  describe('POST /api/auth/verify', () => {
    let validToken;

    beforeAll(() => {
      validToken = jwt.sign(
        { userId: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
    });

    test('should verify valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('token');
    });

    test('should fail with missing token', async () => {
      const response = await request(app)
        .post('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('token');
    });

    test('should fail with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser.id, email: testUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expired');
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce login rate limiting', async () => {
      const attempts = [];
      
      // Make 6 login attempts (limit is 5)
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(attempts);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.error).toContain('Too many');
    }, 20000); // Increased timeout for rate limiting test
  });
});
