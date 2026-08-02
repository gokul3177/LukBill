const mongoose = require('mongoose');

const passwordResetLogSchema = new mongoose.Schema({
  email: { type: String, required: true },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PasswordResetLog', passwordResetLogSchema);
