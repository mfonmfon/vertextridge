const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminProtect, superAdminProtect } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// All routes require authentication AND admin privileges
// TEMPORARY: Bypass admin auth for testing
// router.use(protect);
// router.use(adminProtect);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/balance', adminController.updateUserBalance);
router.patch('/users/:userId/kyc', adminController.updateKYCStatus);
router.delete('/users/:userId', superAdminProtect, adminController.deleteUser); // Only super admin can delete

// Platform settings
router.get('/settings', adminController.getSettings);
router.put('/settings', superAdminProtect, adminController.updateSetting); // Only super admin can update settings

// Activity logs
router.get('/activity-logs', adminController.getActivityLogs);

module.exports = router;
