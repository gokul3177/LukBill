const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clinicName: { type: String, required: true },
  doctorName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  upiId: { type: String, required: true },
  lowStockThreshold: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Clinic', clinicSchema);
