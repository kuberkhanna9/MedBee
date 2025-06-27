const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued'],
    default: 'active'
  },
  isDiscontinued: {
    type: Boolean,
    default: false
  },
  discontinuedDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
medicationSchema.index({ user: 1, status: 1 });
medicationSchema.index({ user: 1, isDiscontinued: 1 });

// Virtual for checking if medication is current
medicationSchema.virtual('isCurrent').get(function() {
  if (this.isDiscontinued) return false;
  if (!this.endDate) return true;
  return new Date() <= this.endDate;
});

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication; 