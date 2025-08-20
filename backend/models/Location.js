const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: false
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  address: {
    type: String,
    trim: true
  },
  speed: {
    type: Number,
    min: 0,
    default: 0
  },
  heading: {
    type: Number,
    min: 0,
    max: 360,
    default: 0
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  deviceInfo: {
    deviceId: String,
    batteryLevel: Number,
    isOnline: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
locationSchema.index({ riderId: 1, timestamp: -1 });
locationSchema.index({ coordinates: '2dsphere' });
locationSchema.index({ timestamp: -1 });

// Virtual for speed in km/h
locationSchema.virtual('speedKmh').get(function() {
  return Math.round(this.speed * 3.6);
});

// Static method to get current location of a rider
locationSchema.statics.getCurrentLocation = async function(riderId) {
  return this.findOne({ 
    riderId, 
    isActive: true 
  }).sort({ timestamp: -1 });
};

// Static method to get location history
locationSchema.statics.getLocationHistory = async function(riderId, startDate, endDate, limit = 100) {
  const query = { 
    riderId, 
    isActive: true 
  };
  
  if (startDate && endDate) {
    query.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get offline riders
locationSchema.statics.getOfflineRiders = async function(minutes = 30) {
  const cutoffTime = new Date(Date.now() - (minutes * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        isActive: true,
        timestamp: { $lt: cutoffTime }
      }
    },
    {
      $group: {
        _id: '$riderId',
        lastLocation: { $first: '$$ROOT' },
        lastUpdate: { $first: '$timestamp' }
      }
    },
    {
      $lookup: {
        from: 'riders',
        localField: '_id',
        foreignField: '_id',
        as: 'rider'
      }
    },
    {
      $unwind: '$rider'
    }
  ]);
};

module.exports = mongoose.model('Location', locationSchema);
