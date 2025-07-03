const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { sendMessage, getChatHistory, logChat, getChatInsights } = require('../controllers/chatController');

// Protect all routes
router.use(protect);

// Regular user routes
router.post('/send', sendMessage);
router.post('/log', logChat);  // New endpoint for logging Gemini interactions
router.get('/history', getChatHistory);

// Admin only routes
router.get('/insights', isAdmin, getChatInsights);

module.exports = router; 