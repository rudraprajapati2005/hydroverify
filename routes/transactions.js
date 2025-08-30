const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole, isProducer, isBuyer, isCertifier } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Credit = require('../models/Credit');
const Batch = require('../models/Batch');

// Get all transactions (Certifier/Auditor only)
router.get('/', authenticateToken, authorizeRole(['certifier', 'auditor']), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status, fromDate, toDate } = req.query;
  
  const query = {};
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: 'fromUser', select: 'name email company' },
      { path: 'toUser', select: 'name email company' },
      { path: 'batchId', select: 'batchNumber kgProduced' },
      { path: 'creditId', select: 'creditId supply' }
    ]
  };
  
  const transactions = await Transaction.paginate(query, options);
  
  res.json({
    success: true,
    data: transactions.docs,
    pagination: {
      page: transactions.page,
      totalPages: transactions.totalPages,
      totalDocs: transactions.totalDocs,
      hasNextPage: transactions.hasNextPage,
      hasPrevPage: transactions.hasPrevPage
    }
  });
}));

// Get user's own transactions
router.get('/my-transactions', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;
  
  const query = {
    $or: [{ fromUser: req.user.id }, { toUser: req.user.id }]
  };
  
  if (type) query.type = type;
  if (status) query.status = status;
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: [
      { path: 'fromUser', select: 'name email company' },
      { path: 'toUser', select: 'name email company' },
      { path: 'batchId', select: 'batchNumber kgProduced' },
      { path: 'creditId', select: 'creditId supply' }
    ]
  };
  
  const transactions = await Transaction.paginate(query, options);
  
  res.json({
    success: true,
    data: transactions.docs,
    pagination: {
      page: transactions.page,
      totalPages: transactions.totalPages,
      totalDocs: transactions.totalDocs,
      hasNextPage: transactions.hasNextPage,
      hasPrevPage: transactions.hasPrevPage
    }
  });
}));

// Get transaction by ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('fromUser', 'name email company')
    .populate('toUser', 'name email company')
    .populate('batchId', 'batchNumber kgProduced region')
    .populate('creditId', 'creditId supply status');
  
  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }
  
  // Check if user has access to this transaction
  if (!req.user.roles.includes('certifier') && !req.user.roles.includes('auditor')) {
    if (transaction.fromUser?._id.toString() !== req.user.id && 
        transaction.toUser?._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
  }
  
  res.json({
    success: true,
    data: transaction
  });
}));

// Create credit purchase transaction (Buyer only)
router.post('/purchase', authenticateToken, isBuyer, asyncHandler(async (req, res) => {
  const { creditId, amount, paymentMethod, notes } = req.body;
  
  // Validate credit exists and is available
  const credit = await Credit.findById(creditId);
  if (!credit) {
    return res.status(404).json({
      success: false,
      message: 'Credit not found'
    });
  }
  
  if (credit.status !== 'available') {
    return res.status(400).json({
      success: false,
      message: 'Credit is not available for purchase'
    });
  }
  
  // Create transaction
  const transaction = new Transaction({
    type: 'CREDIT_PURCHASE',
    fromUser: req.user.id,
    toUser: credit.ownerId,
    creditId: creditId,
    amount: amount,
    creditAmount: credit.supply,
    paymentMethod: paymentMethod || 'CREDIT_BALANCE',
    metadata: {
      description: `Purchase of ${credit.supply} kg hydrogen credits`,
      notes: notes
    }
  });
  
  await transaction.save();
  
  // Add audit entry
  await transaction.addAuditEntry('CREATED', req.user.id, 'Credit purchase transaction created');
  
  // Populate references for response
  await transaction.populate([
    { path: 'fromUser', select: 'name email company' },
    { path: 'toUser', select: 'name email company' },
    { path: 'creditId', select: 'creditId supply status' }
  ]);
  
  res.status(201).json({
    success: true,
    message: 'Credit purchase transaction created successfully',
    data: transaction
  });
}));

