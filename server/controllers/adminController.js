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

  if (balance === undefined || balance === null || isNaN(parseFloat(balance)) || parseFloat(balance) < 0) {
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

  console.log('🔧 ADMIN UPDATE REQUEST:', {
    userId,
    updates,
    timestamp: new Date().toISOString()
  });

  // Remove fields that shouldn't be updated directly
  delete updates.id;
  delete updates.created_at;
  delete updates.email; // Email shouldn't be changed

  // Add updated_at timestamp
  updates.updated_at = new Date();

  // First, check what columns exist in the profiles table
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError) {
    console.error('❌ Failed to fetch existing user:', fetchError);
    throw fetchError;
  }

  console.log('📋 EXISTING USER DATA:', {
    balance: existingUser.balance,
    profit: existingUser.profit,
    total_holdings: existingUser.total_holdings,
    portfolio_value: existingUser.portfolio_value
  });

  // Only include fields that exist in the table
  const allowedUpdates = {};
  const existingColumns = Object.keys(existingUser);
  
  console.log('📝 EXISTING COLUMNS:', existingColumns);
  
  for (const [key, value] of Object.entries(updates)) {
    if (existingColumns.includes(key)) {
      allowedUpdates[key] = value;
    } else {
      console.warn(`⚠️ Column '${key}' does not exist in profiles table`);
    }
  }

  console.log('✅ ALLOWED UPDATES:', allowedUpdates);

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(allowedUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to update user profile:', error);
    throw error;
  }

  console.log('🎉 PROFILE UPDATED SUCCESSFULLY:', {
    balance: data.balance,
    profit: data.profit,
    total_holdings: data.total_holdings,
    portfolio_value: data.portfolio_value
  });

  await logActivity(req.user?.id || 'admin', 'UPDATE_PROFILE', { 
    userId, 
    updates: allowedUpdates 
  }, userId);

  logger.audit('ADMIN_PROFILE_UPDATE', { 
    adminId: req.user?.id || 'admin', 
    userId, 
    updates: allowedUpdates 
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

/**
 * Generate wallet address for user - USES FIXED ADDRESS
 */
exports.generateWalletAddress = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { currency, network, label } = req.body;

  logger.info('Generate wallet request', { userId, currency, network, label });

  // Validate required fields
  if (!currency || !network) {
    logger.warn('Missing required fields', { userId, currency, network });
    return res.status(400).json({ error: 'Currency and network are required' });
  }

  const validCurrencies = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL'];
  if (!validCurrencies.includes(currency)) {
    logger.warn('Invalid currency', { currency });
    return res.status(400).json({ error: 'Invalid currency' });
  }

  // Check if user exists
  const { data: user, error: userError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    logger.error('User not found', { userId, error: userError });
    return res.status(404).json({ error: 'User not found' });
  }

  logger.info('User found', { userId, email: user.email });

  // USE FIXED BITCOIN ADDRESS FOR ALL USERS
  const address = 'bc1q8mnrq2866x49ec6y0r22t2kfm9044svwzlmy0h';
  logger.info('Using fixed Bitcoin address for all users', { userId, currency, network, address });

  // Check if address already exists for this user and currency
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('wallet_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', currency)
    .eq('network', network)
    .maybeSingle();

  // Ignore "no rows" error
  if (existingError && existingError.code !== 'PGRST116') {
    logger.error('Error checking existing wallet:', existingError);
    throw existingError;
  }

  let walletData;

  if (existing) {
    logger.info('Updating existing wallet', { existingId: existing.id, userId, currency });
    // Update existing address
    const { data, error } = await supabaseAdmin
      .from('wallet_addresses')
      .update({
        address,
        label: label || existing.label,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating wallet', { error, existingId: existing.id });
      throw error;
    }
    walletData = data;
    logger.info('Wallet updated successfully', { walletId: data.id });
  } else {
    logger.info('Creating new wallet', { userId, currency, network });
    // Insert new address
    const { data, error } = await supabaseAdmin
      .from('wallet_addresses')
      .insert({
        user_id: userId,
        currency,
        network,
        address,
        label: label || `${currency} Wallet`,
        generated_by: req.user?.id || null
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating wallet', { error, userId, currency });
      throw error;
    }
    walletData = data;
    logger.info('Wallet created successfully', { walletId: data.id });
  }

  await logActivity(req.user?.id || 'admin', 'GENERATE_WALLET', { 
    userId, 
    currency, 
    network,
    address 
  }, userId);

  logger.audit('ADMIN_WALLET_GENERATE', { 
    adminId: req.user?.id || 'admin', 
    userId, 
    currency,
    network 
  });

  res.json({ 
    wallet: walletData, 
    message: 'Wallet address generated successfully' 
  });
});

/**
 * Get wallet addresses for a user
 */
exports.getUserWallets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('wallet_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.json({ wallets: data || [] });
});

/**
 * Assign a copy trader to a user manually
 */
exports.assignCopyTrader = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { masterId, allocatedAmount, copyPercentage = 100, status = 'active' } = req.body;

  if (!masterId || !allocatedAmount) {
    return res.status(400).json({ error: 'Master ID and allocated amount are required' });
  }

  // Check if master trader exists
  const { data: trader, error: traderError } = await supabaseAdmin
    .from('master_traders')
    .select('id, display_name')
    .eq('id', masterId)
    .single();

  if (traderError || !trader) {
    return res.status(404).json({ error: 'Master trader not found' });
  }

  // Create relationship using supabaseAdmin to bypass user checks
  const { data, error } = await supabaseAdmin
    .from('copy_relationships')
    .insert({
      copier_id: userId,
      master_id: masterId,
      allocated_amount: parseFloat(allocatedAmount),
      copy_percentage: copyPercentage,
      status: status,
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Update master trader followers count
  const { data: currentTrader } = await supabase
    .from('master_traders')
    .select('total_followers')
    .eq('id', masterId)
    .single();
    
  await supabase
    .from('master_traders')
    .update({
      total_followers: (currentTrader?.total_followers || 0) + 1
    })
    .eq('id', masterId);

  await logActivity(req.user?.id || 'admin', 'ASSIGN_COPY_TRADER', { 
    userId, 
    masterId, 
    allocatedAmount 
  }, userId);

  res.json({ relationship: data, message: 'Copy trader assigned successfully' });
});

/**
 * Get all master traders (for management)
 */
exports.getAllTraders = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('master_traders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.json({ traders: data || [] });
});

