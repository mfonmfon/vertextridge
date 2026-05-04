const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const copyTradingController = require('../controllers/copyTradingController');
const { protect } = require('../middleware/authMiddleware');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Public routes
router.get('/masters', copyTradingController.getMasterTraders);
router.get('/masters/:id', copyTradingController.getMasterTrader);

// Protected routes
router.use(protect);

router.post('/start',
  [
    body('masterId').notEmpty().withMessage('Master trader ID required'),
    body('allocatedAmount').isFloat({ min: 100 }).withMessage('Minimum $100 required'),
    body('copyPercentage').optional().isFloat({ min: 1, max: 100 }).withMessage('Copy percentage must be 1-100'),
  ],
  validate,
  copyTradingController.startCopying
);

router.post('/stop/:relationshipId', copyTradingController.stopCopying);
router.get('/my-copies', copyTradingController.getMyCopyRelationships);
router.get('/trades', copyTradingController.getCopiedTrades);

module.exports = router;
