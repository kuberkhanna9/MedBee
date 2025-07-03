const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth'); // We'll create this next
const {
  getHealthMetricsSummary,
  getMedicationAdherence,
  getVaccinationStatus,
  getAppUsage
} = require('../controllers/analyticsController');

// All analytics routes are protected and require admin access
router.use(protect);
router.use(isAdmin);

router.get('/health-metrics', getHealthMetricsSummary);
router.get('/medication-adherence', getMedicationAdherence);
router.get('/vaccination-status', getVaccinationStatus);
router.get('/app-usage', getAppUsage);

module.exports = router; 