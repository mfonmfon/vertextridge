const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const copyTradingController = require('../controllers/copyTradingController');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ── All copy trading routes are public ──────────────────────────────────────
// Admin manages master traders and executes trades via the admin panel.
// Users interact with these routes directly without needing a bearer token.

// Browse master traders
router.get('/masters', copyTradingController.getMasterTraders);
router.get('/masters/:id', copyTradingController.getMasterTrader);

// Start copying — userId must be sent in the request body
router.post('/start',
  [
    body('userId').notEmpty().withMessage('User ID required'),
    body('masterId').notEmpty().withMessage('Master trader ID required'),
    body('allocatedAmount').isFloat({ min: 1 }).withMessage('Minimum $1 required'),
    body('copyPercentage').optional().isFloat({ min: 1, max: 100 }).withMessage('Copy percentage must be 1-100'),
  ],
  validate,
  copyTradingController.startCopying
);

// Stop copying — userId must be sent in the request body
router.post('/stop/:relationshipId', copyTradingController.stopCopying);

// Get user's active copy relationships — userId passed as query param
router.get('/my-copies', copyTradingController.getMyCopyRelationships);

// Get user's copied trades history — userId passed as query param
router.get('/trades', copyTradingController.getCopiedTrades);

module.exports = router;
