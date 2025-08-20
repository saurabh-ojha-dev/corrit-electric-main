const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'one_time'],
    default: 'weekly'
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
  phonepeStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING'
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
      enum: ['weekly', 'monthly'],
      default: 'weekly'
    },
    maxAmount: {
      type: Number,
      required: true
    },
    mandateType: {
      type: String,
      enum: ['UPI_AUTOPAY', 'NACH'],
      default: 'UPI_AUTOPAY'
    }
  },
  phonepeResponse: {
    merchantId: String,
    merchantTransactionId: String,
    instrumentResponse: {
      type: String,
      enum: ['UPI_AUTOPAY', 'NACH'],
      default: 'UPI_AUTOPAY'
    },
    redirectInfo: {
      url: String
    },
    merchantOrderId: String,
    amount: Number,
    redirectUrl: String,
    callbackUrl: String,
    paymentInstrument: {
      type: String,
      enum: ['UPI_AUTOPAY', 'NACH']
    }
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
paymentSchema.index({ riderId: 1 });
paymentSchema.index({ mandateId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ scheduledDate: 1 });
paymentSchema.index({ processedDate: 1 });
paymentSchema.index({ phonepeStatus: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ utr: 1 });
paymentSchema.index({ createdAt: 1 });

// Virtual for payment duration
paymentSchema.virtual('duration').get(function() {
  if (this.processedDate && this.scheduledDate) {
    return this.processedDate - this.scheduledDate;
  }
  return null;
});

// Virtual for payment status display
paymentSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending',
    'success': 'Success',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
    'processing': 'Processing'
  };
  return statusMap[this.status] || this.status;
});

// Method to check if payment is overdue
paymentSchema.methods.isOverdue = function() {
  if (this.status === 'pending' && this.scheduledDate < new Date()) {
    return true;
  }
  return false;
};

// Method to check if payment can be retried
paymentSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.retryCount < 3;
};

// Method to increment retry count
paymentSchema.methods.incrementRetry = function() {
  this.retryCount += 1;
  return this.save();
};

// Method to update payment status
paymentSchema.methods.updateStatus = function(newStatus, additionalData = {}) {
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

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(riderId = null) {
  const matchStage = riderId ? { riderId: mongoose.Types.ObjectId(riderId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        },
        pendingPayments: {
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
      totalPayments: 0,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      totalAmount: 0,
      successfulAmount: 0,
      successRate: 0
    };
  }
  
  const stat = stats[0];
  return {
    ...stat,
    successRate: stat.totalPayments > 0 ? 
      Math.round((stat.successfulPayments / stat.totalPayments) * 100) : 0
  };
};

// Static method to get overdue payments
paymentSchema.statics.getOverduePayments = function() {
  return this.find({
    status: 'pending',
    scheduledDate: { $lt: new Date() }
  }).populate('riderId', 'name email phone riderId');
};

// Static method to get payments by date range
paymentSchema.statics.getPaymentsByDateRange = function(startDate, endDate, riderId = null) {
  const query = {
    scheduledDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (riderId) {
    query.riderId = riderId;
  }
  
  return this.find(query).populate('riderId', 'name email phone riderId');
};

module.exports = mongoose.model('Payment', paymentSchema);
