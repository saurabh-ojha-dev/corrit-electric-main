const mongoose = require('mongoose');

const phonepeAutopaySchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  mandateId: {
    type: String,
    required: true,
    unique: true
  },
  merchantOrderId: {
    type: String,
    required: true,
    unique: true
  },
  merchantSubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled', 'processing'],
    default: 'pending'
  },
  phonepeStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  orderId: {
    type: String,
    unique: true,
    sparse: true
  },
  utr: {
    type: String,
    sparse: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  processedDate: {
    type: Date
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  },
  failureReason: {
    type: String
  },
  webhookData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  mandateDetails: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'on_demand'],
      default: 'on_demand'
    },
    maxAmount: {
      type: Number,
      required: true
    }
  },
  phonepeResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  nextDebitDate: {
    type: Date
  },
  lastDebitDate: {
    type: Date
  },
  totalDebits: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
phonepeAutopaySchema.index({ riderId: 1 });
phonepeAutopaySchema.index({ mandateId: 1 });
phonepeAutopaySchema.index({ merchantOrderId: 1 });
phonepeAutopaySchema.index({ merchantSubscriptionId: 1 });
phonepeAutopaySchema.index({ status: 1 });
phonepeAutopaySchema.index({ scheduledDate: 1 });
phonepeAutopaySchema.index({ phonepeStatus: 1 });

// Method to update autopay status
phonepeAutopaySchema.methods.updateStatus = function(newStatus, additionalData = {}) {
  this.status = newStatus;
  this.processedDate = new Date();
  
  if (additionalData.transactionId) {
    this.transactionId = additionalData.transactionId;
  }
  if (additionalData.orderId) {
    this.orderId = additionalData.orderId;
  }
  if (additionalData.utr) {
    this.utr = additionalData.utr;
  }
  if (additionalData.phonepeStatus) {
    this.phonepeStatus = additionalData.phonepeStatus;
  }
  if (additionalData.failureReason) {
    this.failureReason = additionalData.failureReason;
  }
  if (additionalData.webhookData) {
    this.webhookData = { ...this.webhookData, ...additionalData.webhookData };
  }
  
  return this.save();
};

// Static method to get autopay statistics
phonepeAutopaySchema.statics.getAutopayStats = async function(riderId = null) {
  const matchStage = riderId ? { riderId: mongoose.Types.ObjectId(riderId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAutopays: { $sum: 1 },
        successfulAutopays: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failedAutopays: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        pendingAutopays: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        totalAmount: { $sum: '$amount' },
        successfulAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0] }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalAutopays: 0,
      successfulAutopays: 0,
      failedAutopays: 0,
      pendingAutopays: 0,
      totalAmount: 0,
      successfulAmount: 0,
      successRate: 0
    };
  }
  
  const stat = stats[0];
  return {
    ...stat,
    successRate: stat.totalAutopays > 0 ? 
      Math.round((stat.successfulAutopays / stat.totalAutopays) * 100) : 0
  };
};

module.exports = mongoose.model('PhonePeAutopay', phonepeAutopaySchema);
