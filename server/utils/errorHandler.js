const Logger = require('./logger');
const logger = new Logger('ERROR_HANDLER');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error('Request error', {
    statusCode: err.statusCode,
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: err.stack
  });

  // Handle specific error types
  if (err.code === '23505') {
    // PostgreSQL unique violation
    err.statusCode = 409;
    err.message = 'Resource already exists';
  } else if (err.code === '23503') {
    // PostgreSQL foreign key violation
    err.statusCode = 400;
    err.message = 'Invalid reference';
  } else if (err.code === '23514') {
    // PostgreSQL check violation
    err.statusCode = 400;
    err.message = 'Invalid data';
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
  } else {
    // Production: don't leak stack traces
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        code: err.code
      });
    } else {
      // Programming or other unknown errors: don't leak details
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

/**
 * 404 handler
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`, 'NOT_FOUND');
  next(error);
};

module.exports = { ApiError, errorHandler, asyncHandler, notFound };
