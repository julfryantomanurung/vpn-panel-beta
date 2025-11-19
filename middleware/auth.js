// authentication middleware for VPN API

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../config/logger');

// Middleware function to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        logger.warn('Authentication failed - No token provided', {
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    jwt.verify(token, config.jwt.secret, (err, user) => {
        if (err) {
            logger.warn('Authentication failed - Invalid token', {
                ip: req.ip,
                path: req.path,
                method: req.method,
                error: err.message
            });
            return res.status(403).json({ message: 'Forbidden - Invalid token' });
        }
        
        // Attach user info to request
        req.user = user;
        
        logger.debug('User authenticated successfully', {
            username: user.username,
            path: req.path
        });
        
        next();
    });
};

module.exports = authenticateJWT;