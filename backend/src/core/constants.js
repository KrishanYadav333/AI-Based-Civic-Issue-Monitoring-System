// Constants for AI-Based Civic Issue Monitoring System
// 100% FREE STACK

// Issue Types and Department Mapping
const ISSUE_TYPES = {
  pothole: {
    code: 'pothole',
    name: 'Pothole',
    description: 'Road damage and potholes',
    department: 'Roads',
    defaultPriority: 'high',
    aiClasses: ['pothole', 'road_damage'],
  },
  garbage: {
    code: 'garbage',
    name: 'Garbage Accumulation',
    description: 'Trash and waste collection problems',
    department: 'Sanitation',
    defaultPriority: 'medium',
    aiClasses: ['garbage', 'trash', 'waste'],
  },
  debris: {
    code: 'debris',
    name: 'Debris',
    description: 'Scattered waste and rubble',
    department: 'Sanitation',
    defaultPriority: 'medium',
    aiClasses: ['debris', 'rubble', 'construction_waste'],
  },
  stray_cattle: {
    code: 'stray_cattle',
    name: 'Stray Cattle',
    description: 'Abandoned or roaming livestock',
    department: 'AnimalControl',
    defaultPriority: 'medium',
    aiClasses: ['cow', 'cattle', 'buffalo', 'animal'],
  },
  broken_road: {
    code: 'broken_road',
    name: 'Broken Road',
    description: 'Damaged road surfaces',
    department: 'Roads',
    defaultPriority: 'high',
    aiClasses: ['broken_road', 'road_crack', 'damaged_road'],
  },
  open_manhole: {
    code: 'open_manhole',
    name: 'Open Manhole',
    description: 'Uncovered utility access points',
    department: 'Drainage',
    defaultPriority: 'critical',
    aiClasses: ['manhole', 'open_drain', 'uncovered_drain'],
  },
};

// Issue Status
const ISSUE_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
};

// Priority Levels
const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Priority scores for calculation
const PRIORITY_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

// User Roles
const USER_ROLES = {
  SURVEYOR: 'surveyor',
  ENGINEER: 'engineer',
  ADMIN: 'admin',
};

// Notification Types
const NOTIFICATION_TYPES = {
  ISSUE_SUBMITTED: 'issue_submitted',
  ISSUE_ASSIGNED: 'issue_assigned',
  ISSUE_ACCEPTED: 'issue_accepted',
  ISSUE_IN_PROGRESS: 'issue_in_progress',
  ISSUE_RESOLVED: 'issue_resolved',
  ISSUE_CLOSED: 'issue_closed',
  ISSUE_REJECTED: 'issue_rejected',
  HIGH_PRIORITY_ALERT: 'high_priority_alert',
  SLA_BREACH: 'sla_breach',
  DUPLICATE_DETECTED: 'duplicate_detected',
  PRIORITY_ESCALATED: 'priority_escalated',
  CIVIC_VOICE_ALERT: 'civic_voice_alert',
};

// SLA Targets (in minutes)
const SLA_TARGETS = {
  critical: 120,  // 2 hours
  high: 240,      // 4 hours
  medium: 480,    // 8 hours
  low: 1440,      // 24 hours
};

// Duplicate Detection Parameters
const DUPLICATE_DETECTION = {
  RADIUS_METERS: 100,           // 100m radius
  TIME_WINDOW_HOURS: 1,         // Within 1 hour
  MIN_CONFIDENCE_DIFF: 0.15,    // 15% confidence difference threshold
};

// AI Model Configuration
const AI_CONFIG = {
  MIN_CONFIDENCE: 0.25,         // Minimum confidence threshold
  HIGH_CONFIDENCE: 0.75,        // High confidence threshold
  MAX_IMAGE_SIZE: 10485760,     // 10MB
  ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png'],
  IMAGE_QUALITY: 85,            // JPEG quality for compression
};

// Geo-fencing Configuration
const GEO_CONFIG = {
  COORDINATE_PRECISION: 8,      // Decimal places for lat/lng
  MAX_LATITUDE: 90,
  MIN_LATITUDE: -90,
  MAX_LONGITUDE: 180,
  MIN_LONGITUDE: -180,
  // Vadodara city bounds (approximate)
  CITY_BOUNDS: {
    north: 22.35,
    south: 22.25,
    east: 73.25,
    west: 73.15,
  },
};

// File Upload Configuration
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10485760,      // 10MB
  UPLOAD_DIR: './uploads',
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png'],
  IMAGE_MAX_WIDTH: 1920,
  IMAGE_MAX_HEIGHT: 1080,
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Cache TTL (in seconds)
const CACHE_TTL = {
  WARD_DATA: 3600,              // 1 hour
  ISSUE_TYPES: 7200,            // 2 hours
  USER_DATA: 1800,              // 30 minutes
  AI_CLASSIFICATION: 3600,      // 1 hour
  ANALYTICS: 600,               // 10 minutes
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  INVALID_COORDINATES: 'INVALID_COORDINATES',
  WARD_NOT_FOUND: 'WARD_NOT_FOUND',
};

// Success Messages
const SUCCESS_MESSAGES = {
  ISSUE_CREATED: 'Issue submitted successfully',
  ISSUE_ASSIGNED: 'Issue assigned successfully',
  ISSUE_UPDATED: 'Issue updated successfully',
  ISSUE_RESOLVED: 'Issue resolved successfully',
  ISSUE_CLOSED: 'Issue closed successfully',
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESS: 'Login successful',
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  INVALID_INPUT: 'Invalid input data',
  DUPLICATE_ISSUE: 'A similar issue already exists nearby',
  INVALID_COORDINATES: 'Invalid GPS coordinates',
  WARD_NOT_FOUND: 'Ward not found for the given coordinates',
  AI_SERVICE_UNAVAILABLE: 'AI classification service is unavailable',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  DATABASE_ERROR: 'Database operation failed',
};

// Regular Expressions
const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[6-9]\d{9}$/,  // Indian phone numbers
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  ISSUE_NUMBER: /^VMC\d{10}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

// Department List
const DEPARTMENTS = [
  'Roads',
  'Sanitation',
  'Drainage',
  'AnimalControl',
  'Electricity',
  'WaterSupply',
];

module.exports = {
  ISSUE_TYPES,
  ISSUE_STATUS,
  PRIORITY_LEVELS,
  PRIORITY_SCORES,
  USER_ROLES,
  NOTIFICATION_TYPES,
  SLA_TARGETS,
  DUPLICATE_DETECTION,
  AI_CONFIG,
  GEO_CONFIG,
  UPLOAD_CONFIG,
  PAGINATION,
  CACHE_TTL,
  HTTP_STATUS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  REGEX,
  DEPARTMENTS,
};
