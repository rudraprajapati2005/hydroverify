const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const transactionSchema = new mongoose.Schema({
  // Transaction identification
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Transaction type
  type: {
    type: String,
    enum: ['CREDIT_PURCHASE', 'CREDIT_TRANSFER', 'CREDIT_RETIREMENT', 'BATCH_VERIFICATION', 'SUBSCRIPTION', 'REFUND'],
    required: true
  },
  
  // Parties involved
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.type !== 'BATCH_VERIFICATION'; }
  },
  
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.type === 'CREDIT_TRANSFER' || this.type === 'CREDIT_PURCHASE'; }
  },
  
  // Related entities
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: function() { return this.type === 'BATCH_VERIFICATION'; }
  },
  
  creditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credit',
    required: function() { return ['CREDIT_TRANSFER', 'CREDIT_RETIREMENT'].includes(this.type); }
  },
  
  // Financial details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  
  // Credit amount (for credit-related transactions)
  creditAmount: {
    type: Number,
    min: 0,
    required: function() { return ['CREDIT_PURCHASE', 'CREDIT_TRANSFER', 'CREDIT_RETIREMENT'].includes(this.type); }
  },
  
  // Transaction status
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  
  // Payment method (for financial transactions)
  paymentMethod: {
    type: String,
    enum: ['CREDIT_CARD', 'BANK_TRANSFER', 'CRYPTO', 'CREDIT_BALANCE', 'FREE'],
    required: function() { return this.amount > 0; }
  },
  
  // Transaction metadata
  metadata: {
    description: String,
    notes: String,
    externalReference: String,
    paymentProcessor: String,
    processorTransactionId: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date
  },
  
  // Audit trail
  auditTrail: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ fromUser: 1 });
transactionSchema.index({ toUser: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ batchId: 1 });
transactionSchema.index({ creditId: 1 });

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  if (this.isModified()) {
    this.updatedAt = new Date();
  }
  
  if (this.status === 'COMPLETED' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Instance methods
transactionSchema.methods.addAuditEntry = function(action, userId, details) {
  this.auditTrail.push({
    action,
    userId,
    details
  });
  return this.save();
};

transactionSchema.methods.markAsCompleted = function() {
  this.status = 'COMPLETED';
  this.completedAt = new Date();
  return this.save();
};

transactionSchema.methods.markAsFailed = function() {
  this.status = 'FAILED';
  return this.save();
};

// Static methods
transactionSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [{ fromUser: userId }, { toUser: userId }]
  }).sort({ createdAt: -1 });
};

transactionSchema.statics.findByType = function(type) {
  return this.find({ type }).sort({ createdAt: -1 });
};

transactionSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Virtual for transaction summary
transactionSchema.virtual('summary').get(function() {
  return `${this.type} - ${this.amount} ${this.currency}`;
});

// Add pagination plugin
transactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Transaction', transactionSchema);
