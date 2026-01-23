/**
 * Main Server Application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const db = require('./services/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const issuesRoutes = require('./routes/issues');
const usersRoutes = require('./routes/users');
const wardsRoutes = require('./routes/wards');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const feedbackRoutes = require('./routes/feedback');
const geospatialRoutes = require('./routes/geospatial');
const reportsRoutes = require('./routes/reports');
const premiumRoutes = require('./routes/premium');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL-encoded body parser

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        query: req.query,
        user: req.user?.id
    });
    next();
});

// Health check
app.get('/health', async (req, res) => {
    try {
        const dbStatus = await db.testConnection();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: dbStatus ? 'connected' : 'disconnected',
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/wards', wardsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/geospatial', geospatialRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/premium', premiumRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Civic Issue Monitoring API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            issues: '/api/issues',
            users: '/api/users',
            wards: '/api/wards',
            analytics: '/api/analytics',
            notifications: '/api/notifications',
            dashboard: '/api/dashboard',
            feedback: '/api/feedback',
            geospatial: '/api/geospatial',
            reports: '/api/reports'
        }
    });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        // Test database connection
        logger.info('Testing database connection...');
        const dbConnected = await db.testConnection();

        if (!dbConnected) {
            throw new Error('Database connection failed');
        }

        logger.info('Database connected successfully');

        // Start listening
        app.listen(PORT, () => {
            logger.info('='.repeat(60));
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`API: http://localhost:${PORT}`);
            logger.info(`Health: http://localhost:${PORT}/health`);
            logger.info('='.repeat(60));
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;
