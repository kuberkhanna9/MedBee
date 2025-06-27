const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['weight', 'bloodPressure', 'height', 'bmi', 'temperature', 'heartRate', 'bloodSugar']
  },
  value: {
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

// Index for efficient queries
healthMetricSchema.index({ user: 1, type: 1, timestamp: -1 });

const HealthMetric = mongoose.model('HealthMetric', healthMetricSchema);

module.exports = HealthMetric; 