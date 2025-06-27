const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  aiResponse: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['SYMPTOM_QUERY', 'REPORT_REQUEST', 'MEDICATION_QUERY', 'GENERAL_QUESTION', 'OTHER'],
    default: 'OTHER'
  },
  aiResponseType: {
    type: String,
    enum: ['SUGGESTION', 'CLARIFICATION', 'DONT_KNOW', 'ERROR', 'OTHER'],
    default: 'OTHER'
  },
  metadata: {
    queryTopics: [String],
    suggestedActions: [String],
    confidence: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster querying
chatMessageSchema.index({ userId: 1, timestamp: -1 });
chatMessageSchema.index({ messageType: 1 });
chatMessageSchema.index({ aiResponseType: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema); 