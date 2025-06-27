const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'image', 'document']
  },
  category: {
    type: String,
    enum: ['lab_report', 'prescription', 'imaging', 'discharge_summary', 'other'],
    default: 'other'
  },
  recordDate: {
    type: Date,
    required: true
  },
  provider: String,
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
medicalRecordSchema.index({ user: 1, recordDate: -1 });
medicalRecordSchema.index({ user: 1, category: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord; 