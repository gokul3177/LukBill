const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/prescriptions
// @desc    Create a new prescription (pending approval)
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { patientId, medicines } = req.body;

    const prescription = new Prescription({
      clinicId: req.clinicId,
      patientId,
      medicines,
      status: 'pending'
    });

    await prescription.save();
    
    // Update patient's visit date if not already recorded today
    const patient = await Patient.findById(patientId);
    if (patient) {
      const today = new Date();
      const lastVisit = patient.visits.length > 0 ? patient.visits[patient.visits.length - 1] : null;
      if (!lastVisit || lastVisit.toDateString() !== today.toDateString()) {
        patient.visits.push(today);
        await patient.save();
      }
    }

    res.status(201).json(prescription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/patient/:patientId
// @desc    Get all prescriptions for a patient
// @access  Private
router.get('/patient/:patientId', authMiddleware, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      patientId: req.params.patientId, 
      clinicId: req.clinicId 
    }).sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
