const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Default to localhost if no URI is provided
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Medique';

let isConnected = false;

const connectDB = async () => {
  if (!MONGODB_URI) {
    logger.error('MongoDB URI is not defined');
    return false;
  }

  try {
    if (isConnected) {
      logger.info('Using existing database connection');
      return true;
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      // MongoDB now enables these by default, but keeping them for clarity
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    isConnected = false;
    return false;
  }
};

// Export both the connection function and status
module.exports = {
  connectDB,
  isConnected: () => isConnected
}; 