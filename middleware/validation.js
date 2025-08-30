const { validationResult, body, query } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  // User validation
  validateUser: [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['producer', 'certifier', 'buyer', 'auditor']).withMessage('Invalid role'),
    body('company').optional().trim().isLength({ max: 100 }).withMessage('Company name too long'),
    body('region').optional().trim().isLength({ max: 100 }).withMessage('Region name too long')
  ],

  // Batch validation
  validateBatch: [
    body('batchNumber').trim().isLength({ min: 3, max: 20 }).withMessage('Batch number must be between 3 and 20 characters'),
    body('kgProduced').isFloat({ min: 0.1 }).withMessage('Must produce at least 0.1 kg'),
    body('kwhUsed').isFloat({ min: 0.1 }).withMessage('Must use at least 0.1 kWh'),
    body('region').trim().isLength({ min: 2, max: 100 }).withMessage('Region must be between 2 and 100 characters'),
    body('productionDate').isISO8601().withMessage('Must be a valid date'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long')
  ],

  // Credit validation
  validateCreditTransfer: [
    body('recipientEmail').isEmail().normalizeEmail().withMessage('Must be a valid recipient email'),
    body('amount').isFloat({ min: 0.1 }).withMessage('Amount must be at least 0.1'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long')
  ],

  // Credit retirement validation
  validateCreditRetirement: [
    body('project').trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be between 2 and 100 characters'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long')
  ],

  // Search validation
  validateSearch: [
    query('q').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
    query('type').optional().isIn(['batches', 'credits', 'users', 'all']).withMessage('Invalid search type'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = {
  handleValidationErrors,
  commonValidations
};
