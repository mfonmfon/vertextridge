const { supabase } = require('../config/supabase');
const Logger = require('../utils/logger');
const logger = new Logger('ADMIN_MIDDLEWARE');

/**
 * Admin Authentication Middleware
 */
const adminProtect = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Not authorized',
        code: 'NO_AUTH'
      });
    }

    // Check if user is admin
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error || !adminUser) {
      logger.warn('Non-admin access attempt', {
        userId: req.user.id,
        email: req.user.email
      });
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.',
        code: 'NOT_ADMIN'
      });
    }

    req.admin = adminUser;
    next();
  } catch (error) {
    logger.error('Admin middleware error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Super Admin Middleware
 */
const superAdminProtect = async (req, res, next) => {
  try {
    if (!req.admin) {
      return res.status(403).json({ 
        error: 'Admin access required',
        code: 'NOT_ADMIN'
      });
    }

    if (req.admin.role !== 'super_admin') {
      logger.warn('Non-super-admin access attempt', {
        adminId: req.admin.id,
        role: req.admin.role
      });
      return res.status(403).json({ 
        error: 'Super admin privileges required',
        code: 'NOT_SUPER_ADMIN'
      });
    }

    next();
  } catch (error) {
    logger.error('Super admin middleware error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { adminProtect, superAdminProtect };
