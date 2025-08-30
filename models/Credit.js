const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch ID is required']
  },
  creditId: {
    type: String,
    required: [true, 'Credit ID is required'],
    unique: true,
    trim: true
  },
  supply: {
    type: Number,
    required: [true, 'Credit supply is required'],
    min: [0, 'Credit supply cannot be negative']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  status: {
    type: String,
    enum: ['active', 'transferred', 'retired'],
    default: 'active'
  },
  retirementReceipt: {
    receiptId: {
      type: String,
      trim: true
    },
    retiredAt: {
      type: Date
    },
    retiredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    retirementReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Retirement reason cannot exceed 500 characters']
    },
    certificateUrl: {
      type: String,
      trim: true
    }
  },
  transferHistory: [{
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    transferredAt: {
      type: Date,
      default: Date.now
    },
    transferAmount: {
      type: Number,
      required: true,
      min: [0, 'Transfer amount cannot be negative']
    },
    transactionHash: {
      type: String,
      trim: true
    }
  }],
  metadata: {
    carbonOffset: {
      type: Number,
      min: [0, 'Carbon offset cannot be negative']
    },
    renewableEnergyPercentage: {
      type: Number,
      min: [0, 'Renewable energy percentage cannot be negative'],
      max: [100, 'Renewable energy percentage cannot exceed 100']
    },
    certificationStandard: {
      type: String,
      trim: true,
      maxlength: [100, 'Certification standard cannot exceed 100 characters']
    }
  }
}, {
  timestamps: true
});

// Generate credit ID before saving
creditSchema.pre('save', function(next) {
  if (this.isNew) {
    // Simulate blockchain token ID generation
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.creditId = `H2C-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Virtual for current owner
creditSchema.virtual('currentOwner').get(function() {
  if (this.transferHistory.length > 0) {
    return this.transferHistory[this.transferHistory.length - 1].toUser;
  }
  return this.ownerId;
});

// Indexes for better query performance
creditSchema.index({ ownerId: 1, status: 1 });
creditSchema.index({ batchId: 1 });
creditSchema.index({ creditId: 1 });
creditSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Credit', creditSchema);
