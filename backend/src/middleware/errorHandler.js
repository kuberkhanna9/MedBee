const logger = require('../utils/logger');

// Handle 404 errors
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error
  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : '🥞'
  });

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : '🥞'
  });
};

module.exports = {
  notFound,
  errorHandler
}; 