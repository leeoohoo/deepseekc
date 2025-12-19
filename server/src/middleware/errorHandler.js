/**
 * Unified error handling middleware for DeepSeek CLI Website
 * Provides structured error responses, logging, and security filtering
 */

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // Mark as operational error (not programming error)
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

export class EmailError extends AppError {
  constructor(message, originalError = null) {
    super(message, 503); // Service unavailable for email errors
    this.originalError = originalError;
  }
}

export class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500);
    this.originalError = originalError;
  }
}

/**
 * Structured logging for errors
 */
function logError(error, req) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode || 500,
      isOperational: error.isOperational || false
    },
    request: req ? {
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent')
    } : null,
    environment: process.env.NODE_ENV || 'development'
  };
  
  // Use console.error for now, can be replaced with proper logging service
  console.error(JSON.stringify(logEntry));
  
  // Log original error if present
  if (error.originalError) {
    console.error('Original error:', error.originalError);
  }
}

/**
 * Structured logging for general events
 */
export function logEvent(event, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    event,
    ...data,
    environment: process.env.NODE_ENV || 'development'
  };
  
  console.log(JSON.stringify(logEntry));
}

/**
 * Create safe error response for client
 */
function createErrorResponse(error, includeDetails = false) {
  const baseResponse = {
    success: false,
    error: error.name,
    message: error.message
  };
  
  // Only include additional details in development or if explicitly allowed
  if (includeDetails) {
    baseResponse.details = {
      statusCode: error.statusCode,
      stack: error.stack,
      errors: error.errors
    };
    
    // Include original error message if available
    if (error.originalError) {
      baseResponse.details.originalError = {
        name: error.originalError.name,
        message: error.originalError.message
      };
    }
  }
  
  return baseResponse;
}

/**
 * Check if error should include details in response
 */
function shouldIncludeErrorDetails() {
  const env = process.env.NODE_ENV || 'development';
  const showDetails = process.env.ERROR_DETAILS === 'true';
  
  return env === 'development' || env === 'test' || showDetails;
}

/**
 * Main error handling middleware
 */
export function errorHandlerMiddleware(err, req, res, next) {
  // Default to 500 if no status code
  const statusCode = err.statusCode || 500;
  const includeDetails = shouldIncludeErrorDetails();
  
  // Log the error
  logError(err, req);
  
  // Handle specific error types
  if (err.name === 'ValidationError' || err.name === 'ValidatorError') {
    // Mongoose validation error
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Validation failed',
      errors: err.errors ? Object.values(err.errors).map(e => e.message) : [err.message]
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'TokenError',
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'TokenExpiredError',
      message: 'Token expired'
    });
  }
  
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // MongoDB errors
    return res.status(500).json({
      success: false,
      error: 'DatabaseError',
      message: 'Database operation failed',
      details: includeDetails ? { mongoError: err.message } : undefined
    });
  }
  
  // Handle our custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(createErrorResponse(err, includeDetails));
  }
  
  // Handle generic errors
  const response = {
    success: false,
    error: 'InternalServerError',
    message: 'An unexpected error occurred'
  };
  
  if (includeDetails) {
    response.details = {
      message: err.message,
      stack: err.stack
    };
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Async handler wrapper to catch async errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler middleware
 */
export function notFoundMiddleware(req, res, next) {
  const error = new NotFoundError(`Route not found: ${req.method} ${req.url}`);
  next(error);
}

/**
 * Validate environment variables on startup
 */
export function validateEnvironment() {
  const requiredVars = [
    'JWT_SECRET',
    'MONGODB_URI'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    
    if (process.env.NODE_ENV === 'production') {
      throw new AppError(errorMessage, 500);
    } else {
      console.warn(`⚠️  ${errorMessage}`);
    }
  }
  
  // Validate email configuration if email service is expected to work
  if (process.env.EMAIL_HOST) {
    const emailVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
    const missingEmailVars = emailVars.filter(varName => !process.env[varName]);
    
    if (missingEmailVars.length > 0) {
      console.warn(`⚠️  Email configuration incomplete. Missing: ${missingEmailVars.join(', ')}`);
    }
  }
  
  console.log('✅ Environment validation passed');
  return true;
}

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  EmailError,
  DatabaseError,
  errorHandlerMiddleware,
  asyncHandler,
  notFoundMiddleware,
  validateEnvironment,
  logEvent
};