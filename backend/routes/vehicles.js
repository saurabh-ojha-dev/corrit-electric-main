const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Vehicle = require('../models/Vehicle');

// @route   GET /api/vehicles
// @desc    Get all vehicles
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    
    const query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { vehicleName: { $regex: search, $options: 'i' } },
        { vehicleRegistrationNumber: { $regex: search, $options: 'i' } },
        { vehicleChassisNumber: { $regex: search, $options: 'i' } },
        { vehicleMotorNumber: { $regex: search, $options: 'i' } },
        { iotImeiNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter - Fix the logic here
    if (status !== 'all') {
      if (status === 'active' || status === 'assigned') {
        // Show vehicles that have a rider assigned
        query.$or = [
          { riderId: { $exists: true, $ne: null } },
          { assignedRiderId: { $exists: true, $ne: null } }
        ];
      } else if (status === 'pending') {
        // Show vehicles that don't have a rider assigned
        query.$and = [
          { $or: [
            { riderId: { $exists: false } },
            { riderId: null }
          ]},
          { $or: [
            { assignedRiderId: { $exists: false } },
            { assignedRiderId: null }
          ]}
        ];
      }
    }
    
    const skip = (page - 1) * limit;
    
    const vehicles = await Vehicle.find(query)
      .populate('riderId', 'name riderId')
      .populate('assignedRiderId', 'name riderId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Vehicle.countDocuments(query);
    
    res.json({
      success: true,
      message: 'Vehicles fetched successfully',
      data: vehicles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get specific vehicle by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('riderId', 'name riderId')
      .populate('assignedRiderId', 'name riderId');
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle fetched successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/vehicles
// @desc    Create new vehicle
// @access  Private (Admin only)
router.post('/', [
  auth,
  roleCheck(['admin', 'Superadmin']),
  body('vehicleName').trim().notEmpty().withMessage('Vehicle name is required'),
  body('vehicleRegistrationNumber').trim().notEmpty().withMessage('Vehicle registration number is required'),
  body('vehicleChassisNumber').trim().notEmpty().withMessage('Vehicle chassis number is required'),
  body('vehicleMotorNumber').trim().notEmpty().withMessage('Vehicle motor number is required'),
  body('iotImeiNumber').trim().notEmpty().withMessage('IOT IMEI number is required'),
  body('controllerNumber').optional().trim()
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

    const {
      vehicleName,
      vehicleRegistrationNumber,
      vehicleChassisNumber,
      vehicleMotorNumber,
      iotImeiNumber,
      controllerNumber
    } = req.body;

    // Check if vehicle with same details already exists
    const existingVehicle = await Vehicle.findOne({
      $or: [
        { vehicleName: vehicleName.toUpperCase() },
        { vehicleRegistrationNumber: vehicleRegistrationNumber.toUpperCase() },
        { vehicleChassisNumber: vehicleChassisNumber.toUpperCase() },
        { vehicleMotorNumber: vehicleMotorNumber.toUpperCase() },
        { iotImeiNumber: iotImeiNumber.toUpperCase() },
        ...(controllerNumber ? [{ controllerNumber: controllerNumber.toUpperCase() }] : [])
      ]
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with these details already exists'
      });
    }

    // Create new vehicle
    const vehicle = new Vehicle({
      vehicleName: vehicleName.toUpperCase(),
      vehicleRegistrationNumber: vehicleRegistrationNumber.toUpperCase(),
      vehicleChassisNumber: vehicleChassisNumber.toUpperCase(),
      vehicleMotorNumber: vehicleMotorNumber.toUpperCase(),
      iotImeiNumber: iotImeiNumber.toUpperCase(),
      ...(controllerNumber && { controllerNumber: controllerNumber.toUpperCase() })
    });

    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  roleCheck(['admin', 'Superadmin']),
  body('vehicleName').optional().trim().notEmpty().withMessage('Vehicle name cannot be empty'),
  body('vehicleRegistrationNumber').optional().trim().notEmpty().withMessage('Vehicle registration number cannot be empty'),
  body('vehicleChassisNumber').optional().trim().notEmpty().withMessage('Vehicle chassis number cannot be empty'),
  body('vehicleMotorNumber').optional().trim().notEmpty().withMessage('Vehicle motor number cannot be empty'),
  body('iotImeiNumber').optional().trim().notEmpty().withMessage('IOT IMEI number cannot be empty'),
  body('controllerNumber').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('riderId').optional().isMongoId().withMessage('Invalid rider ID')
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

    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check for duplicate values if updating unique fields
    const updateData = { ...req.body };
    const uniqueFields = ['vehicleName', 'vehicleRegistrationNumber', 'vehicleChassisNumber', 'vehicleMotorNumber', 'iotImeiNumber', 'controllerNumber'];
    
    for (const field of uniqueFields) {
      if (updateData[field]) {
        updateData[field] = updateData[field].toUpperCase();
        
        const existingVehicle = await Vehicle.findOne({
          [field]: updateData[field],
          _id: { $ne: req.params.id }
        });
        
        if (existingVehicle) {
          return res.status(400).json({
            success: false,
            message: `${field} already exists`
          });
        }
      }
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('riderId', 'name riderId');

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle
// @access  Private (Admin only)
router.delete('/:id', [
  auth,
  roleCheck(['admin', 'Superadmin'])
], async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Check if vehicle is assigned to a rider
    if (vehicle.riderId || vehicle.assignedRiderId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle that is assigned to a rider'
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/vehicles/:id/assign
// @desc    Assign vehicle to rider
// @access  Private (Admin only)
router.post('/:id/assign', [
  auth,
  roleCheck(['admin', 'Superadmin']),
  body('riderId').isMongoId().withMessage('Valid rider ID is required')
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

    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.riderId) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is already assigned to a rider'
      });
    }

    vehicle.riderId = req.body.riderId;
    vehicle.assignedRiderId = req.body.riderId;
    await vehicle.save();

    const updatedVehicle = await Vehicle.findById(req.params.id)
      .populate('riderId', 'name riderId');

    res.json({
      success: true,
      message: 'Vehicle assigned successfully',
      data: updatedVehicle
    });
  } catch (error) {
    console.error('Error assigning vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/vehicles/:id/unassign
// @desc    Unassign vehicle from rider
// @access  Private (Admin only)
router.post('/:id/unassign', [
  auth,
  roleCheck(['admin', 'Superadmin']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (!vehicle.riderId) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not assigned to any rider'
      });
    }

    // Store unassignment details
    vehicle.unassignedRiderId = vehicle.riderId;
    vehicle.unassignedDate = new Date();
    vehicle.riderId = null;
    vehicle.assignedRiderId = null;
    
    await vehicle.save();

    res.json({
      success: true,
      message: 'Vehicle unassigned successfully'
    });
  } catch (error) {
    console.error('Error unassigning vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
