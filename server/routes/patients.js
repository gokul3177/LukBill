const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/patients
// @desc    Register a new patient
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, age, gender, address, phone, occupation } = req.body;

    const newPatient = new Patient({
      clinicId: req.clinicId,
      name,
      age,
      gender,
      address,
      phone,
      occupation,
      visits: [new Date()]
    });

    const patient = await newPatient.save();
    res.status(201).json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients
// @desc    Get all patients for the clinic (with optional search query)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    let query = { clinicId: req.clinicId };

    if (q) {
      const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedQuery, 'i');
      query.$or = [{ name: searchRegex }, { phone: searchRegex }];
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const patient = await Patient.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
