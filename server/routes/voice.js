const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { parsePrescription } = require('../utils/groqParser');
const { fuzzyMatchMedicine } = require('../utils/fuzzyMatch');
const Medicine = require('../models/Medicine');

// @route   POST /api/voice/parse
// @desc    Parse voice transcript and fuzzy match medicines
// @access  Private
router.post('/parse', authMiddleware, async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    // 1. Call Groq API
    const parsedData = await parsePrescription(transcript);

    // 2. Fetch Clinic Inventory
    const inventory = await Medicine.find({ clinicId: req.clinicId });

    // 3. Fuzzy Match Medicines
    const matchedMedicines = parsedData.medicines.map(med => {
      const matchResult = fuzzyMatchMedicine(med.name, inventory);
      
      if (matchResult.match) {
        return {
          ...med,
          medicineId: matchResult.match._id,
          name: matchResult.match.name, // Auto-correct to inventory name
          originalName: med.name,
          matchScore: matchResult.score,
          inStock: matchResult.match.stock > 0,
          currentStock: matchResult.match.stock,
          price: matchResult.match.price
        };
      } else {
        return {
          ...med,
          medicineId: null,
          matchScore: matchResult.score,
          inStock: false,
          currentStock: 0,
          price: 0
        };
      }
    });

    res.json({
      patientName: parsedData.patientName,
      medicines: matchedMedicines
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to parse voice transcript' });
  }
});

module.exports = router;
