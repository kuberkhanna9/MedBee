const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Default JWT secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || 'medbee-default-jwt-secret-development-only';

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      logger.warn(`Access attempt without token: ${req.method} ${req.originalUrl}`);
      if (req.originalUrl.startsWith('/admin')) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      logger.debug(`Token verified for user ID: ${decoded.id}`);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        logger.warn(`Token valid but user not found: ${decoded.id}`);
        if (req.originalUrl.startsWith('/admin')) {
          return res.redirect('/admin/login');
        }
        return res.status(401).json({
          message: 'User not found'
        });
      }

      next();
    } catch (error) {
      logger.warn(`Invalid token provided: ${error.message}`);
      if (req.originalUrl.startsWith('/admin')) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    next(error);
  }
};

// Grant access to specific roles
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    if (req.originalUrl.startsWith('/admin')) {
      return res.redirect('/admin/login');
    }
    return res.status(403).json({
      message: 'Not authorized to access this route. Admin access required.'
    });
  }
  next();
};

// Audit logging middleware
const auditLog = async (req, res, next) => {
  const oldSend = res.send;
  res.send = async function (data) {
    res.send = oldSend; // Restore the original send
    
    try {
      // Skip audit logging if user is not authenticated
      if (!req.user) {
        logger.debug('Skipping audit log - no authenticated user');
        return res.send(data);
      }

      // Create audit log entry
      await AuditLog.create({
        userId: req.user._id,
        action: req.method,
        endpoint: req.originalUrl,
        method: req.method,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        requestBody: req.method !== 'GET' ? req.body : undefined,
        responseStatus: res.statusCode
      });
    } catch (error) {
      // Log error but don't block the response
      logger.error('Audit logging error:', error);
    }

    return res.send(data); // Call the original send
  };

  next();
};

// Sensitive routes that need audit logging
const sensitiveRoutes = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/profile',
  '/api/v1/health/records',
  '/api/v1/analytics'
];

// Middleware to check if route needs audit logging
const checkAuditLogging = (req, res, next) => {
  const needsAudit = sensitiveRoutes.some(route => req.originalUrl.startsWith(route));
  if (needsAudit) {
    return auditLog(req, res, next);
  }
  next();
};

module.exports = {
  protect,
  isAdmin,
  auditLog,
  checkAuditLogging
}; 