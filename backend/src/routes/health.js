const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const healthMetricsController = require('../controllers/healthMetricsController');
const medicalRecordsController = require('../controllers/medicalRecordsController');
const vaccinationRecordsController = require('../controllers/vaccinationRecordsController');
const medicationsController = require('../controllers/medicationsController');

// Health Metrics Routes
router.get('/metrics', protect, healthMetricsController.getMetrics);
router.get('/metrics/latest', protect, healthMetricsController.getLatestMetrics);
router.get('/metrics/:type', protect, healthMetricsController.getMetricsByType);
router.post('/metrics', protect, validate.healthMetric, healthMetricsController.addMetric);
router.put('/metrics/:id', protect, validate.healthMetric, healthMetricsController.updateMetric);
router.delete('/metrics/:id', protect, healthMetricsController.deleteMetric);

// Medical Records Routes
router.get('/records', protect, medicalRecordsController.getRecords);
router.get('/records/search', protect, medicalRecordsController.searchRecords);
router.get('/records/category/:category', protect, medicalRecordsController.getRecordsByCategory);
router.get('/records/:id', protect, medicalRecordsController.getRecordById);
router.post('/records', protect, validate.medicalRecord, medicalRecordsController.addRecord);
router.put('/records/:id', protect, validate.medicalRecord, medicalRecordsController.updateRecord);
router.patch('/records/:id/archive', protect, medicalRecordsController.archiveRecord);

// Vaccination Records Routes
router.get('/vaccinations', protect, vaccinationRecordsController.getRecords);
router.get('/vaccinations/upcoming', protect, vaccinationRecordsController.getUpcomingVaccinations);
router.get('/vaccinations/:id', protect, vaccinationRecordsController.getRecordById);
router.post('/vaccinations', protect, validate.vaccinationRecord, vaccinationRecordsController.addRecord);
router.put('/vaccinations/:id', protect, validate.vaccinationRecord, vaccinationRecordsController.updateRecord);
router.delete('/vaccinations/:id', protect, vaccinationRecordsController.deleteRecord);
router.patch('/vaccinations/:id/status', protect, validate.vaccinationStatus, vaccinationRecordsController.updateStatus);

// Medications Routes
router.get('/medications', protect, medicationsController.getMedications);
router.get('/medications/active', protect, medicationsController.getActiveMedications);
router.get('/medications/category/:category', protect, medicationsController.getMedicationsByCategory);
router.get('/medications/:id', protect, medicationsController.getMedicationById);
router.post('/medications', protect, validate.medication, medicationsController.addMedication);
router.put('/medications/:id', protect, validate.medication, medicationsController.updateMedication);
router.patch('/medications/:id/discontinue', protect, medicationsController.discontinueMedication);
router.patch('/medications/:id/reminders', protect, validate.medicationReminders, medicationsController.updateReminderSettings);

module.exports = router; 