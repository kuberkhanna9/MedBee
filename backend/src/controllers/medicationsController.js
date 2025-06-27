const Medication = require('../models/Medication');

const medicationsController = {
  // Get all medications for a user
  getMedications: async (req, res) => {
    try {
      const medications = await Medication.find({ user: req.user.id })
        .sort({ startDate: -1 });
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medications', error: error.message });
    }
  },

  // Get active medications
  getActiveMedications: async (req, res) => {
    try {
      const medications = await Medication.find({
        user: req.user.id,
        isDiscontinued: false,
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gt: new Date() } }
        ]
      }).sort({ startDate: -1 });
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching active medications', error: error.message });
    }
  },

  // Get medication by ID
  getMedicationById: async (req, res) => {
    try {
      const { id } = req.params;
      const medication = await Medication.findOne({
        _id: id,
        user: req.user.id
      });

      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }

      res.json(medication);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medication', error: error.message });
    }
  },

  // Add new medication
  addMedication: async (req, res) => {
    try {
      // Log incoming request body for debugging
      console.log('Adding medication - Request body:', req.body);

      const {
        name,          // Medication Name
        dosage,        // Dosage
        frequency,     // Frequency
        startDate,     // Start Date
        endDate,       // End Date (Optional)
        notes         // Notes
      } = req.body;

      // Validate required fields
      if (!name || !dosage || !frequency || !startDate) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['name', 'dosage', 'frequency', 'startDate']
        });
      }

      const newMedication = new Medication({
        user: req.user.id,
        name,
        dosage,
        frequency,
        startDate,
        endDate,     // Optional
        notes,       // Optional
        status: 'active',
        isDiscontinued: false  // Explicitly set to false
      });

      await newMedication.save();
      res.status(201).json(newMedication);
    } catch (error) {
      console.error('Error adding medication:', error);
      res.status(400).json({ 
        message: 'Error adding medication', 
        error: error.message
      });
    }
  },

  // Update medication
  updateMedication: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const medication = await Medication.findOne({
        _id: id,
        user: req.user.id
      });

      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }

      // Update only allowed fields
      const allowedUpdates = [
        'name',
        'dosage',
        'frequency',
        'startDate',
        'endDate',
        'notes'
      ];

      allowedUpdates.forEach(field => {
        if (updateData[field] !== undefined) {
          medication[field] = updateData[field];
        }
      });

      await medication.save();
      res.json(medication);
    } catch (error) {
      res.status(400).json({ message: 'Error updating medication', error: error.message });
    }
  },

  // Discontinue medication
  discontinueMedication: async (req, res) => {
    try {
      const { id } = req.params;
      const medication = await Medication.findOne({
        _id: id,
        user: req.user.id
      });

      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }

      medication.isDiscontinued = true;
      medication.discontinuedDate = Date.now();
      await medication.save();
      res.json({ message: 'Medication discontinued successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error discontinuing medication', error: error.message });
    }
  },

  // Get medications by category
  getMedicationsByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      const medications = await Medication.find({
        user: req.user.id,
        category,
        isDiscontinued: false
      }).sort({ startDate: -1 });
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching medications', error: error.message });
    }
  },

  // Update reminder settings
  updateReminderSettings: async (req, res) => {
    try {
      const { id } = req.params;
      const { reminders } = req.body;

      const medication = await Medication.findOne({
        _id: id,
        user: req.user.id
      });

      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }

      medication.reminders = reminders;
      await medication.save();
      res.json(medication);
    } catch (error) {
      res.status(400).json({ message: 'Error updating reminder settings', error: error.message });
    }
  }
};

module.exports = medicationsController; 