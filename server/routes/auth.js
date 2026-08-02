const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const PasswordResetLog = require('../models/PasswordResetLog');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/auth/register
// @desc    Register a new clinic owner (user)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailLower = email.toLowerCase();
    let user = await User.findOne({ email: emailLower });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email: emailLower,
      passwordHash
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, clinicId: user.clinicId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, clinicId: user.clinicId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate OTP and send to email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.toLowerCase();
    
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      // Return 200 even if not found to prevent email enumeration attacks
      return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP for DB
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Delete existing OTPs for this email
    await Otp.deleteMany({ email: emailLower });

    // Save new OTP
    const newOtp = new Otp({
      email: emailLower,
      otpHash
    });
    await newOtp.save();

    // Send email
    const htmlMessage = `
      <h1>Password Reset Request</h1>
      <p>Hello ${user.name},</p>
      <p>Your OTP for resetting your password is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'LukBill - Password Reset OTP',
        html: htmlMessage
      });
      res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
    } catch (err) {
      console.error('Email could not be sent', err);
      // Clean up OTP if email fails
      await Otp.deleteMany({ email: emailLower });
      return res.status(500).json({ message: 'Error sending email' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify the OTP
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const emailLower = email.toLowerCase();

    const otpRecord = await Otp.findOne({ email: emailLower });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (otpRecord.attempts >= 3) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Generate a temporary reset token (valid for 15 mins) to use in the actual reset endpoint
    const resetToken = jwt.sign({ email: emailLower, purpose: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // We keep the OTP record or delete it? Better to delete it to prevent reuse, and rely on resetToken.
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ resetToken, message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using reset token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // Password strength check (min 8, uppercase, number, special)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new OTP.' });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ message: 'Invalid token purpose' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    user.passwordChangedAt = new Date();
    await user.save();

    // Log the reset
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const log = new PasswordResetLog({ email: user.email, ipAddress: ip });
    await log.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
