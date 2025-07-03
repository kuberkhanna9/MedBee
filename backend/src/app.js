const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const winston = require('winston');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { checkAuditLogging } = require('./middleware/auth');
const logger = require('./utils/logger');
require('dotenv').config();

const { connectDB } = require('./config/database');

// Initialize express app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply audit logging to all routes
app.use(checkAuditLogging);

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    name: 'MedBee API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      base: '/api/v1',
      health: '/health',
      auth: {
        register: '/api/v1/auth/register',
        login: '/api/v1/auth/login',
        profile: '/api/v1/auth/me',
        updateProfile: '/api/v1/auth/profile'
      },
      chat: {
        send: '/api/v1/chat/send',
        history: '/api/v1/chat/history'
      },
      analytics: {
        healthMetrics: '/api/v1/analytics/health-metrics',
        medicationAdherence: '/api/v1/analytics/medication-adherence',
        vaccinationStatus: '/api/v1/analytics/vaccination-status',
        appUsage: '/api/v1/analytics/app-usage'
      },
      admin: {
        dashboard: '/admin/dashboard',
        login: '/admin/login'
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server and connect to database
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database first
    const dbConnected = await connectDB();
    if (!dbConnected) {
      logger.warn('Server starting without database connection');
    }

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}`);
      logger.info(`Admin dashboard available at http://localhost:${PORT}/admin/dashboard`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; 