const express = require('express');
const { body, validationResult } = require('express-validator');
const Batch = require('../models/Batch');
const Credit = require('../models/Credit');
const CreditEvent = require('../models/CreditEvent');
const { authenticateToken, isProducer, isCertifier, isProducerOrCertifier } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/batches
// @desc    Create a new batch (Producer only)
// @access  Private - Producer
router.post('/', [
  authenticateToken,
  isProducer,
  body('batchNumber')
    .trim()
    .notEmpty()
    .withMessage('Batch number is required'),
  body('kgProduced')
    .isFloat({ min: 0 })
    .withMessage('Kilograms produced must be a positive number'),
  body('kwhUsed')
    .isFloat({ min: 0 })
    .withMessage('Kilowatt-hours used must be a positive number'),
  body('region')
    .trim()
    .notEmpty()
    .withMessage('Region is required'),
  body('productionDate')
    .isISO8601()
    .withMessage('Production date must be a valid date'),
  body('certificateFiles')
    .isArray({ min: 1 })
    .withMessage('At least one certificate file is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      batchNumber,
      kgProduced,
      kwhUsed,
      region,
      productionDate,
      certificateFiles,
      notes
    } = req.body;

    // Check if batch number already exists
    const existingBatch = await Batch.findOne({ batchNumber });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Batch number already exists'
      });
    }

    // Create new batch
    const batch = new Batch({
      producerId: req.user._id,
      batchNumber,
      kgProduced,
      kwhUsed,
      region,
      productionDate,
      certificateFiles,
      notes
    });

    await batch.save();

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: { batch }
    });

  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating batch'
    });
  }
});

// @route   GET /api/batches
// @desc    Get batches (filtered by user role)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, region } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by user role
    if (req.user.role === 'producer') {
      query.producerId = req.user._id;
    } else if (req.user.role === 'certifier') {
      query.status = { $in: ['pending', 'approved'] };
    }

    // Additional filters
    if (status) query.status = status;
    if (region) query.region = new RegExp(region, 'i');

    const batches = await Batch.find(query)
      .populate('producerId', 'name company region')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Batch.countDocuments(query);

    res.json({
      success: true,
      data: {
        batches,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching batches'
    });
  }
});

// @route   GET /api/batches/:id
// @desc    Get batch by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('producerId', 'name company region')
      .populate('verificationResult.verifiedBy', 'name');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'producer' && batch.producerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this batch'
      });
    }

    res.json({
      success: true,
      data: { batch }
    });

  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching batch'
    });
  }
});

// @route   GET /api/batches/:id/verify
// @desc    Simulate AI verification (Certifier only)
// @access  Private - Certifier
router.get('/:id/verify', [authenticateToken, isCertifier], async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    if (batch.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Batch is not pending verification'
      });
    }

    // Simulate AI verification process
    const kwhPerKg = batch.kwhUsed / batch.kgProduced;
    
    // Simulate trust score calculation
    let trustScore = 85; // Base score
    if (kwhPerKg < 50) trustScore += 10; // Very efficient
    else if (kwhPerKg < 60) trustScore += 5; // Efficient
    else if (kwhPerKg > 80) trustScore -= 10; // Less efficient
    
    // Add some randomness to simulate AI analysis
    trustScore += Math.floor(Math.random() * 10) - 5;
    trustScore = Math.max(60, Math.min(100, trustScore)); // Keep between 60-100

    // Simulate carbon intensity calculation
    const carbonIntensity = kwhPerKg * 0.5 + Math.random() * 0.1;

    // Simulate anomaly detection
    const anomalyFlags = [];
    if (kwhPerKg > 100) anomalyFlags.push('Unusually high energy consumption');
    if (batch.kgProduced > 10000) anomalyFlags.push('Very large batch size');
    if (trustScore < 70) anomalyFlags.push('Low trust score detected');

    const verificationResult = {
      kwhPerKg: parseFloat(kwhPerKg.toFixed(2)),
      trustScore,
      carbonIntensity: parseFloat(carbonIntensity.toFixed(4)),
      anomalyFlags,
      verifiedAt: new Date(),
      verifiedBy: req.user._id
    };

    res.json({
      success: true,
      message: 'Verification completed',
      data: { verificationResult }
    });

  } catch (error) {
    console.error('Verify batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
});

// @route   POST /api/batches/:id/approve
// @desc    Approve batch (Certifier only)
// @access  Private - Certifier
router.post('/:id/approve', [
  authenticateToken,
  isCertifier,
  body('verificationResult')
    .isObject()
    .withMessage('Verification result is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { verificationResult, notes } = req.body;

    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    if (batch.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Batch is not pending approval'
      });
    }

    // Update batch with verification result
    batch.verificationResult = verificationResult;
    batch.status = 'approved';
    if (notes) batch.notes = notes;

    await batch.save();

    res.json({
      success: true,
      message: 'Batch approved successfully',
      data: { batch }
    });

  } catch (error) {
    console.error('Approve batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving batch'
    });
  }
});

// @route   POST /api/batches/:id/reject
// @desc    Reject batch (Certifier only)
// @access  Private - Certifier
router.post('/:id/reject', [
  authenticateToken,
  isCertifier,
  body('rejectionReason')
    .trim()
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rejectionReason } = req.body;

    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    if (batch.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Batch is not pending approval'
      });
    }

    batch.status = 'rejected';
    batch.rejectionReason = rejectionReason;

    await batch.save();

    res.json({
      success: true,
      message: 'Batch rejected successfully',
      data: { batch }
    });

  } catch (error) {
    console.error('Reject batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting batch'
    });
  }
});

// @route   POST /api/batches/:id/mint
// @desc    Mint credits from approved batch (Certifier only)
// @access  Private - Certifier
router.post('/:id/mint', [
  authenticateToken,
  isCertifier,
  body('supply')
    .isFloat({ min: 0 })
    .withMessage('Credit supply must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { supply } = req.body;

    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    if (batch.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Batch must be approved before minting credits'
      });
    }

    // Create credit
    const credit = new Credit({
      batchId: batch._id,
      supply,
      ownerId: batch.producerId
    });

    await credit.save();

    // Create credit event
    const creditEvent = new CreditEvent({
      creditId: credit._id,
      eventType: 'MINT',
      fromUser: req.user._id, // Certifier
      toUser: batch.producerId, // Producer
      amount: supply,
      details: {
        batchId: batch._id,
        batchNumber: batch.batchNumber
      }
    });

    await creditEvent.save();

    // Update batch status
    batch.status = 'minted';
    await batch.save();

    res.json({
      success: true,
      message: 'Credits minted successfully',
      data: { 
        credit,
        creditEvent,
        batch
      }
    });

  } catch (error) {
    console.error('Mint credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while minting credits'
    });
  }
});

module.exports = router;
