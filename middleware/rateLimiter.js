const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');
const config = require('../config/config');

// Custom rate limit handler
const rateLimitHandler = (req, res) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    method: req.method
  });
  
  res.status(429).json({
    message: 'Too many requests, please try again later',
    retryAfter: res.getHeader('Retry-After')
  });
};

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  }
});

// Strict rate limiter for login endpoint (5 requests per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.loginMax,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

// Generous rate limiter for general routes (1000 requests per 15 minutes)
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 1000,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  }
});

module.exports = {
  apiLimiter,
  loginLimiter,
  generalLimiter
};
