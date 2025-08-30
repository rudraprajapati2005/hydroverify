const express = require('express');
const Batch = require('../models/Batch');
const Credit = require('../models/Credit');
const CreditEvent = require('../models/CreditEvent');
const User = require('../models/User');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/explorer
// @desc    Get public explorer data (all batches, credits, events)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, region, dateFrom, dateTo } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    let model = null;
    let populateOptions = [];

    // Determine which model to query based on type
    switch (type) {
      case 'batches':
        model = Batch;
        populateOptions = [
          { path: 'producerId', select: 'name company region' },
          { path: 'verificationResult.verifiedBy', select: 'name' }
        ];
        if (status) query.status = status;
        if (region) query.region = new RegExp(region, 'i');
        if (dateFrom || dateTo) {
          query.createdAt = {};
          if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
          if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }
        break;

      case 'credits':
        model = Credit;
        populateOptions = [
          { path: 'batchId', select: 'batchNumber kgProduced region verificationResult producerId', populate: { path: 'producerId', select: 'name company region' } },
          { path: 'ownerId', select: 'name company region' }
        ];
        if (status) query.status = status;
        if (region) {
          query['batchId'] = await Batch.find({ region: new RegExp(region, 'i') }).distinct('_id');
        }
        break;

      case 'events':
        model = CreditEvent;
        populateOptions = [
          { path: 'creditId', select: 'creditId' },
          { path: 'fromUser', select: 'name company' },
          { path: 'toUser', select: 'name company' }
        ];
        if (status) query.status = status;
        if (dateFrom || dateTo) {
          query.createdAt = {};
          if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
          if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }
        break;

      default:
        // Return summary statistics
        const [batchStats, creditStats, eventStats] = await Promise.all([
          Batch.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ]),
          Credit.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, totalSupply: { $sum: '$supply' } } }
          ]),
          CreditEvent.aggregate([
            { $group: { _id: '$eventType', count: { $sum: 1 } } }
          ])
        ]);

        const totalBatches = await Batch.countDocuments();
        const totalCredits = await Credit.countDocuments();
        const totalEvents = await CreditEvent.countDocuments();
        const totalSupply = await Credit.aggregate([
          { $match: { status: 'active' } },
          { $group: { _id: null, total: { $sum: '$supply' } } }
        ]);

        return res.json({
          success: true,
          data: {
            summary: {
              totalBatches,
              totalCredits,
              totalEvents,
              totalActiveSupply: totalSupply[0]?.total || 0,
              batchStatuses: batchStats,
              creditStatuses: creditStats,
              eventTypes: eventStats
            }
          }
        });
    }

    if (!model) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type parameter. Use: batches, credits, or events'
      });
    }

    const items = await model.find(query)
      .populate(populateOptions)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await model.countDocuments(query);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Explorer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching explorer data'
    });
  }
});

// @route   GET /api/explorer/batch/:id
// @desc    Get detailed batch information (Public)
// @access  Public
router.get('/batch/:id', async (req, res) => {
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

    // Get related credits
    const credits = await Credit.find({ batchId: batch._id })
      .populate('ownerId', 'name company region');

    // Get related events
    const events = await CreditEvent.find({ 
      creditId: { $in: credits.map(c => c._id) }
    })
      .populate('fromUser', 'name company')
      .populate('toUser', 'name company')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        batch,
        credits,
        events
      }
    });

  } catch (error) {
    console.error('Get batch details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching batch details'
    });
  }
});

// @route   GET /api/explorer/credit/:id
// @desc    Get detailed credit information (Public)
// @access  Public
router.get('/credit/:id', async (req, res) => {
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

    // Get all events for this credit
    const events = await CreditEvent.find({ creditId: credit._id })
      .populate('fromUser', 'name company')
      .populate('toUser', 'name company')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        credit,
        events
      }
    });

  } catch (error) {
    console.error('Get credit details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching credit details'
    });
  }
});

