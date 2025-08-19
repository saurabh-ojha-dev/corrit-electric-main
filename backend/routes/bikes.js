const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all bikes
router.get('/', auth, async (req, res) => {
  try {
    // Placeholder response - in a real app, you'd fetch from database
    const bikes = [
      { id: 1, name: 'Mountain Bike 1', type: 'Mountain', status: 'Available', price: 25 },
      { id: 2, name: 'Road Bike 1', type: 'Road', status: 'Rented', price: 30 },
      { id: 3, name: 'Hybrid Bike 1', type: 'Hybrid', status: 'Available', price: 20 },
    ];
    
    res.json({ bikes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bike by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // Placeholder response
    const bike = { id, name: 'Sample Bike', type: 'Mountain', status: 'Available', price: 25 };
    
    res.json({ bike });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
