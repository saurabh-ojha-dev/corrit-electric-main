const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const PhonePeAutopay = require('../models/PhonePeAutopay');

// @route   GET /api/payments
// @desc    Get all autopay transactions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, riderId, status } = req.query;
    
    const query = {};
    if (riderId) query.riderId = riderId;
    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'riderId', select: 'name email phone riderId' }
      ],
      sort: { createdAt: -1 }
    };

    const autopays = await PhonePeAutopay.paginate(query, options);

    res.json({
      success: true,
      autopays: autopays.docs,
      total: autopays.totalDocs,
      pagination: {
        page: autopays.page,
        totalPages: autopays.totalPages,
        totalDocs: autopays.totalDocs,
        hasNextPage: autopays.hasNextPage,
        hasPrevPage: autopays.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching autopay transactions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/payments/stats
// @desc    Get autopay statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const { riderId } = req.query;
    const stats = await PhonePeAutopay.getAutopayStats(riderId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching autopay stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
