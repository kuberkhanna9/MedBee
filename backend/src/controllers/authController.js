const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Default JWT secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || 'medbee-default-jwt-secret-development-only';

// Generate JWT Token
const generateToken = (id) => {
  if (!id) {
    throw new Error('User ID is required to generate token');
  }
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      logger.warn('Login attempt with missing credentials');
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user and include password field for comparison
    const user = await User.findOne({ email }).select('+password');
    
    // If no user found, return early with 401
    if (!user) {
      logger.warn(`Login attempt with non-existent email: ${email}`);
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Verify password
    try {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.warn(`Invalid password attempt for user: ${email}`);
        return res.status(401).json({
          message: 'Invalid credentials'
        });
      }
    } catch (error) {
      logger.error(`Password comparison error for user ${email}:`, error);
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);
    logger.info(`User logged in successfully: ${email}`);

    // Send response
    res.json({
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      message: 'An error occurred during login. Please try again.'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.body.healthProfile) {
        user.healthProfile = {
          ...user.healthProfile,
          ...req.body.healthProfile
        };
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        healthProfile: updatedUser.healthProfile,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({
        message: 'User not found'
      });
    }
  } catch (error) {
    logger.error('Profile update error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
}; 