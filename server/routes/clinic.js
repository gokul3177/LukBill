const express = require('express');
const router = express.Router();
const Clinic = require('../models/Clinic');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/clinic/setup
// @desc    Setup clinic details for the first time
// @access  Private
router.post('/setup', authMiddleware, async (req, res) => {
  try {
    const { clinicName, doctorName, address, phone, registrationNumber, consultationFee, upiId, lowStockThreshold } = req.body;

    // Check if user already has a clinic
    if (req.user.clinicId) {
      return res.status(400).json({ message: 'Clinic already setup for this user' });
    }

    const clinic = new Clinic({
      userId: req.user._id,
      clinicName,
      doctorName,
      address,
      phone,
      registrationNumber,
      consultationFee,
      upiId,
      lowStockThreshold
    });

    await clinic.save();

    // Update user with clinicId
    await User.findByIdAndUpdate(req.user._id, { clinicId: clinic._id });

    res.status(201).json(clinic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clinic/me
// @desc    Get current user's clinic config
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (!req.clinicId) {
      return res.status(404).json({ message: 'Clinic not setup yet' });
    }

    const clinic = await Clinic.findById(req.clinicId);
    if (!clinic) {
      return res.status(404).json({ message: 'Clinic not found' });
    }

    res.json(clinic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
