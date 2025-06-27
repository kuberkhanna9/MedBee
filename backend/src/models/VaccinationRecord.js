const mongoose = require('mongoose');

const vaccinationRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dateReceived: {
    type: Date,
    required: true
  },
  nextDoseDate: Date,
  provider: String,
  batchNumber: String,
  location: String,
  notes: String,
  documentUrl: String,
  status: {
    type: String,
    enum: ['completed', 'scheduled', 'overdue'],
    default: 'completed'
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
vaccinationRecordSchema.index({ user: 1, dateReceived: -1 });
vaccinationRecordSchema.index({ user: 1, nextDoseDate: 1 });

// Virtual for checking if next dose is due
vaccinationRecordSchema.virtual('isDue').get(function() {
  if (!this.nextDoseDate) return false;
  return new Date() >= this.nextDoseDate;
});

const VaccinationRecord = mongoose.model('VaccinationRecord', vaccinationRecordSchema);

module.exports = VaccinationRecord; 