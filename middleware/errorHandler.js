// Middleware for handling errors

const logger = require('../config/logger');

// Custom Error Classes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

// Async Handler
const asyncHandler = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Global Error Handler
const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.isOperational ? err.statusCode : 500;
    const message = err.isOperational ? err.message : 'Something went wrong!';
    
    // Log error
    const errorLog = {
        message: err.message,
        statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip,
        user: req.user?.username || 'anonymous',
        stack: err.stack
    };
    
    if (statusCode >= 500) {
        logger.error('Server error', errorLog);
    } else {
        logger.warn('Client error', errorLog);
    }
    
    // Send error response
    const response = {
        message
    };
    
    // Include validation errors if present
    if (err.errors) {
        response.errors = err.errors;
    }
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'development' && !err.isOperational) {
        response.stack = err.stack;
    }
    
    res.status(statusCode).json(response);
};

// Not Found Handler
const notFoundHandler = (req, res, next) => {
    logger.warn('Route not found', {
        path: req.path,
        method: req.method,
        ip: req.ip
    });
    next(new NotFoundError());
};

module.exports = {
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    asyncHandler,
    globalErrorHandler,
    notFoundHandler,
};