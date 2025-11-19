'use strict';

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('./utils/logger');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const setupSwagger = require('./config/swagger');

// Import routes
const vpnUserRoutes = require('./routes/vpn-user.routes');
const menuRoutes = require('./routes/menu.routes');
const systemRoutes = require('./routes/system.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Configuration
app.use(morgan('dev')); // Logging middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable CORS

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'VPN Panel API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/vpn/users', vpnUserRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/system', systemRoutes);

// Legacy route for backward compatibility
app.get('/api/vpn', (req, res) => {
    res.json({
        success: true,
        message: 'VPN REST API',
        version: '1.0.0',
        documentation: '/api-docs'
    });
});

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});
