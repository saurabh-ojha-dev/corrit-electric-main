const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get all notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Notifications route - to be implemented',
      data: []
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
