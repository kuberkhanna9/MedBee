const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect, isAdmin } = require('../middleware/auth');
const { getDashboard, getMetrics } = require('../controllers/adminController');
const User = require('../models/User');
const logger = require('../utils/logger');

// Default JWT secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || 'medbee-default-jwt-secret-development-only';

// Login page
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

// Login handler
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== 'admin') {
      return res.render('admin/login', { error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('admin/login', { error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '1d'
    });

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.redirect('/admin/dashboard');
  } catch (error) {
    logger.error('Login error:', error);
    res.render('admin/login', { error: 'An error occurred during login. Please try again.' });
  }
});

// Protected routes
router.use(protect);
router.use(isAdmin);

// Dashboard routes
router.get('/dashboard', getDashboard);
router.get('/api/metrics', getMetrics);

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin/login');
});

module.exports = router; 