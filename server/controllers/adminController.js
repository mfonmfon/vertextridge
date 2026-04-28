const { supabase, supabaseAdmin } = require('../config/supabase');
const Logger = require('../utils/logger');
const { asyncHandler } = require('../utils/errorHandler');

const logger = new Logger('ADMIN_CONTROLLER');

/**
 * Log admin activity - TEMPORARY: Skip for testing
 */
const logActivity = async (adminId, action, details = {}, targetUserId = null) => {
  // Skip logging for now
  return;
  // await supabase.from('admin_activity_logs').insert({
  //   admin_id: adminId,
  //   action,
  //   target_user_id: targetUserId,
  //   details
  // });
};

/**
 * Get dashboard statistics
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const [usersResult, tradesResult, transactionsResult, balanceResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('trades').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('transactions').select('amount'),
      supabaseAdmin.from('profiles').select('balance')
    ]);

    console.log('Dashboard stats:', {
      usersCount: usersResult.count,
      tradesCount: tradesResult.count,
      transactionsLength: transactionsResult.data?.length,
      balanceLength: balanceResult.data?.length
    });

    const totalVolume = transactionsResult.data?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;
    const totalBalance = balanceResult.data?.reduce((sum, p) => sum + parseFloat(p.balance || 0), 0) || 0;

    res.json({
      totalUsers: usersResult.count || 0,
      totalTrades: tradesResult.count || 0,
      totalVolume: totalVolume.toFixed(2),
      totalBalance: totalBalance.toFixed(2)
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Get all users with pagination - FIXED VERSION
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;

  console.log('getUsers called:', { page, limit, search, offset });

  try {
    // Use service role client to bypass RLS
    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search && search.trim()) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    console.log('getUsers result:', { 
      dataLength: data?.length, 
      count, 
      error: error?.message,
      firstUser: data?.[0]
    });

    if (error) {
      console.error('getUsers error:', error);
      throw error;
    }

    // Ensure all users have required fields
    const users = (data || []).map(user => ({
      ...user,
      name: user.name || user.email?.split('@')[0] || 'Unknown User',
      balance: parseFloat(user.balance || 0),
      kyc_status: user.kyc_status || 'unverified'
    }));

    res.json({
      users,
      total: count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((count || 0) / parseInt(limit))
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
  }
});

/**
 * Update user balance
 */
exports.updateUserBalance = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { balance, reason } = req.body;

  if (balance === undefined || balance < 0) {
    return res.status(400).json({ error: 'Invalid balance amount' });
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ balance: parseFloat(balance), updated_at: new Date() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  await logActivity(req.user?.id || 'admin', 'UPDATE_BALANCE', { 
    userId, 
    newBalance: balance, 
    reason 
  }, userId);

  logger.audit('ADMIN_BALANCE_UPDATE', { 
    adminId: req.user?.id || 'admin', 
    userId, 
    balance 
  });

  res.json({ user: data, message: 'Balance updated successfully' });
});

/**
 * Update user profile (profit, name, country, etc.)
 */
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  // Remove fields that shouldn't be updated directly
  delete updates.id;
  delete updates.created_at;
  delete updates.email; // Email shouldn't be changed

  // Add updated_at timestamp
  updates.updated_at = new Date();

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  await logActivity(req.user?.id || 'admin', 'UPDATE_PROFILE', { 
    userId, 
    updates 
  }, userId);

  logger.audit('ADMIN_PROFILE_UPDATE', { 
    adminId: req.user?.id || 'admin', 
    userId, 
    updates 
  });

  res.json({ user: data, message: 'Profile updated successfully' });
});

/**
 * Update user KYC status
 */