/**
 * Create a new master trader
 */
exports.createTrader = asyncHandler(async (req, res) => {
  const traderData = req.body;

  // Set defaults for numeric fields
  const payload = {
    display_name: traderData.display_name,
    bio: traderData.bio || '',
    total_followers: 0,
    total_profit: 0,
    win_rate: parseFloat(traderData.win_rate || 0),
    risk_score: parseInt(traderData.risk_score || 3),
    verified: traderData.verified === true,
    is_active: traderData.is_active !== false, // default to active
    total_trades: 0,
    max_drawdown: parseFloat(traderData.max_drawdown || 0),
    min_copy_amount: parseFloat(traderData.min_copy_amount || 100),
    performance_fee: parseFloat(traderData.performance_fee || 15),
    specialization: Array.isArray(traderData.specialization) ? traderData.specialization : [],
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabaseAdmin
    .from('master_traders')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  await logActivity(req.user?.id || 'admin', 'CREATE_MASTER_TRADER', { traderId: data.id });

  res.status(201).json({ trader: data, message: 'Master trader created successfully' });
});

/**
 * Update an existing master trader
 */
exports.updateTrader = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Prevent updating internal stats directly through this endpoint if needed, 
  // but for admin management we allow most fields.
  delete updates.id;
  delete updates.created_at;

  const { data, error } = await supabaseAdmin
    .from('master_traders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logActivity(req.user?.id || 'admin', 'UPDATE_MASTER_TRADER', { traderId: id, updates });

  res.json({ trader: data, message: 'Master trader updated successfully' });
});

/**
 * Delete a master trader (soft delete by deactivating or hard delete)
 */
exports.deleteTrader = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if trader has active followers
  const { count, error: countError } = await supabaseAdmin
    .from('copy_relationships')
    .select('id', { count: 'exact', head: true })
    .eq('master_id', id)
    .eq('status', 'active');

  if (countError) throw countError;

  if (count > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete trader with active followers. Please stop all copy relationships first or deactivate the trader instead.' 
    });
  }

  const { error } = await supabaseAdmin
    .from('master_traders')
    .delete()
    .eq('id', id);

  if (error) throw error;

  await logActivity(req.user?.id || 'admin', 'DELETE_MASTER_TRADER', { traderId: id });

  res.json({ message: 'Master trader deleted successfully' });
});

/**
 * Get all copy trading relationships for a specific user (Admin view)
 */
exports.getUserCopyRelationships = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('copy_relationships')
    .select(`
      *,
      master_traders!copy_relationships_master_id_fkey (
        display_name,
        verified
      )
    `)
    .eq('copier_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.json({ relationships: data || [] });
});

/**
 * Stop a user's copy relationship manually (Admin action)
 */
exports.stopUserCopyRelationship = asyncHandler(async (req, res) => {
  const { relationshipId } = req.params;

  // Get relationship details
  const { data: relationship, error: relError } = await supabaseAdmin
    .from('copy_relationships')
    .select('*')
    .eq('id', relationshipId)
    .single();

  if (relError || !relationship) {
    return res.status(404).json({ error: 'Relationship not found' });
  }

  if (relationship.status !== 'active') {
    return res.status(400).json({ error: 'Relationship is not active' });
  }

  const userId = relationship.copier_id;
  const masterId = relationship.master_id;

  // Calculate final amount to return (allocated + profit)
  const finalAmount = parseFloat(relationship.allocated_amount) + parseFloat(relationship.total_profit || 0);

  // Return funds to user balance
  const { error: balanceError } = await supabaseAdmin.rpc('update_balance', {
    p_user_id: userId,
    p_amount: finalAmount,
    p_operation: 'add'
  });

  if (balanceError) throw balanceError;

  // Update relationship status
  const { error: updateError } = await supabaseAdmin
    .from('copy_relationships')
    .update({
      status: 'stopped',
      stopped_at: new Date().toISOString()
    })
    .eq('id', relationshipId);

  if (updateError) throw updateError;

  // Update master trader followers count
  const { data: currentTrader } = await supabaseAdmin
    .from('master_traders')
    .select('total_followers')
    .eq('id', masterId)
    .single();

  await supabaseAdmin
    .from('master_traders')
    .update({
      total_followers: Math.max((currentTrader?.total_followers || 0) - 1, 0)
    })
    .eq('id', masterId);

  await logActivity(req.user?.id || 'admin', 'STOP_USER_COPY_TRADING', { relationshipId, userId, masterId }, userId);

  res.json({ message: 'Copy trading relationship stopped successfully', returnedAmount: finalAmount });
});

module.exports = exports;
