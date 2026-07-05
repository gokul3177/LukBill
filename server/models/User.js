const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }, // Can be null initially until setup
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
