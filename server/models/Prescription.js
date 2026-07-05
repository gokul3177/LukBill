const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  date: { type: Date, default: Date.now },
  medicines: [{
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }, // can be null if custom/unmatched
    name: { type: String, required: true },
    dosage: { type: String },
    timing: { type: String },
    duration: { type: String },
    quantity: { type: Number, required: true },
    instructions: { type: String }
  }],
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
