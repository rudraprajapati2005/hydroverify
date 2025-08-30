const express = require('express');
const { body, validationResult } = require('express-validator');
const Credit = require('../models/Credit');
const CreditEvent = require('../models/CreditEvent');
const Batch = require('../models/Batch');
const { authenticateToken, isBuyer, isProducer, isProducerOrCertifier } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/credits
// @desc    Get available credits for purchase
// @access  Private - Buyer
router.get('/', [authenticateToken, isBuyer], async (req, res) => {
  try {
    const { page = 1, limit = 10, region, minTrustScore } = req.query;
    const skip = (page - 1) * limit;

    let query = { status: 'active' };

    // Filter by region if specified
    if (region) {
      query['batchId'] = await Batch.find({ region: new RegExp(region, 'i') }).distinct('_id');
    }

    // Filter by minimum trust score if specified
    if (minTrustScore) {
      query['batchId'] = await Batch.find({ 
        'verificationResult.trustScore': { $gte: parseInt(minTrustScore) }
      }).distinct('_id');
    }

    const credits = await Credit.find(query)
      .populate({
        path: 'batchId',
        select: 'batchNumber kgProduced region verificationResult producerId',
        populate: {
          path: 'producerId',
          select: 'name company region'
        }
      })
      .populate('ownerId', 'name company region')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Credit.countDocuments(query);

    res.json({
      success: true,
      data: {
        credits,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching credits'
    });
  }
});

// @route   GET /api/credits/my-credits
// @desc    Get user's own credits
// @access  Private
router.get('/my-credits', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { ownerId: req.user._id };
    if (status) query.status = status;

    const credits = await Credit.find(query)
      .populate({
        path: 'batchId',
        select: 'batchNumber kgProduced region verificationResult',
        populate: {
          path: 'producerId',
          select: 'name company region'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Credit.countDocuments(query);

    res.json({
      success: true,
      data: {
        credits,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get my credits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching credits'
    });
  }
});

// @route   GET /api/credits/:id
// @desc    Get credit by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const credit = await Credit.findById(req.params.id)
      .populate({
        path: 'batchId',
        select: 'batchNumber kgProduced region verificationResult producerId',
        populate: {
          path: 'producerId',
          select: 'name company region'
        }
      })
      .populate('ownerId', 'name company region')
      .populate('transferHistory.fromUser', 'name company')
      .populate('transferHistory.toUser', 'name company');

    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Credit not found'
      });
    }

    res.json({
      success: true,
      data: { credit }
    });

  } catch (error) {
    console.error('Get credit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching credit'
    });
  }
});

// @route   POST /api/credits/:id/transfer
// @desc    Transfer credit ownership (Buyer only)
// @access  Private - Buyer
router.post('/:id/transfer', [
  authenticateToken,
  isBuyer,
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Transfer amount must be a positive number'),
  body('toUserId')
    .isMongoId()
    .withMessage('Valid recipient user ID is required')
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

    const { amount, toUserId } = req.body;

    const credit = await Credit.findById(req.params.id);
    
    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Credit not found'
      });
    }

    if (credit.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Credit is not available for transfer'
      });
    }

    if (credit.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only transfer credits you own'
      });
    }

    if (amount > credit.supply) {
      return res.status(400).json({
        success: false,
        message: 'Transfer amount cannot exceed available supply'
      });
    }

    // Check if recipient exists and is active
    const User = require('../models/User');
    const recipient = await User.findById(toUserId);
    if (!recipient || !recipient.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient user'
      });
    }

    // Create transfer event
    const transferEvent = new CreditEvent({
      creditId: credit._id,
      eventType: 'TRANSFER',
      fromUser: req.user._id,
      toUser: toUserId,
      amount,
      details: {
        transferType: 'ownership',
        previousOwner: credit.ownerId
      }
    });

    await transferEvent.save();

    // Update credit ownership
    credit.ownerId = toUserId;
    credit.transferHistory.push({
      fromUser: req.user._id,
      toUser: toUserId,
      transferredAt: new Date(),
      transferAmount: amount,
      transactionHash: transferEvent.transactionHash
    });

    await credit.save();

    res.json({
      success: true,
      message: 'Credit transferred successfully',
      data: { 
        credit,
        transferEvent
      }
    });

  } catch (error) {
    console.error('Transfer credit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while transferring credit'
    });
  }
});

