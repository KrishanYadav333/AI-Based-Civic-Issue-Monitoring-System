const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const wardRoutes = require('./routes/wards');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { 
  securityHeaders, 
  sanitizeInput, 
  xssProtection, 
  sqlInjectionProtection,
  requestId 
} = require('./middleware/security');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());
app.use(requestId);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(sanitizeInput);
app.use(xssProtection);
app.use(sqlInjectionProtection);

// Rate limiting
app.use('/api', apiLimiter);

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check endpoint (detailed)
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    services: {
      database: 'ok',
      ai: 'ok'
    }
  };

  try {
    // Check database connection
    const { query } = require('./config/database');
    await query('SELECT 1');
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Metrics endpoint (for monitoring)
app.get('/metrics', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server only if not in test environment
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;
