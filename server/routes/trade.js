const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const tradeController = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.use(protect); // All trade routes are protected

router.post('/execute',
  [
    body('asset').notEmpty().withMessage('Asset is required'),
    body('asset.id').notEmpty().withMessage('Asset ID is required'),
    body('asset.symbol').notEmpty().withMessage('Asset symbol is required'),
    body('type').isIn(['buy', 'sell']).withMessage('Type must be buy or sell'),
    body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be positive'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be positive'),
  ],
  validate,
  tradeController.executeTrade
);

router.get('/history', tradeController.getTradeHistory);
router.get('/holdings', tradeController.getHoldings);

module.exports = router;
