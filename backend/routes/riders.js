const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { body, validationResult } = require('express-validator');
const Rider = require('../models/Rider');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// Validation middleware
const validateRider = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian phone number is required'),
  body('upiId').trim().isLength({ min: 3 }).withMessage('UPI ID is required'),
  body('weeklyRentAmount').isNumeric().isFloat({ min: 1 }).withMessage('Valid rent amount is required')
];

// @route   GET /api/riders
// @desc    Get all riders with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      verificationStatus,
      mandateStatus,
      assignedAdmin
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { riderId: { $regex: search, $options: 'i' } },
        { upiId: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filters
    if (status) query.isActive = status === 'active';
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (mandateStatus) query.mandateStatus = mandateStatus;
    if (assignedAdmin) query.assignedAdmin = assignedAdmin;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'assignedAdmin', select: 'name email' }
      ],
      sort: { createdAt: -1 }
    };

    const riders = await Rider.paginate(query, options);

    res.json({
      success: true,
      riders: riders.docs,
      total: riders.totalDocs,
      pagination: {
        page: riders.page,
        totalPages: riders.totalPages,
        totalDocs: riders.totalDocs,
        hasNextPage: riders.hasNextPage,
        hasPrevPage: riders.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/riders
// @desc    Create new rider
// @access  Private
router.post('/', [auth, roleCheck(['Superadmin', 'admin']), validateRider], async (req, res) => {
  try {
    // Add debugging logs
    console.log('POST /api/riders - Request received');
    console.log('Admin user:', req.admin);
    console.log('Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name,
      email,
      phone,
      upiId,
      address,
      gender,
      weeklyRentAmount,
      assignedRegion = 'Bangalore Zone'
    } = req.body;

    // Check for existing rider
    const existingRider = await Rider.findOne({
      $or: [{ email }, { phone }, { upiId }]
    });

    if (existingRider) {
      return res.status(400).json({
        success: false,
        message: 'Rider with this email, phone, or UPI ID already exists'
      });
    }

    // Generate unique Rider ID
    const cityCode = 'BLR'; // Default city code
    const riderId = await Rider.generateRiderId(cityCode);
    console.log('Generated Rider ID:', riderId);

    // Create rider
    const rider = new Rider({
      riderId,
      name,
      email,
      phone,
      upiId,
      address,
      gender,
      weeklyRentAmount,
      assignedAdmin: req.admin._id,
      documents: {
        aadhaar: '',
        pan: '',
        addressProof: '',
        bankProof: '',
        picture: ''
      }
    });

    console.log('Saving rider to database...');
    const savedRider = await rider.save();
    console.log('Rider saved successfully:', savedRider._id);

    // Create notification for new rider registration
    try {
      await Notification.create({
        type: 'new_rider_registered',
        title: `New Rider Registered – ${riderId}`,
        description: 'Rider onboarding complete. All documents verified.',
        riderId: savedRider._id,
        priority: 'medium',
        actionRequired: false
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the rider creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Rider created successfully',
      rider: savedRider
    });
  } catch (error) {
    console.error('Error creating rider:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;
