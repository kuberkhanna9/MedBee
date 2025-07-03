require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');
const { connectDB } = require('../config/database');

const createAdminUser = async () => {
  try {
    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      logger.info('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@medbee.com',
      password: 'admin123', // This will be hashed by the User model
      role: 'admin'
    });

    logger.info('Admin user created successfully');
    logger.info('Email: admin@medbee.com');
    logger.info('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser(); 