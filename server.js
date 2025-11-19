'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const mongoSanitize = require('express-mongo-sanitize');

// Import configurations
const config = require('./config/config');
const logger = require('./config/logger');
const swaggerSpecs = require('./config/swagger');

// Import middleware
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter, loginLimiter, generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Initialize Express app
const app = express();
const PORT = config.port;

// Trust proxy - important for rate limiting behind proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// HTTP request logging with Morgan and Winston
app.use(morgan('combined', { stream: logger.stream }));

// General rate limiter for all routes
app.use(generalLimiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'VPN Panel API Documentation'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/users', apiLimiter, userRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to VPN Panel API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth/login',
      users: '/api/users'
    }
  });
});

// 404 handler - must be after all other routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: config.nodeEnv,
    documentation: `http://localhost:${PORT}/api-docs`
  });
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

module.exports = app;
