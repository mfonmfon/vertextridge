const { body, param, query } = require('express-validator');

/**
 * Reusable validation chains for common patterns
 */

const validators = {
  // User validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),

  fullName: body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be 2-100 characters'),

  // Financial validation
  amount: body('amount')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be between 0.01 and 1,000,000'),

  positiveAmount: body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be positive'),

  // Trade validation
  quantity: body('quantity')
    .isFloat({ gt: 0 })
    .withMessage('Quantity must be positive'),

  price: body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be positive'),

  tradeType: body('type')
    .isIn(['buy', 'sell'])
    .withMessage('Type must be buy or sell'),

  // UUID validation
  userId: param('userId')
    .isUUID()
    .withMessage('Invalid user ID format'),

  // Asset validation
  assetId: body('assetId')
    .trim()
    .notEmpty()
    .withMessage('Asset ID required'),

  // Method validation
  paymentMethod: body('method')
    .optional()
    .isIn(['bank', 'card', 'crypto', 'wallet'])
    .withMessage('Invalid payment method'),

  // KYC validation
  kycStatus: body('kycStatus')
    .optional()
    .isIn(['unverified', 'pending', 'verified', 'rejected'])
    .withMessage('Invalid KYC status')
};

module.exports = validators;
