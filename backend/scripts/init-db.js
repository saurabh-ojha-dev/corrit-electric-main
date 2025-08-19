const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bike-rental-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create default admin user
    const admin = new Admin({
      username: 'admin',
      password: 'admin123',
      email: 'admin@bikerental.com',
      role: 'admin'
    });

    await admin.save();
    
    console.log('Default admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change these credentials after first login.');
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
