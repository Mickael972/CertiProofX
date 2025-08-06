/**
 * Error handling middleware for CertiProof X Backend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 *
 * Centralized error handling and response formatting
 */

const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Global error handler middleware
 */
const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown',
  };

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error = 'Validation error';
    errorResponse.message = error.message;
    errorResponse.code = 'VALIDATION_ERROR';
    errorResponse.details = error.errors || error.details;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    errorResponse.error = 'Invalid data format';
    errorResponse.message = 'Invalid data format provided';
    errorResponse.code = 'CAST_ERROR';
  } else if (error.name === 'MulterError') {
    statusCode = 400;
    errorResponse.error = 'File upload error';
    errorResponse.code = 'UPLOAD_ERROR';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        errorResponse.message = `File too large. Maximum size is ${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`;
        statusCode = 413;
        break;
      case 'LIMIT_FILE_COUNT':
        errorResponse.message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        errorResponse.message = 'Unexpected file field';
        break;
      default:
        errorResponse.message = error.message || 'File upload failed';
    }
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.error = 'Authentication error';
    errorResponse.message = 'Invalid or expired token';
    errorResponse.code = 'AUTH_ERROR';
  } else if (
    error.name === 'SyntaxError' &&
    error.type === 'entity.parse.failed'
  ) {
    statusCode = 400;
    errorResponse.error = 'Invalid JSON';
    errorResponse.message = 'Request body contains invalid JSON';
    errorResponse.code = 'JSON_PARSE_ERROR';
  } else if (error.code === 'ENOENT') {
    statusCode = 404;
    errorResponse.error = 'File not found';
    errorResponse.message = 'Requested file does not exist';
    errorResponse.code = 'FILE_NOT_FOUND';
  } else if (error.code === 'EACCES') {
    statusCode = 403;
    errorResponse.error = 'Permission denied';
    errorResponse.message = 'Insufficient permissions to access resource';
    errorResponse.code = 'PERMISSION_DENIED';
  } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
    statusCode = 503;
    errorResponse.error = 'Service temporarily unavailable';
    errorResponse.message = 'External service timeout or connection reset';
    errorResponse.code = 'SERVICE_TIMEOUT';
  } else if (error.status && error.status >= 400 && error.status < 600) {
    statusCode = error.status;
    errorResponse.error = error.name || 'HTTP Error';
    errorResponse.message = error.message || 'HTTP error occurred';
    errorResponse.code = error.code || `HTTP_${statusCode}`;
  }

  // Custom application errors
  else if (error.isOperational) {
    statusCode = error.statusCode || 400;
    errorResponse.error = error.name || 'Application error';
    errorResponse.message = error.message;
    errorResponse.code = error.code || 'APP_ERROR';
  }

  // Include stack trace in development
  if (config.server.env === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.details = {
      name: error.name,
      cause: error.cause,
      errno: error.errno,
      syscall: error.syscall,
      path: error.path,
    };
  }

  // Security headers
  res.removeHeader('X-Powered-By');

  // CORS headers for error responses
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = {
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} does not exist`,
    code: 'ENDPOINT_NOT_FOUND',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/upload',
      'POST /api/certificate/generate',
      'POST /api/certificate/qr',
      'GET /api/verification/:tokenId',
      'GET /api/metadata/:tokenId',
    ],
  };

  logger.warn('404 Not Found:', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch promise rejections
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for operational errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.code = code || `ERROR_${statusCode}`;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Rate limit error handler
 */
const rateLimitHandler = (req, res) => {
  logger.security('Rate limit exceeded', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
  });

  res.status(429).json({
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: req.rateLimit?.resetTime || 900, // 15 minutes
    timestamp: new Date().toISOString(),
  });
};

/**
 * Validation error formatter
 */
const formatValidationErrors = (errors) => {
  return errors.map((error) => ({
    field: error.param || error.path,
    message: error.msg || error.message,
    value: error.value,
    location: error.location,
  }));
};

/**
 * Security error handler
 */
const securityErrorHandler = (error, req, res, next) => {
  if (error.type === 'security') {
    logger.security('Security violation', {
      type: error.subtype,
      message: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(403).json({
      success: false,
      error: 'Security violation',
      message: 'Request blocked for security reasons',
      code: 'SECURITY_VIOLATION',
      timestamp: new Date().toISOString(),
    });
  }

  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  rateLimitHandler,
  formatValidationErrors,
  securityErrorHandler,
};
