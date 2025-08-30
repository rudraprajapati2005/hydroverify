const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  producerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Producer ID is required']
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    unique: true,
    trim: true
  },
  kgProduced: {
    type: Number,
    required: [true, 'Kilograms produced is required'],
    min: [0, 'Kilograms produced cannot be negative']
  },
  kwhUsed: {
    type: Number,
    required: [true, 'Kilowatt-hours used is required'],
    min: [0, 'Kilowatt-hours used cannot be negative']
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim: true,
    maxlength: [100, 'Region cannot exceed 100 characters']
  },
  productionDate: {
    type: Date,
    required: [true, 'Production date is required']
  },
  certificateFiles: [{
    type: String, // URLs to uploaded files
    required: [true, 'At least one certificate file is required']
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'minted'],
    default: 'pending'
  },
  evidenceHash: {
    type: String,
    required: [true, 'Evidence hash is required'],
    unique: true
  },
  verificationResult: {
    kwhPerKg: {
      type: Number,
      min: [0, 'kWh per kg cannot be negative']
    },
    trustScore: {
      type: Number,
      min: [0, 'Trust score cannot be negative'],
      max: [100, 'Trust score cannot exceed 100']
    },
    carbonIntensity: {
      type: Number,
      min: [0, 'Carbon intensity cannot be negative']
    },
    anomalyFlags: [{
      type: String,
      trim: true
    }],
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Generate evidence hash before saving
batchSchema.pre('save', function(next) {
  if (!this.isModified('kgProduced') && !this.isModified('kwhUsed') && !this.isModified('productionDate')) {
    return next();
  }
  
  // Simulate blockchain hash generation
  const data = `${this.kgProduced}-${this.kwhUsed}-${this.productionDate}-${Date.now()}`;
  this.evidenceHash = require('crypto').createHash('sha256').update(data).digest('hex');
  next();
});

// Virtual for efficiency ratio
batchSchema.virtual('efficiencyRatio').get(function() {
  if (this.kwhUsed === 0) return 0;
  return this.kgProduced / this.kwhUsed;
});

// Indexes for better query performance
batchSchema.index({ producerId: 1, status: 1 });
batchSchema.index({ status: 1, createdAt: -1 });
batchSchema.index({ evidenceHash: 1 });

module.exports = mongoose.model('Batch', batchSchema);
