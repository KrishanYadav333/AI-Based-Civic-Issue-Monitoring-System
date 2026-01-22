const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message });
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

/**
 * Cache wrapper with TTL
 */
class CacheService {
  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set cache value with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set(key, value, ttl = 300) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
    }
  }

  /**
   * Delete cached value
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
    }
  }

  /**
   * Delete all keys matching pattern
   * @param {string} pattern - Key pattern (e.g., 'issues:*')
   */
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error: error.message });
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Increment counter
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<number>} New value
   */
  async incr(key, ttl = null) {
    try {
      const value = await redis.incr(key);
      if (ttl && value === 1) {
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error('Cache incr error', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Get or set cache (fetch from source if not cached)
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if not cached
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<any>}
   */
  async getOrSet(key, fetchFn, ttl = 300) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch from source
      const data = await fetchFn();
      
      // Cache the result
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      logger.error('Cache getOrSet error', { key, error: error.message });
      // Return fresh data on cache error
      return await fetchFn();
    }
  }

  /**
   * Cache ward boundaries (they rarely change)
   * @param {number} wardId - Ward ID
   * @returns {Promise<any>}
   */
  async getWardBoundary(wardId, fetchFn) {
    return this.getOrSet(`ward:boundary:${wardId}`, fetchFn, 86400); // 24 hours
  }

  /**
   * Cache dashboard statistics
   * @param {string} type - Dashboard type ('engineer' or 'admin')
   * @param {number} userId - User ID (for engineer dashboard)
   * @returns {Promise<any>}
   */
  async getDashboardStats(type, userId, fetchFn) {
    const key = type === 'engineer' 
      ? `dashboard:engineer:${userId}`
      : 'dashboard:admin:stats';
    return this.getOrSet(key, fetchFn, 60); // 1 minute
  }

  /**
   * Clear all dashboard caches
   */
  async clearDashboardCache() {
    await this.delPattern('dashboard:*');
  }

  /**
   * Clear issue-related caches when issue is created/updated
   */
  async clearIssueCache() {
    await Promise.all([
      this.delPattern('dashboard:*'),
      this.delPattern('issues:list:*'),
      this.delPattern('heatmap:*')
    ]);
  }
}

module.exports = new CacheService();
module.exports.redis = redis;
