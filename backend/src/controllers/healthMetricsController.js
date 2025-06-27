const HealthMetric = require('../models/HealthMetric');

const healthMetricsController = {
  // Get all health metrics for a user
  getMetrics: async (req, res) => {
    try {
      const metrics = await HealthMetric.find({ user: req.user.id })
        .sort({ timestamp: -1 });
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching health metrics', error: error.message });
    }
  },

  // Get metrics by type
  getMetricsByType: async (req, res) => {
    try {
      const { type } = req.params;
      const metrics = await HealthMetric.find({
        user: req.user.id,
        type
      }).sort({ timestamp: -1 });
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching health metrics', error: error.message });
    }
  },

  // Add new health metric
  addMetric: async (req, res) => {
    try {
      const { type, value, notes } = req.body;
      
      const newMetric = new HealthMetric({
        user: req.user.id,
        type,
        value,
        notes,
        timestamp: Date.now()
      });

      await newMetric.save();
      res.status(201).json(newMetric);
    } catch (error) {
      res.status(400).json({ message: 'Error adding health metric', error: error.message });
    }
  },

  // Update health metric
  updateMetric: async (req, res) => {
    try {
      const { id } = req.params;
      const { value, notes } = req.body;

      const metric = await HealthMetric.findOne({
        _id: id,
        user: req.user.id
      });

      if (!metric) {
        return res.status(404).json({ message: 'Health metric not found' });
      }

      metric.value = value || metric.value;
      metric.notes = notes || metric.notes;

      await metric.save();
      res.json(metric);
    } catch (error) {
      res.status(400).json({ message: 'Error updating health metric', error: error.message });
    }
  },

  // Delete health metric
  deleteMetric: async (req, res) => {
    try {
      const { id } = req.params;
      const metric = await HealthMetric.findOneAndDelete({
        _id: id,
        user: req.user.id
      });

      if (!metric) {
        return res.status(404).json({ message: 'Health metric not found' });
      }

      res.json({ message: 'Health metric deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting health metric', error: error.message });
    }
  },

  // Get latest metrics for dashboard
  getLatestMetrics: async (req, res) => {
    try {
      const latestMetrics = {};
      const metricTypes = ['weight', 'bloodPressure', 'height', 'bmi', 'temperature', 'heartRate', 'bloodSugar'];

      await Promise.all(metricTypes.map(async (type) => {
        const metric = await HealthMetric.findOne({
          user: req.user.id,
          type
        }).sort({ timestamp: -1 });
        
        if (metric) {
          latestMetrics[type] = metric;
        }
      }));

      res.json(latestMetrics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching latest metrics', error: error.message });
    }
  }
};

module.exports = healthMetricsController; 