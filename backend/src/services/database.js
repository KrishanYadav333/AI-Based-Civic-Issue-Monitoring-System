/**
 * Database Connection Service
 * MongoDB connection with Mongoose
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB connection URL
const getConnectionString = () => {
    const mongoUri = process.env.MONGODB_URI;
    
    if (mongoUri) {
        return mongoUri;
    }
    
    // Build connection string from individual parameters
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_NAME || 'civic_monitoring';
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    
    if (user && password) {
        return `mongodb://${user}:${password}@${host}:${port}/${database}?authSource=admin`;
    }
    
    return `mongodb://${host}:${port}/${database}`;
};

// Connection options
const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// Connect to MongoDB
async function connect() {
    try {
        const connectionString = getConnectionString();
        await mongoose.connect(connectionString, options);
        logger.info('MongoDB connection established');
        return mongoose.connection;
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
}

// Connection event handlers
mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('Mongoose connection closed through app termination');
    process.exit(0);
});

/**
 * Test database connection
 */
async function testConnection() {
    try {
        if (mongoose.connection.readyState === 0) {
            await connect();
        }
        await mongoose.connection.db.admin().ping();
        logger.info('MongoDB connection test successful');
        return true;
    } catch (error) {
        logger.error('MongoDB connection test failed:', error);
        return false;
    }
}

/**
 * Close database connection
 */
async function close() {
    try {
        await mongoose.connection.close();
        logger.info('Database connection closed');
    } catch (error) {
        logger.error('Error closing database connection:', error);
        throw error;
    }
}

/**
 * Get database connection
 */
function getConnection() {
    return mongoose.connection;
}

/**
 * Get database instance (for raw MongoDB operations)
 */
function getDb() {
    return mongoose.connection.db;
}

// Export all functions
module.exports = {
    connect,
    testConnection,
    close,
    getConnection,
    getDb,
    mongoose
};
