const MedicalRecord = require('../models/MedicalRecord');

const medicalRecordsController = {
  // Get all medical records for a user
  getRecords: async (req, res) => {
    try {
      const records = await MedicalRecord.find({ 
        user: req.user.id,
        isArchived: false 
      }).sort({ recordDate: -1 });
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medical records', error: error.message });
    }
  },

  // Get medical record by ID
  getRecordById: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await MedicalRecord.findOne({
        _id: id,
        user: req.user.id
      });

      if (!record) {
        return res.status(404).json({ message: 'Medical record not found' });
      }

      res.json(record);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medical record', error: error.message });
    }
  },

  // Add new medical record
  addRecord: async (req, res) => {
    try {
      const {
        title,
        description,
        fileUrl,
        fileType,
        category,
        recordDate,
        provider,
        tags
      } = req.body;

      const newRecord = new MedicalRecord({
        user: req.user.id,
        title,
        description,
        fileUrl,
        fileType,
        category,
        recordDate: recordDate || Date.now(),
        provider,
        tags
      });

      await newRecord.save();
      res.status(201).json(newRecord);
    } catch (error) {
      res.status(400).json({ message: 'Error adding medical record', error: error.message });
    }
  },

  // Update medical record
  updateRecord: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const record = await MedicalRecord.findOne({
        _id: id,
        user: req.user.id
      });

      if (!record) {
        return res.status(404).json({ message: 'Medical record not found' });
      }

      // Update only allowed fields
      const allowedUpdates = [
        'title',
        'description',
        'category',
        'recordDate',
        'provider',
        'tags'
      ];

      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          record[field] = updateData[field];
        }
      });

      await record.save();
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: 'Error updating medical record', error: error.message });
    }
  },

  // Archive medical record
  archiveRecord: async (req, res) => {
    try {
      const { id } = req.params;
      const record = await MedicalRecord.findOne({
        _id: id,
        user: req.user.id
      });

      if (!record) {
        return res.status(404).json({ message: 'Medical record not found' });
      }

      record.isArchived = true;
      await record.save();
      res.json({ message: 'Medical record archived successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error archiving medical record', error: error.message });
    }
  },

  // Get records by category
  getRecordsByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      const records = await MedicalRecord.find({
        user: req.user.id,
        category,
        isArchived: false
      }).sort({ recordDate: -1 });
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medical records', error: error.message });
    }
  },

  // Search records
  searchRecords: async (req, res) => {
    try {
      const { query } = req.query;
      const records = await MedicalRecord.find({
        user: req.user.id,
        isArchived: false,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { provider: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }).sort({ recordDate: -1 });
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: 'Error searching medical records', error: error.message });
    }
  }
};

module.exports = medicalRecordsController; 