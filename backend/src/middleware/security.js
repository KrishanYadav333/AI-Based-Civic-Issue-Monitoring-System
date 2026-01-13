const helmet = require('helmet');
const logger = require('../utils/logger');

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

// Request sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  // Sanitize body parameters
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
};

// XSS protection
const xssProtection = (req, res, next) => {
  const xssPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  
  const checkXSS = (obj) => {
    if (typeof obj === 'string') {
      if (xssPattern.test(obj)) {
        return true;
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        if (checkXSS(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkXSS(req.body) || checkXSS(req.query)) {
    logger.warn('XSS attempt detected', { 
      ip: req.ip, 
      path: req.path,
      body: req.body,
      query: req.query
    });
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

// SQL injection protection
const sqlInjectionProtection = (req, res, next) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|(-{2}|\/\*|\*\/)/gi;
  
  const checkSQL = (obj) => {
    if (typeof obj === 'string') {
      if (sqlPattern.test(obj)) {
        return true;
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        if (checkSQL(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkSQL(req.body) || checkSQL(req.query)) {
    logger.warn('SQL injection attempt detected', { 
      ip: req.ip, 
      path: req.path,
      body: req.body,
      query: req.query
    });
    return res.status(400).json({ error: 'Invalid input detected' });
  }

  next();
};

// Request ID middleware for tracing
const requestId = (req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

module.exports = {
  securityHeaders,
  sanitizeInput,
  xssProtection,
  sqlInjectionProtection,
  requestId
};
