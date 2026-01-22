// Mock setup for tests
const axios = require('axios');

// Mock axios for AI service calls
jest.mock('axios');

// Mock Redis for rate limiting
jest.mock('ioredis', () => {
  const RedisMock = require('ioredis-mock');
  return RedisMock;
});

// Mock Redis client used by rate limiter
jest.mock('redis', () => {
  return {
    createClient: jest.fn(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      del: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue('OK'),
      on: jest.fn(),
    })),
  };
});

// Default AI service mock response
axios.post.mockResolvedValue({
  data: {
    issueType: 'pothole',
    confidence: 0.95,
    priority: 'high',
    alternatives: [
      { type: 'broken_road', confidence: 0.75 }
    ]
  }
});

module.exports = { axios };
