const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all rentals
router.get('/', auth, async (req, res) => {
  try {
    // Placeholder response - in a real app, you'd fetch from database
    const rentals = [
      { 
        id: 1, 
        bikeId: 2, 
        customerName: 'John Doe', 
        startDate: '2024-01-15', 
        endDate: '2024-01-17',
        status: 'Active',
        totalPrice: 90
      },
      { 
        id: 2, 
        bikeId: 1, 
        customerName: 'Jane Smith', 
        startDate: '2024-01-14', 
        endDate: '2024-01-16',
        status: 'Completed',
        totalPrice: 50
      },
    ];
    
    res.json({ rentals });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rental by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // Placeholder response
    const rental = { 
      id, 
      bikeId: 1, 
      customerName: 'John Doe', 
      startDate: '2024-01-15', 
      endDate: '2024-01-17',
      status: 'Active',
      totalPrice: 90
    };
    
    res.json({ rental });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
