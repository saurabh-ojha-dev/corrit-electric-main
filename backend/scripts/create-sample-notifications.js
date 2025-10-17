const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Rider = require('../models/Rider');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/corrit_electric', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleNotifications() {
  try {

    // Get a sample rider
    const sampleRider = await Rider.findOne();
    if (!sampleRider) {
      return;
    }

    // Clear existing notifications
    await Notification.deleteMany({});

    // Create sample notifications
    const sampleNotifications = [
      {
        type: 'payment_failed',
        title: `Payment Failed – ${sampleRider.riderId}`,
        description: `UPI mandate for ₹1,200 could not be processed. Rider must re-approve in PhonePe app.`,
        riderId: sampleRider._id,
        priority: 'high',
        actionRequired: true,
        actionType: 'resend_payment',
        actionLink: `/payments/123`,
        metadata: {
          amount: 1200,
          riderName: sampleRider.name,
          riderId: sampleRider.riderId,
          errorCode: 'INSUFFICIENT_BALANCE',
          retryCount: 1
        }
      },
      {
        type: 'gps_signal_lost',
        title: `GPS Signal Lost – ${sampleRider.riderId}`,
        description: `Rider's location not updated for 30 mins. Possible device issue.`,
        riderId: sampleRider._id,
        priority: 'medium',
        actionRequired: true,
        actionType: 'view_on_map',
        actionLink: `/tracking/${sampleRider._id}`,
        metadata: {
          riderName: sampleRider.name,
          riderId: sampleRider.riderId,
          location: {
            latitude: 12.9716,
            longitude: 77.5946,
            address: 'Bangalore, Karnataka'
          },
          timestamp: new Date(),
          deviceInfo: 'Android 12'
        }
      },
      {
        type: 'mandate_expiring',
        title: `Mandate Expiring – ${sampleRider.riderId}`,
        description: `UPI mandate will expire in 3 days. Renewal link sent to rider.`,
        riderId: sampleRider._id,
        priority: 'medium',
        actionRequired: false,
        actionType: 'check_status',
        actionLink: `/riders/${sampleRider._id}`,
        metadata: {
          riderName: sampleRider.name,
          riderId: sampleRider.riderId,
          daysLeft: 3,
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      },
      {
        type: 'new_rider_registered',
        title: `New Rider Registered – ${sampleRider.riderId}`,
        description: `Rider onboarding complete. All documents verified.`,
        riderId: sampleRider._id,
        priority: 'low',
        actionRequired: false,
        actionType: 'none',
        metadata: {
          riderName: sampleRider.name,
          riderId: sampleRider.riderId
        }
      },
      {
        type: 'payment_success',
        title: `Payment Success – ${sampleRider.riderId}`,
        description: `Weekly payment of ₹1,200 successfully processed.`,
        riderId: sampleRider._id,
        priority: 'low',
        actionRequired: false,
        actionType: 'none',
        metadata: {
          amount: 1200,
          riderName: sampleRider.name,
          riderId: sampleRider.riderId
        }
      },
      {
        type: 'document_uploaded',
        title: `Document Uploaded – ${sampleRider.riderId}`,
        description: `Rider has uploaded new driving license for verification.`,
        riderId: sampleRider._id,
        priority: 'medium',
        actionRequired: true,
        actionType: 'verify_documents',
        actionLink: `/riders/${sampleRider._id}/documents`,
        metadata: {
          riderName: sampleRider.name,
          riderId: sampleRider.riderId,
          documentType: 'driving_license'
        }
      }
    ];

    // Create notifications with different timestamps
    for (let i = 0; i < sampleNotifications.length; i++) {
      const notification = new Notification({
        ...sampleNotifications[i],
        createdAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000), // 2 hours apart
        isRead: i % 3 === 0 // Mark some as read
      });
      await notification.save();
    }
    
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createSampleNotifications();