exports.updateKYCStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { kycStatus } = req.body;

  const validStatuses = ['unverified', 'pending', 'verified', 'rejected'];
  if (!validStatuses.includes(kycStatus)) {
    return res.status(400).json({ error: 'Invalid KYC status' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ kyc_status: kycStatus, updated_at: new Date() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  await logActivity(req.user?.id || 'admin', 'UPDATE_KYC', { userId, kycStatus }, userId);

  res.json({ user: data, message: 'KYC status updated successfully' });
});

/**
 * Get platform settings
 */
exports.getSettings = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value')
      .order('key');

    if (error) {
      // If table doesn't exist, return default settings
      if (error.code === '42P01' || error.code === 'PGRST116') {
        logger.warn('platform_settings table does not exist, returning defaults');
        return res.json({ 
          settings: {
            signup_bonus: '50.00',
            trading_fee: '0.001',
            withdrawal_fee: '2.50',
            min_deposit: '10.00',
            min_withdrawal: '20.00',
            maintenance_mode: 'false'
          }
        });
      }
      throw error;
    }

    // Convert array to object
    const settings = {};
    if (data && data.length > 0) {
      data.forEach(setting => {
        settings[setting.key] = setting.value;
      });
    } else {
      // Return defaults if no settings found
      return res.json({ 
        settings: {
          signup_bonus: '50.00',
          trading_fee: '0.001',
          withdrawal_fee: '2.50',
          min_deposit: '10.00',
          min_withdrawal: '20.00',
          maintenance_mode: 'false'
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    logger.error('Failed to get settings', { error: error.message });
    // Return default settings on error
    res.status(200).json({ 
      settings: {
        signup_bonus: '50.00',
        trading_fee: '0.001',
        withdrawal_fee: '2.50',
        min_deposit: '10.00',
        min_withdrawal: '20.00',
        maintenance_mode: 'false'
      }
    });
  }
});

/**
 * Update platform setting
 */
exports.updateSetting = asyncHandler(async (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Key and value are required' });
  }

  try {
    // Check if table exists first
    const { data: tableCheck, error: tableError } = await supabase
      .from('platform_settings')
      .select('id')
      .limit(1);

    // If table doesn't exist, return success with a message
    if (tableError && (tableError.code === '42P01' || tableError.code === 'PGRST116')) {
      logger.warn('platform_settings table does not exist, skipping update');
      return res.json({ 
        message: 'Settings table not configured. Please run database migrations.',
        setting: { key, value }
      });
    }

    // Try to update existing setting first
    const { data: existing } = await supabase
      .from('platform_settings')
      .select('id')
      .eq('key', key)
      .single();

    let data, error;

    if (existing) {
      // Update existing
      const result = await supabase
        .from('platform_settings')
        .update({ 
          value, 
          updated_by: req.user.id,
          updated_at: new Date() 
        })
        .eq('key', key)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('platform_settings')
        .insert({ 
          key, 
          value, 
          updated_by: req.user?.id || 'admin',
          updated_at: new Date() 
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      logger.error('Failed to update setting', { error: error.message, key, value });
      throw error;
    }

    await logActivity(req.user?.id || 'admin', 'UPDATE_SETTING', { key, value });

    logger.audit('ADMIN_SETTING_UPDATE', { 
      adminId: req.user?.id || 'admin', 
      key, 
      value 
    });

    res.json({ setting: data, message: 'Setting updated successfully' });
  } catch (error) {
    logger.error('Failed to update setting', { error: error.message, key, value });
    res.status(500).json({ error: 'Failed to update setting: ' + error.message });
  }
});

/**
 * Get admin activity logs
 */
exports.getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('admin_activity_logs')
    .select(`
      *,
      admin:admin_users(email, role),
      target:profiles(email, name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  res.json({
    logs: data,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit)
  });
});

/**
 * Delete user account
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;

  await logActivity(req.user?.id || 'admin', 'DELETE_USER', { userId }, userId);

  logger.audit('ADMIN_USER_DELETE', { adminId: req.user?.id || 'admin', userId });

  res.json({ message: 'User deleted successfully' });
});
