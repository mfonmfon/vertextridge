const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const financeController = require('../controllers/financeController');
const { protect } = require('../middleware/authMiddleware');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.use(protect); // All finance routes are protected

router.post('/deposit',
  [
    body('amount')
      .isFloat({ min: 0.01, max: 1000000 })
      .withMessage('Amount must be between 0.01 and 1,000,000'),
    body('method')
      .optional()
      .isIn(['bank', 'card', 'crypto', 'wallet'])
      .withMessage('Invalid payment method'),
  ],
  validate,
  financeController.deposit
);

router.post('/withdraw',
  [
    body('amount')
      .isFloat({ min: 0.01, max: 1000000 })
      .withMessage('Amount must be between 0.01 and 1,000,000'),
    body('method')
      .optional()
      .isIn(['bank', 'card', 'crypto', 'wallet'])
      .withMessage('Invalid payment method'),
  ],
  validate,
  financeController.withdraw
);

router.post('/transfer',
  [
    body('recipient')
      .trim()
      .notEmpty()
      .withMessage('Recipient is required'),
    body('amount')
      .isFloat({ min: 0.01, max: 1000000 })
      .withMessage('Amount must be between 0.01 and 1,000,000'),
    body('note')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Note must be less than 500 characters'),
  ],
  validate,
  financeController.transfer
);

router.get('/transactions', financeController.getTransactions);

router.get('/crypto-address', financeController.getCryptoAddress);
router.post('/crypto-address/rotate', financeController.rotateCryptoAddress);
router.get('/bank-details', financeController.getBankDetails);

module.exports = router;
