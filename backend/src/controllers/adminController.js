const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const HealthMetric = require('../models/HealthMetric');
const Medication = require('../models/Medication');
const logger = require('../utils/logger');
const axios = require('axios');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const fetch = require('node-fetch');
const { isConnected } = require('../config/database');

// Helper function to check frontend status
const checkFrontendStatus = async () => {
  try {
    // Try to fetch the frontend homepage
    const response = await fetch(process.env.FRONTEND_URL || 'http://localhost:3000');
    return response.status === 200;
  } catch (error) {
    logger.error('Error checking frontend status:', error);
    return false;
  }
};

// Helper function to check system status
const checkSystemStatus = async () => {
  const status = {
    backend: true, // We're running, so backend is up
    database: isConnected(), // Use the database connection status
    frontend: await checkFrontendStatus(),
    lastChecked: new Date().toISOString()
  };

  return status;
};

// Helper function to gather all metrics
const gatherMetrics = async () => {
  // Get system status
  const systemStatus = await checkSystemStatus();

  // Get user statistics
  const userStats = {
    total: await User.countDocuments(),
    admins: await User.countDocuments({ role: 'admin' }),
    users: await User.countDocuments({ role: 'user' })
  };

  // Get latest users (excluding password and sensitive fields)
  const latestUsers = await User.find()
    .select('name email role createdAt lastLogin')
    .sort({ createdAt: -1 })
    .limit(50);

  // Get AI chat statistics (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const chatStats = {
    total: await ChatMessage.countDocuments(),
    lastSevenDays: await ChatMessage.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    }),
    aiResponses: await ChatMessage.countDocuments({
      role: 'assistant'
    })
  };

  // Get API request statistics
  const apiStats = await AuditLog.aggregate([
    {
      $match: {
        timestamp: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          method: '$method',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': -1, '_id.method': 1 }
    }
  ]);

  // Get latest API requests
  const latestRequests = await AuditLog.find()
    .sort({ timestamp: -1 })
    .limit(50)
    .select('-requestBody -responseBody');

  // Format the data for charts
  const chartData = {
    dates: [...new Set(apiStats.map(stat => stat._id.date))].sort(),
    methods: {
      GET: apiStats.filter(stat => stat._id.method === 'GET').map(stat => stat.count),
      POST: apiStats.filter(stat => stat._id.method === 'POST').map(stat => stat.count)
    }
  };

  return {
    systemStatus,
    userStats,
    latestUsers,
    chatStats,
    apiStats: chartData,
    latestRequests,
    timestamp: new Date()
  };
};

// @desc    Get admin dashboard data
// @route   GET /admin/dashboard
// @access  Private (Admin only)
const getDashboard = async (req, res) => {
  try {
    const metrics = await gatherMetrics();
    res.render('admin/dashboard', {
      user: req.user,
      ...metrics
    });
  } catch (error) {
    logger.error('Error rendering dashboard:', error);
    // Render a basic error message instead of using error view
    res.status(500).render('admin/dashboard', {
      user: req.user,
      error: 'Error loading dashboard data. Please try again.',
      systemStatus: { backend: true, database: false, lastChecked: new Date() },
      userStats: { total: 0, admins: 0, users: 0 },
      latestUsers: [],
      chatStats: { total: 0, lastSevenDays: 0, aiResponses: 0 },
      apiStats: { dates: [], methods: { GET: [], POST: [] } },
      latestRequests: []
    });
  }
};

// Get admin dashboard metrics API endpoint
const getMetrics = async (req, res) => {
  try {
    const metrics = await gatherMetrics();
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting admin metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving admin metrics'
    });
  }
};

module.exports = {
  getDashboard,
  getMetrics
}; 