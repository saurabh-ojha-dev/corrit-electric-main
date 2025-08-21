const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post('/login', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, password } = req.body;
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Username:', username);
    console.log('Password length:', password.length);

    // Find admin by username
    const admin = await Admin.findOne({ username });
    console.log('Admin found:', admin ? 'Yes' : 'No');
    if (!admin) {
      console.log('No admin found with username:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Admin details:', {
      id: admin._id,
      username: admin.username,
      role: admin.role,
      isActive: admin.isActive,
      email: admin.email
    });

    // Check if admin is active
    if (!admin.isActive) {
      console.log('Admin account is inactive');
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    console.log('Attempting password comparison...');
    const isPasswordValid = await admin.comparePassword(password);
    console.log('Password comparison result:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Password validation failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    console.log('JWT token generated successfully');

    console.log('=== LOGIN SUCCESSFUL ===');
    res.json({
      message: 'Login successful',
      token,
      admin: admin.toPublicJSON()
    });

  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route (for initial admin setup)
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, password, email, phone } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }, { phone }]
    });

    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'Username, email, or phone number already exists' 
      });
    }

    // Create new admin
    const admin = new Admin({
      username,
      password,
      email,
      phone,
      role: 'Superadmin'  // Changed from 'superadmin' to 'Superadmin'
    });

    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Admin created successfully',
      token,
      admin: admin.toPublicJSON()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current admin profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      admin: req.admin
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current admin profile
router.put('/profile', [
  auth,
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Valid phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, email, phone } = req.body;
    const adminId = req.admin._id;

    // Check for duplicate username/email/phone if being updated
    if (username || email || phone) {
      const orConditions = [];
      if (username) orConditions.push({ username });
      if (email) orConditions.push({ email });
      if (phone) orConditions.push({ phone });
      
      const existingAdmin = await Admin.findOne({
        $and: [
          { _id: { $ne: adminId } },
          { $or: orConditions }
        ]
      });

      if (existingAdmin) {
        return res.status(400).json({
          message: 'Username, email, or phone number already exists'
        });
      }
    }

    // Update fields
    if (username) req.admin.username = username;
    if (email) req.admin.email = email;
    if (phone) req.admin.phone = phone;

    await req.admin.save();

    res.json({
      message: 'Profile updated successfully',
      admin: req.admin.toPublicJSON()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password route
router.put('/change-password', [
  auth,
  body('currentPassword').isLength({ min: 6 }).withMessage('Current password must be at least 6 characters'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Fetch admin with password field for comparison
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      valid: true,
      admin: req.admin
    });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

module.exports = router;
