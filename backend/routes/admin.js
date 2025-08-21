const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Admin = require('../models/Admin');

// @route   GET /api/admin
// @desc    Get all admins
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Admins fetched successfully',
      data: admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/:id
// @desc    Get specific admin by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin fetched successfully',
      data: admin
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin
// @desc    Create new admin
// @access  Private (Super Admin only)
router.post('/', [
  auth,
  roleCheck(['Superadmin']),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('role').isIn(['admin', 'Superadmin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, password, email, phone, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }, { phone }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, or phone number already exists'
      });
    }

    // Create new admin
    const admin = new Admin({
      username,
      password,
      email,
      phone,
      role
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin.toPublicJSON()
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/:id
// @desc    Update admin
// @access  Private (Super Admin only)
router.put('/:id', [
  auth,
  roleCheck(['Superadmin']),
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['admin', 'Superadmin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, role, isActive } = req.body;
    const adminId = req.params.id;

    // Check if admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check for duplicate username/email if being updated
    if (username || email) {
      const orConditions = [];
      if (username) orConditions.push({ username });
      if (email) orConditions.push({ email });
      
      const existingAdmin = await Admin.findOne({
        $and: [
          { _id: { $ne: adminId } },
          { $or: orConditions }
        ]
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
      }
    }

    // Update fields
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (role) admin.role = role;
    if (typeof isActive === 'boolean') admin.isActive = isActive;

    await admin.save();

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: admin.toPublicJSON()
    });

  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/:id
// @desc    Delete admin
// @access  Private (Super Admin only)
router.delete('/:id', [auth, roleCheck(['Superadmin'])], async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent deleting self
    if (admin._id.toString() === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await Admin.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;