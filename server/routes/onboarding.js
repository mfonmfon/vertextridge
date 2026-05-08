const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const onboardingController = require('../controllers/onboardingController');
const { protect } = require('../middleware/authMiddleware');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Public: get user profile by userId (needed for dashboard auto-refresh without token dependency)
// This only reads profile data - no sensitive writes
router.get('/profile/:userId', onboardingController.getProfile);

// Protected routes below
router.post(
  '/submit',
  protect,
  [
    body('experience').optional(),
    body('goals').optional(),
  ],
  validate,
  onboardingController.submitOnboarding
);

module.exports = router;
