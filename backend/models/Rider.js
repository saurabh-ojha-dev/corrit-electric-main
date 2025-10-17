const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const riderSchema = new mongoose.Schema({
  riderId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^RID-[A-Z]{3}\d{2}-\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid Rider ID format!`
    }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^(0?[6-9]\d{9})$/.test(v);
      },
      message: props => `${props.value} is not a valid Indian phone number!`
    }
  },
  upiId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  weeklyRentAmount: {
    type: Number,
    required: true,
    min: 1,
    default: 500
  },
  mandateStatus: {
    type: String,
    enum: ['pending', 'active', 'failed', 'suspended'],
    default: 'pending'
  },
  documents: {
    aadhaar: {
      type: String,
      required: false,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Aadhaar document must be a valid URL'
      }
    },
    pan: {
      type: String,
      required: false,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'PAN document must be a valid URL'
      }
    },
    addressProof: {
      type: String,
      required: false,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Address proof must be a valid URL'
      }
    },
    bankProof: {
      type: String,
      required: false,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Bank proof must be a valid URL'
      }
    },
    batteryCard: {
      type: String,
      required: false,
      default: undefined,

    },
    picture: {
      type: String,
      required: false,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Profile picture must be a valid URL'
      }
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLocationUpdate: {
    type: Date
  },
  mandateCreatedAt: {
    type: Date
  },
  mandateExpiryDate: {
    type: Date
  },
  mandateDetails: {
    phonepeOrderId: {
      type: String
    },
    phonepeSubscriptionId: {
      type: String
    },
    merchantOrderId: {
      type: String
    },
    merchantSubscriptionId: {
      type: String
    },
    merchantUserId: {
      type: String
    },
    amount: {
      type: Number
    },
    maxAmount: {
      type: Number
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'on_demand']
    },
    authWorkflowType: {
      type: String
    },
    amountType: {
      type: String
    },
    recurringCount: {
      type: Number
    },
    errorCode: {
      type: String
    },
    detailedErrorCode: {
      type: String
    },
    failureReason: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
riderSchema.index({ riderId: 1 });
riderSchema.index({ phone: 1 });
riderSchema.index({ upiId: 1 });
riderSchema.index({ mandateStatus: 1 });
riderSchema.index({ verificationStatus: 1 });
riderSchema.index({ assignedAdmin: 1 });
riderSchema.index({ isActive: 1 });

// Update virtual for full address to work with string
riderSchema.virtual('fullAddress').get(function() {
  return this.address; // Now just returns the address string
});

// Method to generate next Rider ID
riderSchema.statics.generateRiderId = async function(cityCode) {
  const year = new Date().getFullYear().toString().slice(-2);
  const pattern = `RID-${cityCode}${year}-`;
  
  const lastRider = await this.findOne({
    riderId: { $regex: `^${pattern}` }
  }).sort({ riderId: -1 });
  
  let sequence = 1;
  if (lastRider) {
    const lastSequence = parseInt(lastRider.riderId.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `${pattern}${sequence.toString().padStart(4, '0')}`;
};

// Method to check if all required documents are uploaded
riderSchema.methods.hasAllDocuments = function() {
  const requiredDocs = ['aadhaar', 'pan', 'addressProof', 'bankProof', 'picture'];
  return requiredDocs.every(doc => this.documents[doc]);
};

// Method to get document completion percentage
riderSchema.methods.getDocumentCompletion = function() {
  const requiredDocs = ['aadhaar', 'pan', 'addressProof', 'bankProof', 'picture'];
  const optionalDocs = ['batteryCard'];
  const allDocs = [...requiredDocs, ...optionalDocs];
  
  const uploadedDocs = allDocs.filter(doc => this.documents[doc]).length;
  return Math.round((uploadedDocs / allDocs.length) * 100);
};

// Apply pagination plugin
riderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Rider', riderSchema);
