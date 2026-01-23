// Test setup and configuration
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-min-32-chars';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'civic_issues_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.AI_SERVICE_URL = 'http://localhost:5000';
process.env.PORT = '3002'; // Use different port for testing to avoid conflicts
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock console to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock axios for AI service
const axios = require('axios');
jest.mock('axios');

axios.post = jest.fn().mockResolvedValue({
  data: {
    issueType: 'pothole',
    confidence: 0.95,
    priority: 'high',
    alternatives: []
  }
});

axios.get = jest.fn().mockResolvedValue({
  data: { status: 'ok' }
});
