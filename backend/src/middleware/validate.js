const validator = require('validator');

const validateRegistration = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const errors = [];

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate password
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Validate names
  if (!firstName || firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate password
  if (!password || password.length < 1) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

const validateProfileUpdate = (req, res, next) => {
  const { email, password, firstName, lastName, healthProfile } = req.body;
  const errors = [];

  // Validate email if provided
  if (email && !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate password if provided
  if (password && password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Validate names if provided
  if (firstName && firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (lastName && lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  // Validate health profile if provided
  if (healthProfile) {
    if (healthProfile.age && !Number.isInteger(Number(healthProfile.age))) {
      errors.push('Age must be a valid number');
    }
    if (healthProfile.weight && !Number.isFinite(Number(healthProfile.weight))) {
      errors.push('Weight must be a valid number');
    }
    if (healthProfile.height && !Number.isFinite(Number(healthProfile.height))) {
      errors.push('Height must be a valid number');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

// Health Metric Validation
const healthMetric = (req, res, next) => {
  const { type, value } = req.body;
  const errors = [];

  if (!type) {
    errors.push('Type is required');
  } else if (!['weight', 'bloodPressure', 'height', 'bmi', 'temperature', 'heartRate', 'bloodSugar'].includes(type)) {
    errors.push('Invalid metric type');
  }

  if (!value || typeof value !== 'object') {
    errors.push('Value object is required');
  } else {
    if (value.value === undefined || value.value === '') {
      errors.push('Value is required');
    }
    if (!value.unit || typeof value.unit !== 'string') {
      errors.push('Unit is required and must be a string');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation error', errors });
  }

  next();
};

// Medical Record Validation
const medicalRecord = (req, res, next) => {
  const { title, fileUrl, fileType, recordDate } = req.body;
  const errors = [];

  if (!title || !title.trim()) {
    errors.push('Title is required');
  }

  if (!fileUrl || !fileUrl.trim()) {
    errors.push('File URL is required');
  }

  if (!fileType || !['pdf', 'image', 'document'].includes(fileType)) {
    errors.push('Invalid file type');
  }

  if (recordDate && !validator.isISO8601(recordDate)) {
    errors.push('Invalid record date format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation error', errors });
  }

  next();
};

// Vaccination Record Validation
const vaccinationRecord = (req, res, next) => {
  const { name, dateReceived, nextDoseDate } = req.body;
  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Vaccine name is required');
  }

  if (!dateReceived || !validator.isISO8601(dateReceived)) {
    errors.push('Valid date received is required');
  }

  if (nextDoseDate && !validator.isISO8601(nextDoseDate)) {
    errors.push('Invalid next dose date format');
  }

  if (nextDoseDate && dateReceived && new Date(nextDoseDate) <= new Date(dateReceived)) {
    errors.push('Next dose date must be after date received');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation error', errors });
  }

  next();
};

// Vaccination Status Validation
const vaccinationStatus = (req, res, next) => {
  const { status } = req.body;
  const errors = [];

  if (!status || !['completed', 'scheduled', 'overdue'].includes(status)) {
    errors.push('Invalid vaccination status');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation error', errors });
  }

  next();
};

// Medication Validation
const medication = (req, res, next) => {
  const { name, dosage, frequency, startDate, endDate } = req.body;
  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Medication name is required');
  }

  if (!dosage || !dosage.trim()) {
    errors.push('Dosage is required');
  }

  if (!frequency || !frequency.trim()) {
    errors.push('Frequency is required');
  }

  if (!startDate || !validator.isISO8601(startDate)) {
    errors.push('Valid start date is required');
  }

  if (endDate) {
    if (!validator.isISO8601(endDate)) {
      errors.push('Invalid end date format');
    } else if (new Date(endDate) <= new Date(startDate)) {
      errors.push('End date must be after start date');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation error', errors });
  }

  next();
};

// Medication Reminders Validation
const medicationReminders = (req, res, next) => {
  const { reminderEnabled, reminderTimes } = req.body;
  const errors = [];

  if (typeof reminderEnabled !== 'boolean') {
    errors.push('Reminder enabled must be a boolean');
  }

  if (reminderTimes) {
    if (!Array.isArray(reminderTimes)) {
      errors.push('Reminder times must be an array');
    } else {
      reminderTimes.forEach((reminder, index) => {
        if (!reminder.time || !validator.matches(reminder.time, /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
          errors.push(`Invalid time format for reminder at index ${index}`);
        }
        if (typeof reminder.enabled !== 'boolean') {
          errors.push(`Enabled status must be a boolean for reminder at index ${index}`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation error', errors });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  healthMetric,
  medicalRecord,
  vaccinationRecord,
  vaccinationStatus,
  medication,
  medicationReminders
}; 