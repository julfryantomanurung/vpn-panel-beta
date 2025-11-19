// Configuration settings for VPN API
require('dotenv').config();

const config = {
    // Server Configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    
    // Database Configuration (for future use)
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'vpn_panel',
        user: process.env.DB_USER || 'vpn_user',
        password: process.env.DB_PASSWORD || ''
    },
    
    // Rate Limiting Configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        loginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5
    },
    
    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    },
    
    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    }
};

module.exports = config;