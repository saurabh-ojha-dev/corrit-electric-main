const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  vehicleType: {
    type: String,
    enum: ['electric_bike', 'electric_scooter', 'bicycle'],
    default: 'electric_bike'
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 2010,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    trim: true
  },
  gpsDeviceId: {
    type: String,
    unique: true,
    sparse: true
  },
  gpsDeviceInfo: {
    deviceType: String,
    simNumber: String,
    batteryLevel: Number,
    lastPing: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  batteryInfo: {
    capacity: Number, // in kWh
    currentLevel: Number, // percentage
    lastCharged: Date,
    health: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    }
  },
  insurance: {
    policyNumber: String,
    provider: String,
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  registration: {
    number: String,
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  maintenance: {
    lastService: Date,
    nextService: Date,
    serviceHistory: [{
      date: Date,
      description: String,
      cost: Number,
      serviceCenter: String
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
vehicleSchema.index({ riderId: 1 });
vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ gpsDeviceId: 1 });
vehicleSchema.index({ isActive: 1 });
vehicleSchema.index({ assignedDate: 1 });

// Virtual for vehicle display name
vehicleSchema.virtual('displayName').get(function() {
  return `${this.brand || ''} ${this.model || ''} (${this.vehicleNumber})`.trim();
});

// Virtual for vehicle age
vehicleSchema.virtual('age').get(function() {
  if (!this.year) return null;
  return new Date().getFullYear() - this.year;
});

// Virtual for insurance status
vehicleSchema.virtual('insuranceStatus').get(function() {
  if (!this.insurance.expiryDate) return 'Not Available';
  if (this.insurance.expiryDate < new Date()) return 'Expired';
  if (this.insurance.expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) return 'Expiring Soon';
  return 'Active';
});

// Virtual for registration status
vehicleSchema.virtual('registrationStatus').get(function() {
  if (!this.registration.expiryDate) return 'Not Available';
  if (this.registration.expiryDate < new Date()) return 'Expired';
  if (this.registration.expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) return 'Expiring Soon';
  return 'Active';
});

// Method to check if vehicle needs service
vehicleSchema.methods.needsService = function() {
  if (!this.maintenance.nextService) return false;
  return this.maintenance.nextService <= new Date();
};

// Method to add service record
vehicleSchema.methods.addServiceRecord = function(serviceData) {
  this.maintenance.serviceHistory.push({
    date: new Date(),
    description: serviceData.description,
    cost: serviceData.cost,
    serviceCenter: serviceData.serviceCenter
  });
  
  this.maintenance.lastService = new Date();
  this.maintenance.nextService = new Date(Date.now() + (6 * 30 * 24 * 60 * 60 * 1000)); // 6 months
  
  return this.save();
};

// Method to update GPS device status
vehicleSchema.methods.updateGPSStatus = function(status) {
  this.gpsDeviceInfo.lastPing = new Date();
  this.gpsDeviceInfo.isActive = status.isActive;
  if (status.batteryLevel !== undefined) {
    this.gpsDeviceInfo.batteryLevel = status.batteryLevel;
  }
  return this.save();
};

// Static method to get active vehicles
vehicleSchema.statics.getActiveVehicles = function() {
  return this.find({ isActive: true })
    .populate('riderId', 'name riderId phone')
    .sort({ assignedDate: -1 });
};

// Static method to get vehicles by type
vehicleSchema.statics.getVehiclesByType = function(vehicleType) {
  return this.find({ 
    vehicleType, 
    isActive: true 
  }).populate('riderId', 'name riderId');
};

// Static method to get vehicles needing service
vehicleSchema.statics.getVehiclesNeedingService = function() {
  return this.find({
    isActive: true,
    'maintenance.nextService': { $lte: new Date() }
  }).populate('riderId', 'name riderId phone');
};

// Static method to get vehicles with expiring documents
vehicleSchema.statics.getVehiclesWithExpiringDocuments = function(days = 30) {
  const expiryDate = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    isActive: true,
    $or: [
      { 'insurance.expiryDate': { $lte: expiryDate } },
      { 'registration.expiryDate': { $lte: expiryDate } }
    ]
  }).populate('riderId', 'name riderId phone');
};

// Static method to get vehicle statistics
vehicleSchema.statics.getVehicleStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        activeVehicles: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        byType: {
          $push: '$vehicleType'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalVehicles: 1,
        activeVehicles: 1,
        inactiveVehicles: { $subtract: ['$totalVehicles', '$activeVehicles'] },
        typeBreakdown: {
          $reduce: {
            input: '$byType',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $literal: {
                    $concat: ['$$this', ': ', { $toString: { $size: { $filter: { input: '$byType', cond: { $eq: ['$$this', '$$this'] } } } } }]
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalVehicles: 0,
    activeVehicles: 0,
    inactiveVehicles: 0,
    typeBreakdown: {}
  };
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
