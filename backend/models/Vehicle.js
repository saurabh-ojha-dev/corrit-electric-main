const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Remove required riderId field since vehicles are created without riders initially
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: false // Changed from true to false
  },
  vehicleName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  vehicleRegistrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  vehicleChassisNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  vehicleMotorNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  iotImeiNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  controllerNumber: {
    type: String,
    required: false, // Changed from true to false to match form
    unique: true,
    trim: true,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  assignedRiderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider'
  },
  // Fix the unassignedRiderId structure
  unassignedRiderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider'
  },
  unassignedDate: {
    type: Date
  },
}, {
  timestamps: true
});

// Indexes for better query performance
vehicleSchema.index({ riderId: 1 });
vehicleSchema.index({ vehicleName: 1 });
vehicleSchema.index({ vehicleRegistrationNumber: 1 });
vehicleSchema.index({ vehicleChassisNumber: 1 });
vehicleSchema.index({ vehicleMotorNumber: 1 });
vehicleSchema.index({ iotImeiNumber: 1 });
vehicleSchema.index({ controllerNumber: 1 });
vehicleSchema.index({ isActive: 1 });
vehicleSchema.index({ createdAt: 1 });
vehicleSchema.index({ updatedAt: 1 });
vehicleSchema.index({ assignedRiderId: 1 });
vehicleSchema.index({ unassignedRiderId: 1 });
vehicleSchema.index({ unassignedDate: 1 });

// Virtual for vehicle display name
vehicleSchema.virtual('displayName').get(function () {
  return `${this.vehicleName || ''} (${this.vehicleRegistrationNumber})`.trim();
});

// Virtual for vehicle display name
vehicleSchema.virtual('riderName').get(function () {
  return `${this.riderId.name || ''} (${this.riderId.riderId})`.trim();
});

// Static method to get active vehicles
vehicleSchema.statics.getActiveVehicles = function () {
  return this.find({ isActive: true })
    .populate('riderId', 'name riderId')
    .sort({ createdAt: -1 });
};

// Static method to get vehicle statistics
vehicleSchema.statics.getVehicleStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        activeVehicles: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
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