// @route   GET /api/explorer/search
// @desc    Search across all data types (Public)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    let results = [];

    // Search in batches
    if (!type || type === 'batches') {
      const batchResults = await Batch.find({
        $or: [
          { batchNumber: searchRegex },
          { region: searchRegex },
          { notes: searchRegex }
        ]
      })
        .populate('producerId', 'name company region')
        .limit(5);

      results.push(...batchResults.map(batch => ({
        type: 'batch',
        id: batch._id,
        title: `Batch ${batch.batchNumber}`,
        subtitle: `${batch.kgProduced}kg produced in ${batch.region}`,
        data: batch
      })));
    }

    // Search in credits
    if (!type || type === 'credits') {
      const creditResults = await Credit.find({
        creditId: searchRegex
      })
        .populate('batchId', 'batchNumber region')
        .populate('ownerId', 'name company')
        .limit(5);

      results.push(...creditResults.map(credit => ({
        type: 'credit',
        id: credit._id,
        title: `Credit ${credit.creditId}`,
        subtitle: `${credit.supply} credits from ${credit.batchId?.batchNumber || 'Unknown batch'}`,
        data: credit
      })));
    }

    // Search in users
    if (!type || type === 'users') {
      const userResults = await User.find({
        $or: [
          { name: searchRegex },
          { company: searchRegex },
          { region: searchRegex }
        ]
      })
        .select('name company region role')
        .limit(5);

      results.push(...userResults.map(user => ({
        type: 'user',
        id: user._id,
        title: user.name,
        subtitle: `${user.company || 'No company'} - ${user.role} in ${user.region || 'Unknown region'}`,
        data: user
      })));
    }

    // Sort results by relevance (simple scoring)
    results.sort((a, b) => {
      const aScore = a.title.toLowerCase().includes(q.toLowerCase()) ? 2 : 1;
      const bScore = b.title.toLowerCase().includes(q.toLowerCase()) ? 2 : 1;
      return bScore - aScore;
    });

    // Apply pagination
    const total = results.length;
    const paginatedResults = results.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        results: paginatedResults,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching'
    });
  }
});

// @route   GET /api/explorer/stats
// @desc    Get detailed statistics (Public)
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [batchStats, creditStats, userStats, eventStats] = await Promise.all([
      // Batch statistics
      Batch.aggregate([
        {
          $group: {
            _id: null,
            totalBatches: { $sum: 1 },
            totalKgProduced: { $sum: '$kgProduced' },
            totalKwhUsed: { $sum: '$kwhUsed' },
            avgTrustScore: { $avg: '$verificationResult.trustScore' },
            avgCarbonIntensity: { $avg: '$verificationResult.carbonIntensity' }
          }
        }
      ]),

      // Credit statistics
      Credit.aggregate([
        {
          $group: {
            _id: null,
            totalCredits: { $sum: 1 },
            totalSupply: { $sum: '$supply' },
            activeSupply: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$supply', 0] } },
            retiredSupply: { $sum: { $cond: [{ $eq: ['$status', 'retired'] }, '$supply', 0] } }
          }
        }
      ]),

      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),

      // Event statistics
      CreditEvent.aggregate([
        {
          $group: {
            _id: '$eventType',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Region statistics
    const regionStats = await Batch.aggregate([
      {
        $group: {
          _id: '$region',
          batchCount: { $sum: 1 },
          totalKgProduced: { $sum: '$kgProduced' },
          avgTrustScore: { $avg: '$verificationResult.trustScore' }
        }
      },
      { $sort: { totalKgProduced: -1 } },
      { $limit: 10 }
    ]);

    // Monthly trends
    const monthlyTrends = await Batch.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          batchCount: { $sum: 1 },
          totalKgProduced: { $sum: '$kgProduced' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          batches: batchStats[0] || {},
          credits: creditStats[0] || {},
          events: eventStats || []
        },
        users: userStats || [],
        regions: regionStats || [],
        trends: monthlyTrends || []
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;
