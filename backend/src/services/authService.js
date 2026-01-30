/**
 * Authentication Service
 * User authentication and authorization
 * NOTE: Using plain text passwords for demo purposes - NOT FOR PRODUCTION!
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { USER_ROLES, ERROR_MESSAGES } = require('../core/constants');
const { validateEmail, validateUsername, validatePassword } = require('../utils/validation');
const { AuthenticationError, ValidationError, ConflictError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Store password (plain text for demo)
 * @param {string} password - Plain text password
 * @returns {string} Same password
 */
function hashPassword(password) {
    // No hashing - plain text for demo
    return password;
}

/**
 * Compare passwords (plain text)
 * @param {string} password - Plain text password
 * @param {string} storedPassword - Stored plain text password
 * @returns {boolean} Match result
 */
function comparePassword(password, storedPassword) {
    // Direct comparison - no bcrypt
    return password === storedPassword;
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
            throw new ValidationError('Invalid username format');
        }
        
        if (!validateEmail(email)) {
            throw new ValidationError('Invalid email format');
        }
        
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            throw new ValidationError(passwordValidation.error);
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new ConflictError('Username already exists');
        }
        
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            throw new ConflictError('Email already exists');
        }
        
        // Store password (plain text)
        const password_hash = hashPassword(password);
        
        // Create user
        const user = await User.create({
            username,
            email,
            password_hash,
            role: role || USER_ROLES.SURVEYOR,
            ward_id: ward_id || null,
            full_name: full_name || null
        });
        
        // Convert to plain object
        const userObj = user.toObject();
        
        // Generate token
        const token = generateToken(userObj);
        
        // Remove password hash from response
        delete userObj.password_hash;
        
        logger.info(`User registered: ${username} (${userObj.role})`);
        
        return {
            user: userObj,
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
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });
        
        if (!user) {
            throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        
        // Verify password (plain text comparison)
        const isValidPassword = comparePassword(password, user.password_hash);
        
        if (!isValidPassword) {
            throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        
        // Convert to plain object
        const userObj = user.toObject();
        
        // Generate token
        const token = generateToken(userObj);
        
        // Remove password hash from response
        delete userObj.password_hash;
        
        logger.info(`User logged in: ${userObj.username}`);
        
        return {
            user: userObj,
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
        const user = await User.findById(userId)
            .populate('ward_id', 'ward_number ward_name')
            .select('-password_hash')
            .lean();
        
        return user;
        
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
        const query = {};
        
        if (filters.role) {
            query.role = filters.role;
        }
        
        if (filters.ward_id) {
            query.ward_id = filters.ward_id;
        }
        
        const users = await User.find(query)
            .populate('ward_id', 'ward_number ward_name')
            .select('-password_hash')
            .sort({ createdAt: -1 })
            .lean();
        
        return users;
        
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
                throw new ValidationError(passwordValidation.error);
            }
            updateData.password_hash = await hashPassword(data.password);
        }
        
        if (Object.keys(updateData).length === 0) {
            throw new ValidationError('No valid fields to update');
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        )
        .select('-password_hash')
        .lean();
        
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        
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
        const user = await User.findById(userId);
        
        if (!user) {
            throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }
        
        // Verify old password
        const isValidPassword = await comparePassword(oldPassword, user.password_hash);
        
        if (!isValidPassword) {
            throw new AuthenticationError('Current password is incorrect');
        }
        
        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            throw new ValidationError(passwordValidation.error);
        }
        
        // Hash new password
        const password_hash = await hashPassword(newPassword);
        
        // Update password
        user.password_hash = password_hash;
        await user.save();
        
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
