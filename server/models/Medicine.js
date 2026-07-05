const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  name: { type: String, required: true },
  category: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medicine', medicineSchema);
