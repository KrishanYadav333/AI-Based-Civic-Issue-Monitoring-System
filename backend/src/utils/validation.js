// Validation Utilities
// 100% FREE STACK

const { REGEX, GEO_CONFIG, AI_CONFIG, UPLOAD_CONFIG } = require('../core/constants');

/**
 * Validate GPS coordinates
 */
function validateCoordinates(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  // Check if valid numbers
  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      valid: false,
      error: 'Coordinates must be valid numbers',
    };
  }

  // Check latitude range
  if (latitude < GEO_CONFIG.MIN_LATITUDE || latitude > GEO_CONFIG.MAX_LATITUDE) {
    return {
      valid: false,
      error: `Latitude must be between ${GEO_CONFIG.MIN_LATITUDE} and ${GEO_CONFIG.MAX_LATITUDE}`,
    };
  }

  // Check longitude range
  if (longitude < GEO_CONFIG.MIN_LONGITUDE || longitude > GEO_CONFIG.MAX_LONGITUDE) {
    return {
      valid: false,
      error: `Longitude must be between ${GEO_CONFIG.MIN_LONGITUDE} and ${GEO_CONFIG.MAX_LONGITUDE}`,
    };
  }

  // Optional: Check if within Vadodara city bounds
  const { north, south, east, west } = GEO_CONFIG.CITY_BOUNDS;
  if (latitude < south || latitude > north || longitude < west || longitude > east) {
    return {
      valid: true,
      warning: 'Coordinates are outside Vadodara city bounds',
      latitude,
      longitude,
    };
  }

  return {
    valid: true,
    latitude,
    longitude,
  };
}

/**
 * Validate email address
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  if (!REGEX.EMAIL.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate phone number (Indian format)
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  const cleanPhone = phone.replace(/\s|-/g, '');

  if (!REGEX.PHONE.test(cleanPhone)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return { valid: true, phone: cleanPhone };
}

/**
 * Validate username
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }

  if (!REGEX.USERNAME.test(username)) {
    return {
      valid: false,
      error: 'Username must be 3-30 characters and contain only letters, numbers, and underscores',
    };
  }

  return { valid: true };
}

/**
 * Validate UUID format
 */
function validateUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, error: 'UUID is required' };
  }

  if (!REGEX.UUID.test(uuid)) {
    return { valid: false, error: 'Invalid UUID format' };
  }

  return { valid: true };
}

/**
 * Validate issue type
 */
function validateIssueType(issueType) {
  const { ISSUE_TYPES } = require('../core/constants');
  
  if (!issueType || typeof issueType !== 'string') {
    return { valid: false, error: 'Issue type is required' };
  }

  const validTypes = Object.keys(ISSUE_TYPES);
  
  if (!validTypes.includes(issueType)) {
    return {
      valid: false,
      error: `Invalid issue type. Must be one of: ${validTypes.join(', ')}`,
    };
  }

  return { valid: true, issueType };
}

/**
 * Validate priority level
 */
function validatePriority(priority) {
  const { PRIORITY_LEVELS } = require('../core/constants');
  
  if (!priority || typeof priority !== 'string') {
    return { valid: false, error: 'Priority is required' };
  }

  const validPriorities = Object.values(PRIORITY_LEVELS);
  
  if (!validPriorities.includes(priority)) {
    return {
      valid: false,
      error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
    };
  }

  return { valid: true, priority };
}

/**
 * Validate issue status
 */
function validateStatus(status) {
  const { ISSUE_STATUS } = require('../core/constants');
  
  if (!status || typeof status !== 'string') {
    return { valid: false, error: 'Status is required' };
  }

  const validStatuses = Object.values(ISSUE_STATUS);
  
  if (!validStatuses.includes(status)) {
    return {
      valid: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    };
  }

  return { valid: true, status };
}

/**
 * Validate user role
 */
function validateRole(role) {
  const { USER_ROLES } = require('../core/constants');
  
  if (!role || typeof role !== 'string') {
    return { valid: false, error: 'Role is required' };
  }

  const validRoles = Object.values(USER_ROLES);
  
  if (!validRoles.includes(role)) {
    return {
      valid: false,
      error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
    };
  }

  return { valid: true, role };
}

/**
 * Validate AI confidence score
 */
function validateConfidence(confidence) {
  const score = parseFloat(confidence);

  if (isNaN(score)) {
    return { valid: false, error: 'Confidence must be a number' };
  }

  if (score < 0 || score > 1) {
    return { valid: false, error: 'Confidence must be between 0 and 1' };
  }

  return { valid: true, confidence: score };
}

/**
 * Validate file upload
 */
function validateFileUpload(file) {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  // Check file size
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!AI_CONFIG.ALLOWED_FORMATS.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed formats: ${AI_CONFIG.ALLOWED_FORMATS.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate pagination parameters
 */
function validatePagination(page, limit) {
  const { PAGINATION } = require('../core/constants');
  
  const pageNum = parseInt(page) || PAGINATION.DEFAULT_PAGE;
  const limitNum = parseInt(limit) || PAGINATION.DEFAULT_LIMIT;

  if (pageNum < 1) {
    return { valid: false, error: 'Page must be greater than 0' };
  }

  if (limitNum < 1 || limitNum > PAGINATION.MAX_LIMIT) {
    return {
      valid: false,
      error: `Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`,
    };
  }

  return {
    valid: true,
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  };
}

/**
 * Validate date range
 */
function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return { valid: false, error: 'Invalid start date' };
  }

  if (isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid end date' };
  }

  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  return { valid: true, startDate: start, endDate: end };
}

/**
 * Sanitize string input
 */
function sanitizeString(input, maxLength = 500) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags and trim
  const sanitized = input
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, maxLength);

  return sanitized;
}

/**
 * Validate required fields
 */
function validateRequiredFields(data, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(', ')}`,
      missing,
    };
  }

  return { valid: true };
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }

  // Check for at least one letter and one number
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  return { valid: true };
}

module.exports = {
  validateCoordinates,
  validateEmail,
  validatePhone,
  validateUsername,
  validatePassword,
  validateUUID,
  validateIssueType,
  validatePriority,
  validateStatus,
  validateRole,
  validateConfidence,
  validateFileUpload,
  validatePagination,
  validateDateRange,
  sanitizeString,
  validateRequiredFields,
};