// Create credit transfer transaction (Buyer only)
router.post('/transfer', authenticateToken, isBuyer, asyncHandler(async (req, res) => {
  const { creditId, recipientEmail, amount, notes } = req.body;
  
  // Validate credit exists and user owns it
  const credit = await Credit.findById(creditId);
  if (!credit) {
    return res.status(404).json({
      success: false,
      message: 'Credit not found'
    });
  }
  
  if (credit.ownerId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You can only transfer credits you own'
    });
  }
  
  if (credit.status !== 'available') {
    return res.status(400).json({
      success: false,
      message: 'Credit is not available for transfer'
    });
  }
  
  // Find recipient user
  const recipient = await User.findOne({ email: recipientEmail });
  if (!recipient) {
    return res.status(404).json({
      success: false,
      message: 'Recipient user not found'
    });
  }
  
  if (recipient.id === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'Cannot transfer credits to yourself'
    });
  }
  
  // Create transaction
  const transaction = new Transaction({
    type: 'CREDIT_TRANSFER',
    fromUser: req.user.id,
    toUser: recipient.id,
    creditId: creditId,
    amount: 0, // Free transfer
    creditAmount: amount,
    paymentMethod: 'FREE',
    metadata: {
      description: `Transfer of ${amount} kg hydrogen credits`,
      notes: notes
    }
  });
  
  await transaction.save();
  
  // Add audit entry
  await transaction.addAuditEntry('CREATED', req.user.id, 'Credit transfer transaction created');
  
  // Populate references for response
  await transaction.populate([
    { path: 'fromUser', select: 'name email company' },
    { path: 'toUser', select: 'name email company' },
    { path: 'creditId', select: 'creditId supply status' }
  ]);
  
  res.status(201).json({
    success: true,
    message: 'Credit transfer transaction created successfully',
    data: transaction
  });
}));

// Create batch verification transaction (Certifier only)
router.post('/verification', authenticateToken, isCertifier, asyncHandler(async (req, res) => {
  const { batchId, amount, notes } = req.body;
  
  // Validate batch exists
  const batch = await Batch.findById(batchId);
  if (!batch) {
    return res.status(404).json({
      success: false,
      message: 'Batch not found'
    });
  }
  
  // Create transaction
  const transaction = new Transaction({
    type: 'BATCH_VERIFICATION',
    batchId: batchId,
    amount: amount,
    paymentMethod: 'CREDIT_BALANCE',
    metadata: {
      description: `Verification of batch ${batch.batchNumber}`,
      notes: notes
    }
  });
  
  await transaction.save();
  
  // Add audit entry
  await transaction.addAuditEntry('CREATED', req.user.id, 'Batch verification transaction created');
  
  // Populate references for response
  await transaction.populate([
    { path: 'batchId', select: 'batchNumber kgProduced region' }
  ]);
  
  res.status(201).json({
    success: true,
    message: 'Batch verification transaction created successfully',
    data: transaction
  });
}));

// Update transaction status (Certifier/Auditor only)
router.patch('/:id/status', authenticateToken, authorizeRole(['certifier', 'auditor']), asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }
  
  transaction.status = status;
  if (status === 'COMPLETED') {
    transaction.completedAt = new Date();
  }
  
  await transaction.save();
  
  // Add audit entry
  await transaction.addAuditEntry('STATUS_UPDATED', req.user.id, `Status changed to ${status}: ${notes || ''}`);
  
  res.json({
    success: true,
    message: 'Transaction status updated successfully',
    data: transaction
  });
}));

// Get transaction statistics (Certifier/Auditor only)
router.get('/stats/overview', authenticateToken, authorizeRole(['certifier', 'auditor']), asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.query;
  
  const query = {};
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }
  
  const stats = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalCredits: { $sum: '$creditAmount' },
        avgAmount: { $avg: '$amount' },
        avgCredits: { $avg: '$creditAmount' }
      }
    }
  ]);
  
  const typeStats = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalCredits: { $sum: '$creditAmount' }
      }
    }
  ]);
  
  const statusStats = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  res.json({
    success: true,
    data: {
      overview: stats[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        totalCredits: 0,
        avgAmount: 0,
        avgCredits: 0
      },
      byType: typeStats,
      byStatus: statusStats
    }
  });
}));

module.exports = router;
