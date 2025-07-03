const HealthMetric = require('../models/HealthMetric');
const Medication = require('../models/Medication');
const VaccinationRecord = require('../models/VaccinationRecord');
const logger = require('../utils/logger');

// Helper function to calculate date range
const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
};

// @desc    Get health metrics summary
// @route   GET /api/v1/analytics/health-metrics
// @access  Private (Admin)
const getHealthMetricsSummary = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(30); // Last 30 days

    const metrics = await HealthMetric.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          average: { $avg: '$value' },
          min: { $min: '$value' },
          max: { $max: '$value' }
        }
      }
    ]);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error in health metrics analytics:', error);
    next(error);
  }
};

// @desc    Get medication adherence stats
// @route   GET /api/v1/analytics/medication-adherence
// @access  Private (Admin)
const getMedicationAdherence = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(7); // Last week

    const adherenceStats = await Medication.aggregate([
      {
        $match: {
          updatedAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            taken: '$taken',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          taken: {
            $sum: {
              $cond: [{ $eq: ['$_id.taken', true] }, '$count', 0]
            }
          },
          missed: {
            $sum: {
              $cond: [{ $eq: ['$_id.taken', false] }, '$count', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: adherenceStats
    });
  } catch (error) {
    logger.error('Error in medication adherence analytics:', error);
    next(error);
  }
};

// @desc    Get vaccination status summary
// @route   GET /api/v1/analytics/vaccination-status
// @access  Private (Admin)
const getVaccinationStatus = async (req, res, next) => {
  try {
    const today = new Date();

    const vaccineStats = await VaccinationRecord.aggregate([
      {
        $facet: {
          'completed': [
            { $match: { dateReceived: { $exists: true, $ne: null } } },
            { $group: { _id: '$name', count: { $sum: 1 } } }
          ],
          'upcoming': [
            { $match: { nextDoseDate: { $gt: today } } },
            { $group: { _id: '$name', count: { $sum: 1 } } }
          ],
          'overdue': [
            { $match: { nextDoseDate: { $lt: today } } },
            { $group: { _id: '$name', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: vaccineStats[0]
    });
  } catch (error) {
    logger.error('Error in vaccination status analytics:', error);
    next(error);
  }
};

// @desc    Get app usage statistics
// @route   GET /api/v1/analytics/app-usage
// @access  Private (Admin)
const getAppUsage = async (req, res, next) => {
  try {
    const { start, end } = getDateRange(30); // Last 30 days

    // This is a placeholder. In production, you would:
    // 1. Implement proper request logging
    // 2. Use a monitoring service like New Relic or Datadog
    // 3. Track actual API hits and user sessions
    
    res.json({
      success: true,
      data: {
        activeUsers: {
          daily: 100,
          weekly: 500,
          monthly: 1000
        },
        apiHits: {
          total: 10000,
          avgPerDay: 333,
          peakHour: '14:00'
        },
        errorRate: '0.5%'
      }
    });
  } catch (error) {
    logger.error('Error in app usage analytics:', error);
    next(error);
  }
};

module.exports = {
  getHealthMetricsSummary,
  getMedicationAdherence,
  getVaccinationStatus,
  getAppUsage
}; 