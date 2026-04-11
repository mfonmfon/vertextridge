const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All user routes are protected

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

module.exports = router;
