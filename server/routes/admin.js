const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminProtect, superAdminProtect } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// All routes require authentication (admin check removed for now - add admin_users table first)
router.use(protect);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/balance', adminController.updateUserBalance);
router.patch('/users/:userId/kyc', adminController.updateKYCStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Platform settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSetting);

// Activity logs
router.get('/activity-logs', adminController.getActivityLogs);

module.exports = router;
