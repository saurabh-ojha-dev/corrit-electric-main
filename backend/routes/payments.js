const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Payments route - to be implemented',
      data: []
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
