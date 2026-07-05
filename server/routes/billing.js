const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');
const Clinic = require('../models/Clinic');
const authMiddleware = require('../middleware/authMiddleware');
const { generateUPIQRCode } = require('../utils/qrGenerator');

// @route   POST /api/billing/generate
// @desc    Approve prescription, calculate total, generate bill & QR
// @access  Private
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { prescriptionId } = req.body;

    const prescription = await Prescription.findOne({ _id: prescriptionId, clinicId: req.clinicId });
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

    if (prescription.status === 'approved') {
      return res.status(400).json({ message: 'Prescription already approved and billed' });
    }

    const clinic = await Clinic.findById(req.clinicId);
    if (!clinic) return res.status(404).json({ message: 'Clinic config not found' });

    let grandTotal = 0;
    const billItems = [];

    // Calculate items total safely server-side
    for (const med of prescription.medicines) {
      if (!med.medicineId) {
        return res.status(400).json({ message: `Medicine ${med.name} is not linked to inventory.` });
      }

      const inventoryItem = await Medicine.findById(med.medicineId);
      if (!inventoryItem) {
        return res.status(400).json({ message: `Inventory item for ${med.name} not found.` });
      }

      if (inventoryItem.stock < med.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${inventoryItem.name}` });
      }

      const itemTotal = med.quantity * inventoryItem.price;
      grandTotal += itemTotal;

      billItems.push({
        name: inventoryItem.name,
        qty: med.quantity,
        unitPrice: inventoryItem.price,
        total: itemTotal
      });

      // Deduct stock
      inventoryItem.stock -= med.quantity;
      await inventoryItem.save();
    }

    // Add consultation fee
    grandTotal += clinic.consultationFee;

    // Generate UPI QR Code
    const qrCodeUrl = await generateUPIQRCode(clinic.upiId, clinic.clinicName, grandTotal);

    const newBill = new Bill({
      clinicId: req.clinicId,
      prescriptionId: prescription._id,
      patientId: prescription.patientId,
      items: billItems,
      consultationFee: clinic.consultationFee,
      grandTotal,
      qrCodeUrl,
      paid: false
    });

    await newBill.save();

    // Mark prescription as approved
    prescription.status = 'approved';
    prescription.approvedBy = req.user._id;
    await prescription.save();

    res.status(201).json(newBill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/patient/:patientId
// @desc    Get all bills for a patient
// @access  Private
router.get('/patient/:patientId', authMiddleware, async (req, res) => {
  try {
    const bills = await Bill.find({ patientId: req.params.patientId, clinicId: req.clinicId }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/:id
// @desc    Get bill by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, clinicId: req.clinicId });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
