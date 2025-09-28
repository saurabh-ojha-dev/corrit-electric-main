const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @route   GET /api/notifications
// @desc    Get all notifications with filters and pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      priority,
      isRead,
      actionRequired,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by read status
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    // Filter by action required
    if (actionRequired !== undefined) {
      query.actionRequired = actionRequired === 'true';
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.riderName': { $regex: search, $options: 'i' } },
        { 'metadata.riderId': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Manual pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count
    const total = await Notification.countDocuments(query);
    
    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .populate('riderId', 'name riderId')
      .populate('adminId', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      notifications,
      total,
      pagination: {
        page: parseInt(page),
        totalPages,
        totalDocs: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notifications/dashboard
// @desc    Get dashboard notifications (high priority, unread)
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      isRead: false,
      priority: { $in: ['high', 'critical'] }
    })
    .populate('riderId', 'name riderId')
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching dashboard notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead(req.admin._id);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/notifications/:id/unread
// @desc    Mark notification as unread
// @access  Private
router.patch('/:id/unread', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsUnread();

    res.json({
      success: true,
      message: 'Notification marked as unread'
    });
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PATCH /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.patch('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { 
        $set: { isRead: true },
        $push: { 
          readBy: {
            adminId: req.admin._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID'
      });
    }

    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/notifications/types
// @desc    Get notification types for filtering
// @access  Private
router.get('/types', auth, async (req, res) => {
  try {
    const types = await Notification.distinct('type');
    const priorities = await Notification.distinct('priority');
    
    res.json({
      success: true,
      types,
      priorities
    });
  } catch (error) {
    console.error('Error fetching notification types:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/notifications/create-test
// @desc    Create a test notification
// @access  Private
router.post('/create-test', auth, async (req, res) => {
  try {
    const testNotification = new Notification({
      type: 'system_alert',
      title: 'Test Notification',
      description: 'This is a test notification to verify the system is working.',
      priority: 'medium',
      actionRequired: false,
      actionType: 'none',
      metadata: {
        riderName: 'Test Rider',
        riderId: 'TEST-001'
      }
    });

    await testNotification.save();

    res.json({
      success: true,
      message: 'Test notification created successfully',
      notification: testNotification
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
