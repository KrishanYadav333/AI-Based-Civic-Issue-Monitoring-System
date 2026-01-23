/**
 * Database Connection Service
 * PostgreSQL connection pool with query methods
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

// Create connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'civic_monitoring',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20, // Maximum connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.on('connect', () => {
    logger.info('Database connection established');
});

pool.on('error', (err) => {
    logger.error('Unexpected database error:', err);
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params = []) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        logger.debug('Query executed', {
            query: text.substring(0, 100),
            duration: `${duration}ms`,
            rows: result.rowCount
        });
        
        return result;
    } catch (error) {
        logger.error('Database query error:', {
            error: error.message,
            query: text.substring(0, 100),
            params
        });
        throw error;
    }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
    try {
        const client = await pool.connect();
        
        // Add query method to client
        const query = client.query.bind(client);
        const release = client.release.bind(client);
        
        // Override release to log
        client.release = () => {
            client.query = query;
            client.release = release;
            return release();
        };
        
        return client;
    } catch (error) {
        logger.error('Error getting database client:', error);
        throw error;
    }
}

/**
 * Execute queries in a transaction
 * @param {Function} callback - Callback with client parameter
 * @returns {Promise<any>} Transaction result
 */
async function transaction(callback) {
    const client = await getClient();
    
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Transaction rolled back:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Find a single record
 * @param {string} table - Table name
 * @param {Object} conditions - WHERE conditions
 * @returns {Promise<Object|null>} Record or null
 */
async function findOne(table, conditions = {}) {
    const keys = Object.keys(conditions);
    
    if (keys.length === 0) {
        const result = await query(`SELECT * FROM ${table} LIMIT 1`);
        return result.rows[0] || null;
    }
    
    const whereClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(' AND ');
    const values = keys.map(key => conditions[key]);
    
    const result = await query(
        `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`,
        values
    );
    
    return result.rows[0] || null;
}

/**
 * Find multiple records
 * @param {string} table - Table name
 * @param {Object} conditions - WHERE conditions
 * @param {Object} options - Query options (limit, offset, orderBy)
 * @returns {Promise<Array>} Records
 */
async function findMany(table, conditions = {}, options = {}) {
    const keys = Object.keys(conditions);
    const { limit, offset, orderBy } = options;
    
    let sql = `SELECT * FROM ${table}`;
    const values = [];
    
    if (keys.length > 0) {
        const whereClause = keys.map((key, idx) => {
            values.push(conditions[key]);
            return `${key} = $${idx + 1}`;
        }).join(' AND ');
        sql += ` WHERE ${whereClause}`;
    }
    
    if (orderBy) {
        sql += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
        sql += ` LIMIT ${parseInt(limit)}`;
    }
    
    if (offset) {
        sql += ` OFFSET ${parseInt(offset)}`;
    }
    
    const result = await query(sql, values);
    return result.rows;
}

/**
 * Count records
 * @param {string} table - Table name
 * @param {Object} conditions - WHERE conditions
 * @returns {Promise<number>} Count
 */
async function count(table, conditions = {}) {
    const keys = Object.keys(conditions);
    
    let sql = `SELECT COUNT(*) FROM ${table}`;
    const values = [];
    
    if (keys.length > 0) {
        const whereClause = keys.map((key, idx) => {
            values.push(conditions[key]);
            return `${key} = $${idx + 1}`;
        }).join(' AND ');
        sql += ` WHERE ${whereClause}`;
    }
    
    const result = await query(sql, values);
    return parseInt(result.rows[0].count);
}

/**
 * Insert a record
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<Object>} Inserted record
 */
async function insert(table, data) {
    const keys = Object.keys(data);
    const values = keys.map(key => data[key]);
    
    const columns = keys.join(', ');
    const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');
    
    const result = await query(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
    );
    
    return result.rows[0];
}

/**
 * Update records
 * @param {string} table - Table name
 * @param {Object} data - Data to update
 * @param {Object} conditions - WHERE conditions
 * @returns {Promise<Array>} Updated records
 */
async function update(table, data, conditions) {
    const dataKeys = Object.keys(data);
    const conditionKeys = Object.keys(conditions);
    
    if (conditionKeys.length === 0) {
        throw new Error('Update requires WHERE conditions');
    }
    
    const setClause = dataKeys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const whereClause = conditionKeys.map((key, idx) => 
        `${key} = $${dataKeys.length + idx + 1}`
    ).join(' AND ');
    
    const values = [
        ...dataKeys.map(key => data[key]),
        ...conditionKeys.map(key => conditions[key])
    ];
    
    const result = await query(
        `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`,
        values
    );
    
    return result.rows;
}

/**
 * Delete records
 * @param {string} table - Table name
 * @param {Object} conditions - WHERE conditions
 * @returns {Promise<number>} Number of deleted records
 */
async function deleteRecords(table, conditions) {
    const keys = Object.keys(conditions);
    
    if (keys.length === 0) {
        throw new Error('Delete requires WHERE conditions');
    }
    
    const whereClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(' AND ');
    const values = keys.map(key => conditions[key]);
    
    const result = await query(
        `DELETE FROM ${table} WHERE ${whereClause}`,
        values
    );
    
    return result.rowCount;
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
async function testConnection() {
    try {
        await query('SELECT NOW()');
        logger.info('Database connection test successful');
        return true;
    } catch (error) {
        logger.error('Database connection test failed:', error);
        return false;
    }
}

/**
 * Close database pool
 * @returns {Promise<void>}
 */
async function close() {
    try {
        await pool.end();
        logger.info('Database pool closed');
    } catch (error) {
        logger.error('Error closing database pool:', error);
        throw error;
    }
}

module.exports = {
    pool,
    query,
    getClient,
    transaction,
    findOne,
    findMany,
    count,
    insert,
    update,
    deleteRecords,
    testConnection,
    close
};
