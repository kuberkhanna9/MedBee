const ChatMessage = require('../models/ChatMessage');
const logger = require('../utils/logger');

// @desc    Send a chat message
// @route   POST /api/v1/chat/send
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Store user's message
    const userMessage = await ChatMessage.create({
      userId,
      message,
      role: 'user'
    });

    // For now, just echo back the message (placeholder for AI integration)
    const assistantMessage = await ChatMessage.create({
      userId,
      message: `Echo: ${message}`, // This will be replaced with AI response later
      role: 'assistant'
    });

    res.status(200).json({
      success: true,
      data: {
        userMessage,
        assistantMessage
      }
    });
  } catch (error) {
    logger.error('Error in chat message:', error);
    next(error);
  }
};

// @desc    Get chat history
// @route   GET /api/v1/chat/history
// @access  Private
const getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ChatMessage.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching chat history:', error);
    next(error);
  }
};

// Helper function to analyze message content
const analyzeMessage = (message) => {
  const messageType = {
    symptoms: /symptoms?|pain|feeling|fever|cough|headache/i,
    reports: /report|test results?|lab|diagnosis/i,
    medications: /medicine|medication|drug|prescription|dose/i
  };

  // Determine message type
  if (messageType.symptoms.test(message)) return 'SYMPTOM_QUERY';
  if (messageType.reports.test(message)) return 'REPORT_REQUEST';
  if (messageType.medications.test(message)) return 'MEDICATION_QUERY';
  return 'GENERAL_QUESTION';
};

// Helper function to analyze AI response
const analyzeAIResponse = (response) => {
  const responsePatterns = {
    dontKnow: /I (don't|cannot|can't) (know|determine|say|tell|assist|help)|unable to/i,
    clarification: /could you (clarify|explain|provide|specify)|need more information/i,
    suggestion: /(suggest|recommend|try|consider|might want to)/i
  };

  // Determine response type
  if (responsePatterns.dontKnow.test(response)) return 'DONT_KNOW';
  if (responsePatterns.clarification.test(response)) return 'CLARIFICATION';
  if (responsePatterns.suggestion.test(response)) return 'SUGGESTION';
  return 'OTHER';
};

// Log chat message and AI response
const logChat = async (req, res) => {
  try {
    const { message, aiResponse } = req.body;
    const userId = req.user._id;

    // Analyze message and response
    const messageType = analyzeMessage(message);
    const aiResponseType = analyzeAIResponse(aiResponse);

    // Extract topics using simple keyword matching
    const topics = message.toLowerCase()
      .match(/\b\w+\b/g)
      .filter(word => word.length > 3)
      .slice(0, 5);

    // Create chat log entry
    const chatMessage = await ChatMessage.create({
      userId,
      message,
      aiResponse,
      messageType,
      aiResponseType,
      metadata: {
        queryTopics: topics,
        suggestedActions: [],
        confidence: 1.0
      }
    });

    res.status(200).json({
      success: true,
      data: chatMessage
    });
  } catch (error) {
    logger.error('Error logging chat:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging chat message'
    });
  }
};

// Get chat insights (admin only)
const getChatInsights = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '7d'; // Default to last 7 days
    const startDate = new Date();
    
    switch(timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get message type distribution
    const messageTypes = await ChatMessage.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: {
        _id: '$messageType',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    // Get AI response type distribution
    const responseTypes = await ChatMessage.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: {
        _id: '$aiResponseType',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    // Get most common topics
    const commonTopics = await ChatMessage.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $unwind: '$metadata.queryTopics' },
      { $group: {
        _id: '$metadata.queryTopics',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Calculate AI effectiveness
    const totalQueries = await ChatMessage.countDocuments({ timestamp: { $gte: startDate } });
    const dontKnowCount = await ChatMessage.countDocuments({
      timestamp: { $gte: startDate },
      aiResponseType: 'DONT_KNOW'
    });

    const effectiveness = {
      totalQueries,
      successRate: ((totalQueries - dontKnowCount) / totalQueries * 100).toFixed(2),
      dontKnowRate: ((dontKnowCount / totalQueries) * 100).toFixed(2)
    };

    res.status(200).json({
      success: true,
      data: {
        timeframe,
        messageTypes,
        responseTypes,
        commonTopics,
        effectiveness
      }
    });
  } catch (error) {
    logger.error('Error getting chat insights:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving chat insights'
    });
  }
};

// Export all controller functions
module.exports = {
  sendMessage,
  getChatHistory,
  logChat,
  getChatInsights
}; 