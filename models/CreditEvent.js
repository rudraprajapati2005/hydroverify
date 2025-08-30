const mongoose = require('mongoose');

const creditEventSchema = new mongoose.Schema({
  creditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credit',
    required: [true, 'Credit ID is required']
  },
  eventType: {
    type: String,
    enum: ['MINT', 'TRANSFER', 'RETIRE'],
    required: [true, 'Event type is required']
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'From user is required']
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'To user is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  transactionHash: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  blockNumber: {
    type: Number,
    min: [0, 'Block number cannot be negative']
  },
  gasUsed: {
    type: Number,
    min: [0, 'Gas used cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'confirmed'
  },
  metadata: {
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Generate transaction hash before saving
creditEventSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionHash) {
    // Simulate blockchain transaction hash
    const data = `${this.creditId}-${this.eventType}-${this.fromUser}-${this.toUser}-${this.amount}-${Date.now()}`;
    this.transactionHash = require('crypto').createHash('sha256').update(data).digest('hex');
  }
  next();
});

// Indexes for better query performance
creditEventSchema.index({ creditId: 1, createdAt: -1 });
creditEventSchema.index({ eventType: 1, createdAt: -1 });
creditEventSchema.index({ fromUser: 1, createdAt: -1 });
creditEventSchema.index({ toUser: 1, createdAt: -1 });
creditEventSchema.index({ transactionHash: 1 });

module.exports = mongoose.model('CreditEvent', creditEventSchema);
