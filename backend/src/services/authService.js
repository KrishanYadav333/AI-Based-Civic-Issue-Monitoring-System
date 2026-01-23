/**
 * Authentication Service
 * User authentication and authorization
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');
const logger = require('../utils/logger');
const { USER_ROLES, ERROR_MESSAGES } = require('../core/constants');
const { validateEmail, validateUsername, validatePassword } = require('../utils/validation');
const { AuthenticationError, ValidationError, ConflictError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        logger.error('Error hashing password:', error);
        throw error;
    }
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} Match result
 */
async function comparePassword(password, hash) {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        logger.error('Error comparing password:', error);
        throw error;
    }
}

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
    try {
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            ward_id: user.ward_id
        };
        
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (error) {
        logger.error('Error generating token:', error);
        throw error;
    }
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        logger.error('Error verifying token:', error);
        throw new Error('Invalid or expired token');
    }
}

/**
 * Register new user
 * @param {Object} data - User registration data
 * @returns {Promise<Object>} Created user with token
 */
async function register(data) {
    try {
        const { username, email, password, role, ward_id, full_name } = data;
        
        // Validate inputs
        if (!validateUsername(username)) {
            throw new Error('Invalid username format');
        }
        
        if (!validateEmail(email)) {
            throw new Error('Invalid email format');
        }
        
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.error);
        }
        
        // Check if user already exists
        const existingUser = await db.findOne('users', { username });
        if (existingUser) {
            throw new Error('Username already exists');
        }
        
        const existingEmail = await db.findOne('users', { email });
        if (existingEmail) {
            throw new Error('Email already exists');
        }
        
        // Hash password
        const password_hash = await hashPassword(password);
        
        // Create user
        const user = await db.insert('users', {
            username,
            email,
            password_hash,
            role: role || USER_ROLES.SURVEYOR,
            ward_id: ward_id || null,
            full_name: full_name || null
        });
        
        // Generate token
        const token = generateToken(user);
        
        // Remove password hash from response
        delete user.password_hash;
        
        logger.info(`User registered: ${username} (${user.role})`);
        
        return {
            user,
            token
        };
        
    } catch (error) {
        logger.error('Error registering user:', error);
        throw error;
    }
}

/**
 * Login user
 * @param {string} username - Username or email
 * @param {string} password - Password
 * @returns {Promise<Object>} User with token
 */
async function login(username, password) {
    try {
        if (!username || !password) {
            throw new ValidationError('Username and password are required');
        }
        
        // Find user by username or email
        const result = await db.query(
            `SELECT * FROM users 
             WHERE username = $1 OR email = $1
             LIMIT 1`,
            [username]
        );
        
        if (result.rows.length === 0) {
            throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        
        const user = result.rows[0];
        
        // Verify password
        const isValidPassword = await comparePassword(password, user.password_hash);
        
        if (!isValidPassword) {
            throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        
        // Generate token
        const token = generateToken(user);
        
        // Remove password hash from response
        delete user.password_hash;
        
        logger.info(`User logged in: ${user.username}`);
        
        return {
            user,
            token
        };
        
    } catch (error) {
        logger.error('Error logging in:', error);
        throw error;
    }
}

/**
 * Get user by ID
 * @param {string} userId - User UUID
 * @returns {Promise<Object|null>} User object
 */
async function getUserById(userId) {
    try {
        const result = await db.query(
            `SELECT 
                u.id,
                u.username,
                u.email,
                u.role,
                u.ward_id,
                u.full_name,
                u.created_at,
                u.updated_at,
                w.ward_number,
                w.ward_name
             FROM users u
             LEFT JOIN wards w ON u.ward_id = w.id
             WHERE u.id = $1`,
            [userId]
        );
        
        return result.rows[0] || null;
        
    } catch (error) {
        logger.error('Error getting user by ID:', error);
        throw error;
    }
}

/**
 * Get all users
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Users
 */
async function getUsers(filters = {}) {
    try {
        let sql = `
            SELECT 
                u.id,
                u.username,
                u.email,
                u.role,
                u.ward_id,
                u.full_name,
                u.created_at,
                w.ward_number,
                w.ward_name
            FROM users u
            LEFT JOIN wards w ON u.ward_id = w.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (filters.role) {
            sql += ` AND u.role = $${paramIndex}`;
            params.push(filters.role);
            paramIndex++;
        }
        
        if (filters.ward_id) {
            sql += ` AND u.ward_id = $${paramIndex}`;
            params.push(filters.ward_id);
            paramIndex++;
        }
        
        sql += ' ORDER BY u.created_at DESC';
        
        const result = await db.query(sql, params);
        return result.rows;
        
    } catch (error) {
        logger.error('Error getting users:', error);
        throw error;
    }
}

/**
 * Update user
 * @param {string} userId - User UUID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated user
 */
async function updateUser(userId, data) {
    try {
        const allowedFields = ['email', 'full_name', 'ward_id'];
        const updateData = {};
        
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });
        
        if (data.password) {
            const passwordValidation = validatePassword(data.password);
            if (!passwordValidation.valid) {
                throw new Error(passwordValidation.error);
            }
            updateData.password_hash = await hashPassword(data.password);
        }
        
        if (Object.keys(updateData).length === 0) {
            throw new Error('No valid fields to update');
        }
        
        updateData.updated_at = new Date();
        
        const result = await db.update('users', updateData, { id: userId });
        
        if (result.length === 0) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        
        const user = result[0];
        delete user.password_hash;
        
        logger.info(`User updated: ${userId}`);
        
        return user;
        
    } catch (error) {
        logger.error('Error updating user:', error);
        throw error;
    }
}

/**
 * Change password
 * @param {string} userId - User UUID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
async function changePassword(userId, oldPassword, newPassword) {
    try {
        // Get user
        const user = await db.findOne('users', { id: userId });
        
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        
        // Verify old password
        const isValidPassword = await comparePassword(oldPassword, user.password_hash);
        
        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }
        
        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.error);
        }
        
        // Hash new password
        const password_hash = await hashPassword(newPassword);
        
        // Update password
        await db.update('users', { password_hash }, { id: userId });
        
        logger.info(`Password changed for user: ${userId}`);
        
        return true;
        
    } catch (error) {
        logger.error('Error changing password:', error);
        throw error;
    }
}

module.exports = {
    register,
    login,
    getUserById,
    getUsers,
    updateUser,
    changePassword,
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken
};
