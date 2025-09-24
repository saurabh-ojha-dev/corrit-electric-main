const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'payment_failed',
      'mandate_expired', 
      'mandate_expiring',
      'location_alert',
      'gps_signal_lost',
      'system_alert',
      'new_rider_registered',
      'document_uploaded',
      'document_verified',
      'payment_success',
      'payment_retry',
      'mandate_created',
      'mandate_failed'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: false // Some notifications might not be rider-specific
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false // Some notifications might not be admin-specific
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PhonePeAutopay',
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionType: {
    type: String,
    enum: [
      'resend_payment',
      'view_on_map',
      'check_status',
      'verify_documents',
      'contact_rider',
      'retry_mandate',
      'review_payment',
      'none'
    ],
    default: 'none'
  },
  actionLink: {
    type: String,
    trim: true
  },
  actionData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    amount: Number,
    riderName: String,
    riderId: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    timestamp: Date,
    deviceInfo: String,
    errorCode: String,
    retryCount: Number
  },
  sentVia: {
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  readBy: [{
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ type: 1 });
notificationSchema.index({ riderId: 1 });
notificationSchema.index({ adminId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ actionRequired: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ expiresAt: 1 });

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Virtual for priority color
notificationSchema.virtual('priorityColor').get(function() {
  const colorMap = {
    'low': 'blue',
    'medium': 'yellow',
    'high': 'orange',
    'critical': 'red'
  };
  return colorMap[this.priority] || 'gray';
});

// Virtual for type icon
notificationSchema.virtual('typeIcon').get(function() {
  const iconMap = {
    'payment_failed': '💰',
    'mandate_expired': '⏰',
    'mandate_expiring': '⚠️',
    'location_alert': '📍',
    'gps_signal_lost': '📡',
    'system_alert': '🔔',
    'new_rider_registered': '👤',
    'document_uploaded': '📄',
    'document_verified': '✅',
    'payment_success': '✅',
    'payment_retry': '🔄',
    'mandate_created': '📋',
    'mandate_failed': '❌'
  };
  return iconMap[this.type] || '🔔';
});

// Method to mark as read
notificationSchema.methods.markAsRead = function(adminId) {
  this.isRead = true;
  
  // Add to readBy array if not already present
  const alreadyRead = this.readBy.some(reader => 
    reader.adminId.toString() === adminId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({
      adminId: adminId,
      readAt: new Date()
    });
  }
  
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  return this.save();
};

// Static method to create payment failed notification
notificationSchema.statics.createPaymentFailedNotification = async function(paymentData) {
  const notification = new this({
    type: 'payment_failed',
    title: `Payment Failed – ${paymentData.riderId}`,
    description: `UPI mandate for ₹${paymentData.amount} could not be processed. Rider must re-approve in PhonePe app.`,
    riderId: paymentData.riderId,
    paymentId: paymentData.paymentId,
    priority: 'high',
    actionRequired: true,
    actionType: 'resend_payment',
    actionLink: `/payments/${paymentData.paymentId}`,
    metadata: {
      amount: paymentData.amount,
      riderName: paymentData.riderName,
      riderId: paymentData.riderId,
      errorCode: paymentData.errorCode,
      retryCount: paymentData.retryCount
    }
  });
  
  return notification.save();
};

// Static method to create location alert notification
notificationSchema.statics.createLocationAlertNotification = async function(locationData) {
  const notification = new this({
    type: 'location_alert',
    title: `GPS Signal Lost – ${locationData.riderId}`,
    description: `Rider's location not updated for 30 mins. Possible device issue.`,
    riderId: locationData.riderId,
    priority: 'medium',
    actionRequired: true,
    actionType: 'view_on_map',
    actionLink: `/tracking/${locationData.riderId}`,
    metadata: {
      riderName: locationData.riderName,
      riderId: locationData.riderId,
      location: locationData.lastLocation,
      timestamp: locationData.lastUpdate,
      deviceInfo: locationData.deviceInfo
    }
  });
  
  return notification.save();
};

// Static method to create mandate expiring notification
notificationSchema.statics.createMandateExpiringNotification = async function(mandateData) {
  const notification = new this({
    type: 'mandate_expiring',
    title: `Mandate Expiring – ${mandateData.riderId}`,
    description: `UPI mandate will expire in ${mandateData.daysLeft} days. Renewal link sent to rider.`,
    riderId: mandateData.riderId,
    priority: 'medium',
    actionRequired: false,
    actionType: 'check_status',
    actionLink: `/riders/${mandateData.riderId}`,
    metadata: {
      riderName: mandateData.riderName,
      riderId: mandateData.riderId,
      daysLeft: mandateData.daysLeft,
      expiryDate: mandateData.expiryDate
    }
  });
  
  return notification.save();
};

// Static method to get unread notifications count
notificationSchema.statics.getUnreadCount = async function(adminId = null) {
  const query = { isRead: false };
  if (adminId) {
    query.adminId = adminId;
  }
  return this.countDocuments(query);
};

// Static method to get notifications by type
notificationSchema.statics.getByType = async function(type, limit = 50) {
  return this.find({ type })
    .populate('riderId', 'name riderId')
    .populate('adminId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get notifications for dashboard
notificationSchema.statics.getDashboardNotifications = async function(limit = 10) {
  return this.find({
    isRead: false,
    priority: { $in: ['high', 'critical'] }
  })
    .populate('riderId', 'name riderId')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to mark all notifications as read
notificationSchema.statics.markAllAsRead = async function(adminId) {
  return this.updateMany(
    { isRead: false },
    { 
      $set: { isRead: true },
      $push: { 
        readBy: {
          adminId: adminId,
          readAt: new Date()
        }
      }
    }
  );
};

// Static method to clean expired notifications
notificationSchema.statics.cleanExpired = async function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
