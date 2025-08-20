const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// @route   GET /api/admin
// @desc    Get all admins
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Admin route - to be implemented',
      data: []
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
