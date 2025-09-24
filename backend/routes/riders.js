const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { body, validationResult } = require('express-validator');
const Rider = require('../models/Rider');
const Notification = require('../models/Notification');

// Validation middleware - Updated to match frontend fields
const validateRider = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian phone number is required'),
  body('upiId').trim().isLength({ min: 3 }).withMessage('UPI ID is required'),
  body('weeklyRentAmount').isNumeric().isFloat({ min: 1 }).withMessage('Valid rent amount is required'),
  body('aadhaarCard').optional().trim(),
  body('panCard').optional().trim(),
  body('address').trim().isLength({ min: 5 }).withMessage('Address is required'),
  body('bankAccountNumber').optional().trim(),
  body('batterySmartCard').optional().trim(),
  body('documents').optional().isObject().withMessage('Documents must be an object')
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

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name,
      email,
      phone,
      upiId,
      weeklyRentAmount,
      aadhaarCard,
      panCard,
      address,
      bankAccountNumber,
      batterySmartCard,
      documents,
      status
    } = req.body;

    // Check for existing rider
    const existingRider = await Rider.findOne({
      $or: [{ email }, { phone }, { upiId }]
    });

    if (existingRider) {
      return res.status(409).json({
        success: false,
        message: 'Rider with this email, phone, or UPI ID already exists'
      });
    }

    // Generate unique Rider ID
    const cityCode = 'BLR'; // Default city code
    const riderId = await Rider.generateRiderId(cityCode);

    // Prepare documents object - prioritize uploaded URLs over text inputs
    const documentsObj = {
      aadhaar: documents?.aadhaar || aadhaarCard || undefined,
      pan: documents?.pan || panCard || undefined,
      addressProof: documents?.addressProof || undefined,
      bankProof: documents?.bankProof || bankAccountNumber || undefined,
      batteryCard: documents?.batteryCard || batterySmartCard || undefined,
      picture: documents?.picture || undefined
    };

    // Create rider with updated field mapping
    const rider = new Rider({
      riderId,
      name,
      email,
      phone,
      upiId,
      address,
      weeklyRentAmount: parseFloat(weeklyRentAmount),
      assignedAdmin: req.admin._id,
      documents: documentsObj,
    });

    const savedRider = await rider.save();

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
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Rider with this ${field} already exists`
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @route   PATCH /api/riders/:id
// @desc    Update rider verification status
// @access  Private
router.patch('/:id', [auth, roleCheck(['Superadmin', 'admin'])], async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    // Validate verification status
    if (!verificationStatus || !['pending', 'approved', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be pending, approved, or rejected'
      });
    }

    // Find and update rider
    const rider = await Rider.findByIdAndUpdate(
      id,
      { verificationStatus },
      { new: true, runValidators: true }
    );

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    // Create notification for status change
    try {
      const notificationType = verificationStatus === 'approved' ? 'rider_approved' : 'rider_rejected';
      const notificationTitle = verificationStatus === 'approved' 
        ? `Rider Approved – ${rider.riderId}`
        : `Rider Rejected – ${rider.riderId}`;
      const notificationDescription = verificationStatus === 'approved'
        ? 'Rider documents verified and approved. Ready for mandate setup.'
        : 'Rider documents rejected. Requires re-upload and review.';

      await Notification.create({
        type: notificationType,
        title: notificationTitle,
        description: notificationDescription,
        riderId: rider._id,
        priority: verificationStatus === 'approved' ? 'low' : 'high',
        actionRequired: verificationStatus === 'rejected'
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the update if notification fails
    }

    res.json({
      success: true,
      message: `Rider ${verificationStatus} successfully`,
      rider
    });
  } catch (error) {
    console.error('Error updating rider:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
