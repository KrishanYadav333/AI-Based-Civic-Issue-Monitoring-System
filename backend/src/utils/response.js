// Response Formatter Utility
// 100% FREE STACK

const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../core/constants');

/**
 * Success response formatter
 */
function successResponse(res, data, message = 'Success', statusCode = HTTP_STATUS.OK) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Error response formatter
 */
function errorResponse(res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

/**
 * Validation error response
 */
function validationErrorResponse(res, errors) {
  return errorResponse(
    res,
    ERROR_MESSAGES.INVALID_INPUT,
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errors
  );
}

/**
 * Not found response
 */
function notFoundResponse(res, message = ERROR_MESSAGES.NOT_FOUND) {
  return errorResponse(res, message, HTTP_STATUS.NOT_FOUND);
}

/**
 * Unauthorized response
 */
function unauthorizedResponse(res, message = ERROR_MESSAGES.UNAUTHORIZED) {
  return errorResponse(res, message, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Forbidden response
 */
function forbiddenResponse(res, message = ERROR_MESSAGES.FORBIDDEN) {
  return errorResponse(res, message, HTTP_STATUS.FORBIDDEN);
}

/**
 * Conflict response
 */
function conflictResponse(res, message) {
  return errorResponse(res, message, HTTP_STATUS.CONFLICT);
}

/**
 * Created response
 */
function createdResponse(res, data, message = 'Resource created successfully') {
  return successResponse(res, data, message, HTTP_STATUS.CREATED);
}

/**
 * No content response
 */
function noContentResponse(res) {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
}

/**
 * Paginated response
 */
function paginatedResponse(res, data, pagination, message = 'Success') {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse,
};
