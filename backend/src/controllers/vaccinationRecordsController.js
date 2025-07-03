const VaccinationRecord = require('../models/VaccinationRecord');

const vaccinationRecordsController = {
  // Get all vaccination records for a user
  getRecords: async (req, res) => {
    try {
      const records = await VaccinationRecord.find({ user: req.user.id })
        .sort({ dateReceived: -1 });
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching vaccination records', error: error.message });
    }
  },

  // Get vaccination record by ID
  getRecordById: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await VaccinationRecord.findOne({
        _id: id,
        user: req.user.id
      });

      if (!record) {
        return res.status(404).json({ message: 'Vaccination record not found' });
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching vaccination record', error: error.message });
    }
  },

  // Add new vaccination record
  addRecord: async (req, res) => {
    try {
      const {
        name,
        dateReceived,
        nextDoseDate,
        provider,
        notes,
        status = 'completed'
      } = req.body;

      const newRecord = new VaccinationRecord({
        user: req.user.id,
        name,
        dateReceived,
        nextDoseDate,
        provider,
        notes,
        status
      });

      await newRecord.save();
      res.status(201).json(newRecord);
    } catch (error) {
      res.status(400).json({ message: 'Error adding vaccination record', error: error.message });
    }
  },

  // Update vaccination record
  updateRecord: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const record = await VaccinationRecord.findOne({
        _id: id,
        user: req.user.id
      });

      if (!record) {
        return res.status(404).json({ message: 'Vaccination record not found' });
      }

      // Update only allowed fields
      const allowedUpdates = [
        'name',
        'dateReceived',
        'nextDoseDate',
        'provider',
        'notes',
        'status'
      ];

      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          record[field] = updateData[field];
        }
      });

      await record.save();
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: 'Error updating vaccination record', error: error.message });
    }
  },

  // Delete vaccination record
  deleteRecord: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await VaccinationRecord.findOneAndDelete({
        _id: id,
        user: req.user.id
      });

      if (!record) {
        return res.status(404).json({ message: 'Vaccination record not found' });
      }

      res.json({ message: 'Vaccination record deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting vaccination record', error: error.message });
    }
  },

  // Get upcoming vaccinations
  getUpcomingVaccinations: async (req, res) => {
    try {
      const records = await VaccinationRecord.find({
        user: req.user.id,
        nextDoseDate: { $gt: new Date() },
        status: 'scheduled'
      }).sort({ nextDoseDate: 1 });
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching upcoming vaccinations', error: error.message });
    }
  },

  // Update vaccination status
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const record = await VaccinationRecord.findOne({
        _id: id,
        user: req.user.id
      });

      if (!record) {
        return res.status(404).json({ message: 'Vaccination record not found' });
      }

      record.status = status;
      await record.save();
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: 'Error updating vaccination status', error: error.message });
    }
  }
};

module.exports = vaccinationRecordsController; 