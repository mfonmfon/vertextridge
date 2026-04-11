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

// Protect all onboarding routes
router.use(protect);

router.post(
  '/submit',
  [
    body('experience').optional(),
    body('goals').optional(),
  ],
  validate,
  onboardingController.submitOnboarding
);

router.get('/profile/:userId', onboardingController.getProfile);

module.exports = router;
