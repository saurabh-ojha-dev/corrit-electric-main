const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Auth middleware - Decoded token:', decoded);
    
    const admin = await Admin.findById(decoded.adminId).select('-password');
    console.log('Auth middleware - Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid token or inactive account.' });
    }

    req.admin = admin;
    console.log('Auth middleware - Admin set in request:', req.admin._id);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    
    next();
  };
};

module.exports = { auth, requireRole };
