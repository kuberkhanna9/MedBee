require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');
const { connectDB } = require('../config/database');

const createDummyUser = async () => {
  try {
    // Connect to database
    const dbConnected = await connectDB();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }

    // Check if test user already exists
    const userExists = await User.findOne({ email: 'test@medbee.com' });
    if (userExists) {
      logger.info('Test user already exists');
      process.exit(0);
    }

    // Create test user
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@medbee.com',
      password: 'test123', // This will be hashed by the User model
      role: 'user',
      healthProfile: {
        dateOfBirth: '1990-01-01',
        gender: 'Not Specified',
        bloodType: 'O+',
        height: 170,
        weight: 70,
        allergies: ['None'],
        chronicConditions: ['None']
      }
    });

    logger.info('Test user created successfully');
    logger.info('Email: test@medbee.com');
    logger.info('Password: test123');
    
    process.exit(0);
  } catch (error) {
    logger.error('Error creating test user:', error);
    process.exit(1);
  }
};

createDummyUser(); 