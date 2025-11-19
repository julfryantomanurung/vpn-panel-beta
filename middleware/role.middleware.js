const logger = require('../utils/logger');

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of roles that can access the route
 * @returns {function} Express middleware
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    // Get user from request (set by auth middleware)
    const user = req.user;

    if (!user) {
      logger.warn('No user found in request for role check');
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Check if user has required role
    const userRole = user.role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      logger.warn(`User ${user.username || 'unknown'} attempted to access route requiring roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Admin only middleware
 */
function requireAdmin(req, res, next) {
  return requireRole(['admin'])(req, res, next);
}

module.exports = {
  requireRole,
  requireAdmin,
};
