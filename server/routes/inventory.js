const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/inventory
// @desc    Add new medicine to inventory
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, stock, expiryDate } = req.body;

    const newMedicine = new Medicine({
      clinicId: req.clinicId,
      name,
      category,
      price,
      stock,
      expiryDate
    });

    const medicine = await newMedicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory
// @desc    Get all medicines for the clinic
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const medicines = await Medicine.find({ clinicId: req.clinicId }).sort({ name: 1 });
    res.json(medicines);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update a medicine
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, stock, expiryDate } = req.body;
    
    let medicine = await Medicine.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    medicine.name = name;
    medicine.category = category;
    medicine.price = price;
    medicine.stock = stock;
    medicine.expiryDate = expiryDate;

    await medicine.save();
    res.json(medicine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete a medicine
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, clinicId: req.clinicId });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
