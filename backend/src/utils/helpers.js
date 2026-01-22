// Helper Utilities
// 100% FREE STACK

const { ISSUE_TYPES, PRIORITY_SCORES, PRIORITY_LEVELS } = require('../core/constants');

/**
 * Calculate issue priority based on multiple factors
 */
function calculateIssuePriority(issueType, aiConfidence, options = {}) {
  const { wardImportance = 1, timeOfDay = null, similarIssuesCount = 0 } = options;

  // Get base priority from issue type
  const issueConfig = ISSUE_TYPES[issueType];
  if (!issueConfig) {
    return PRIORITY_LEVELS.MEDIUM;
  }

  let baseScore = PRIORITY_SCORES[issueConfig.defaultPriority];

  // Adjust based on AI confidence
  // High confidence (>0.8) increases priority
  if (aiConfidence > 0.8) {
    baseScore += 0.5;
  } else if (aiConfidence < 0.4) {
    baseScore -= 0.5;
  }

  // Adjust based on ward importance (1-3 scale)
  baseScore += (wardImportance - 1) * 0.3;

  // Adjust based on time of day
  // Peak hours (8-10 AM, 5-8 PM) increase priority
  if (timeOfDay) {
    const hour = timeOfDay.getHours();
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
      baseScore += 0.3;
    }
  }

  // Adjust based on similar issues in area
  // Multiple similar issues indicate a bigger problem
  if (similarIssuesCount >= 3) {
    baseScore += 1;
  } else if (similarIssuesCount >= 2) {
    baseScore += 0.5;
  }

  // Map score to priority level
  if (baseScore >= 4) {
    return PRIORITY_LEVELS.CRITICAL;
  } else if (baseScore >= 3) {
    return PRIORITY_LEVELS.HIGH;
  } else if (baseScore >= 2) {
    return PRIORITY_LEVELS.MEDIUM;
  } else {
    return PRIORITY_LEVELS.LOW;
  }
}

/**
 * Map AI classification to issue type
 */
function mapAIClassToIssueType(aiClass) {
  // Search through all issue types to find matching AI class
  for (const [typeCode, config] of Object.entries(ISSUE_TYPES)) {
    if (config.aiClasses.includes(aiClass.toLowerCase())) {
      return typeCode;
    }
  }

  // Default fallback
  return null;
}

/**
 * Format issue number
 */
function formatIssueNumber(sequenceNumber, year = new Date().getFullYear()) {
  const paddedNumber = String(sequenceNumber).padStart(6, '0');
  return `VMC${year}${paddedNumber}`;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if coordinates are within radius
 */
function isWithinRadius(lat1, lon1, lat2, lon2, radiusMeters) {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusMeters;
}

/**
 * Calculate time difference in minutes
 */
function getTimeDifferenceMinutes(startDate, endDate = new Date()) {
  const diff = endDate - new Date(startDate);
  return Math.floor(diff / (1000 * 60));
}

/**
 * Calculate time difference in hours
 */
function getTimeDifferenceHours(startDate, endDate = new Date()) {
  return getTimeDifferenceMinutes(startDate, endDate) / 60;
}

/**
 * Check if SLA is breached
 */
function isSLABreached(submittedAt, priority, currentStatus) {
  const { SLA_TARGETS } = require('../core/constants');
  
  const targetMinutes = SLA_TARGETS[priority];
  if (!targetMinutes) return false;

  // If already resolved or closed, not breached
  if (currentStatus === 'resolved' || currentStatus === 'closed') {
    return false;
  }

  const elapsedMinutes = getTimeDifferenceMinutes(submittedAt);
  return elapsedMinutes > targetMinutes;
}

/**
 * Generate notification payload
 */
function generateNotificationPayload(type, data) {
  const { NOTIFICATION_TYPES } = require('../core/constants');
  
  const templates = {
    [NOTIFICATION_TYPES.ISSUE_SUBMITTED]: {
      title: 'New Issue Submitted',
      message: `Issue ${data.issueNumber} has been submitted in ${data.wardName}`,
    },
    [NOTIFICATION_TYPES.ISSUE_ASSIGNED]: {
      title: 'Issue Assigned',
      message: `Issue ${data.issueNumber} has been assigned to you`,
    },
    [NOTIFICATION_TYPES.ISSUE_RESOLVED]: {
      title: 'Issue Resolved',
      message: `Your issue ${data.issueNumber} has been resolved`,
    },
    [NOTIFICATION_TYPES.HIGH_PRIORITY_ALERT]: {
      title: 'High Priority Alert',
      message: `High priority issue detected: ${data.issueType} in ${data.wardName}`,
    },
    [NOTIFICATION_TYPES.SLA_BREACH]: {
      title: 'SLA Breach Alert',
      message: `Issue ${data.issueNumber} has exceeded SLA target`,
    },
  };

  const template = templates[type] || {
    title: 'Notification',
    message: 'You have a new notification',
  };

  return {
    type,
    title: template.title,
    message: template.message,
    data,
  };
}

/**
 * Format response with pagination metadata
 */
function formatPaginatedResponse(data, page, limit, total) {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Parse sort parameters
 */
function parseSortParams(sortBy = 'created_at', order = 'DESC') {
  const validOrders = ['ASC', 'DESC'];
  const validSortFields = [
    'created_at',
    'updated_at',
    'priority',
    'status',
    'submitted_at',
    'resolved_at',
  ];

  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  return { sortField, sortOrder };
}

/**
 * Generate random string
 */
function generateRandomString(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleep/delay function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async operation
 */
async function retryOperation(operation, maxRetries = 3, delayMs = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(delayMs * (i + 1)); // Exponential backoff
      }
    }
  }

  throw lastError;
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Deep clone object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove undefined/null values from object
 */
function removeEmpty(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined)
  );
}

module.exports = {
  calculateIssuePriority,
  mapAIClassToIssueType,
  formatIssueNumber,
  calculateDistance,
  isWithinRadius,
  getTimeDifferenceMinutes,
  getTimeDifferenceHours,
  isSLABreached,
  generateNotificationPayload,
  formatPaginatedResponse,
  parseSortParams,
  generateRandomString,
  sleep,
  retryOperation,
  truncateText,
  deepClone,
  removeEmpty,
};