// @route   POST /api/credits/:id/retire
// @desc    Retire credit (Buyer only)
// @access  Private - Buyer
router.post('/:id/retire', [
  authenticateToken,
  isBuyer,
  body('retirementReason')
    .trim()
    .notEmpty()
    .withMessage('Retirement reason is required')
    .isLength({ max: 500 })
    .withMessage('Retirement reason cannot exceed 500 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Retirement amount must be a positive number')
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

    const { retirementReason, amount } = req.body;

    const credit = await Credit.findById(req.params.id);
    
    if (!credit) {
      return res.status(404).json({
        success: false,
        message: 'Credit not found'
      });
    }

    if (credit.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Credit is not available for retirement'
      });
    }

    if (credit.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only retire credits you own'
      });
    }

    const retirementAmount = amount || credit.supply;

    if (retirementAmount > credit.supply) {
      return res.status(400).json({
        success: false,
        message: 'Retirement amount cannot exceed available supply'
      });
    }

    // Generate retirement receipt
    const receiptId = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    // Create retirement certificate (simulated)
    const retirementCertificate = {
      receiptId,
      retiredAt: new Date(),
      retiredBy: req.user._id,
      retirementReason,
      certificateUrl: `/api/credits/${credit._id}/retirement-certificate/${receiptId}`,
      carbonOffset: retirementAmount * 0.5, // Simulated calculation
      renewableEnergyEquivalent: retirementAmount * 2.5 // Simulated calculation
    };

    // Create retirement event
    const retirementEvent = new CreditEvent({
      creditId: credit._id,
      eventType: 'RETIRE',
      fromUser: req.user._id,
      toUser: req.user._id, // Same user for retirement
      amount: retirementAmount,
      details: {
        retirementReason,
        receiptId,
        carbonOffset: retirementCertificate.carbonOffset
      }
    });

    await retirementEvent.save();

    // Update credit status
    credit.status = 'retired';
    credit.retirementReceipt = retirementCertificate;
    credit.supply = credit.supply - retirementAmount;

    await credit.save();

    res.json({
      success: true,
      message: 'Credit retired successfully',
      data: { 
        credit,
        retirementEvent,
        retirementCertificate
      }
    });

  } catch (error) {
    console.error('Retire credit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retiring credit'
    });
  }
});

// @route   GET /api/credits/:id/retirement-certificate/:receiptId
// @desc    Get retirement certificate (Public)
// @access  Public
router.get('/:id/retirement-certificate/:receiptId', async (req, res) => {
  try {
    const { id, receiptId } = req.params;

    const credit = await Credit.findById(id);
    
    if (!credit || !credit.retirementReceipt || credit.retirementReceipt.receiptId !== receiptId) {
      return res.status(404).json({
        success: false,
        message: 'Retirement certificate not found'
      });
    }

    // Generate certificate data
    const certificate = {
      receiptId: credit.retirementReceipt.receiptId,
      creditId: credit.creditId,
      retiredAt: credit.retirementReceipt.retiredAt,
      retirementReason: credit.retirementReceipt.retirementReason,
      carbonOffset: credit.retirementReceipt.carbonOffset,
      renewableEnergyEquivalent: credit.retirementReceipt.renewableEnergyEquivalent,
      certificateNumber: `CERT-${receiptId}`,
      issuer: 'Green Hydrogen Credits System',
      validity: 'Permanent',
      blockchainHash: credit.retirementReceipt.receiptId // Simulated
    };

    res.json({
      success: true,
      data: { certificate }
    });

  } catch (error) {
    console.error('Get retirement certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching certificate'
    });
  }
});

module.exports = router;
