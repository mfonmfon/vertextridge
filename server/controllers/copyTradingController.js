const { supabase, supabaseAdmin } = require('../config/supabase');
const Logger = require('../utils/logger');
const { asyncHandler, ApiError } = require('../utils/errorHandler');

const logger = new Logger('COPY_TRADING_CONTROLLER');

/**
 * Master traders are created by the admin in the admin panel.
 * Returns the trader row if it exists, otherwise null.
 */
const getTraderById = async (masterId) => {
  const { data, error } = await supabaseAdmin
    .from('master_traders')
    .select('id, display_name, is_active, min_copy_amount, total_followers')
    .eq('id', masterId)
    .maybeSingle();

  if (error) {
    logger.error('Error fetching master trader:', error);
    return null;
  }
  return data;
};

const ensureMasterTraderExists = async (masterId) => !!(await getTraderById(masterId));

exports.ensureMasterTraderExists = ensureMasterTraderExists;

/**
 * Get all master traders with filters
 */
exports.getMasterTraders = asyncHandler(async (req, res) => {
  const { sortBy = 'followers', limit = 20, offset = 0 } = req.query;

  let query = supabase
    .from('master_traders')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // Apply sorting
  switch (sortBy) {
    case 'profit':
      query = query.order('total_profit', { ascending: false });
      break;
    case 'winRate':
      query = query.order('win_rate', { ascending: false });
      break;
    case 'trades':
      query = query.order('total_trades', { ascending: false });
      break;
    default:
      query = query.order('total_followers', { ascending: false });
  }

  query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  res.json({
    traders: data || [],
    total: count || (data ? data.length : 0),
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

/**
 * Get single master trader details with performance
 */
exports.getMasterTrader = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get trader details
  const { data: trader, error: traderError } = await supabase
    .from('master_traders')
    .select('*')
    .eq('id', id)
    .single();

  if (traderError) throw traderError;

  // Get performance history (last 30 days)
  const { data: performance, error: perfError } = await supabase
    .from('master_performance_history')
    .select('*')
    .eq('master_id', id)
    .order('date', { ascending: false })
    .limit(30);

  if (perfError) throw perfError;

  res.json({
    trader,
    performance
  });
});

/**
 * Start copying a master trader
 */
exports.startCopying = asyncHandler(async (req, res) => {
  const { userId, masterId, allocatedAmount, copyPercentage = 100, stopLoss, takeProfit } = req.body;

  if (!userId) {
    throw new ApiError(400, 'User ID required', 'MISSING_USER_ID');
  }

  logger.info('=== START COPYING REQUEST ===', { 
    userId, 
    masterId, 
    allocatedAmount,
    body: req.body 
  });

  if (!masterId || !allocatedAmount) {
    logger.warn('Missing masterId or allocatedAmount', { masterId, allocatedAmount });
    throw new ApiError(400, 'Master ID and allocated amount required', 'MISSING_FIELDS');
  }

  if (allocatedAmount < 1) { // Reduced from 100 for more flexibility if needed, but keeping min 1
    throw new ApiError(400, 'Minimum copy amount is $1', 'AMOUNT_TOO_LOW');
  }

  const trader = await getTraderById(masterId);
  if (!trader || !trader.is_active) {
    logger.warn('Master trader not found or inactive', { masterId });
    throw new ApiError(404, 'Master trader not found', 'NOT_FOUND');
  }

  const minAmount = parseFloat(trader.min_copy_amount || 0);
  if (parseFloat(allocatedAmount) < minAmount) {
    throw new ApiError(400, `Minimum copy amount is $${minAmount}`, 'AMOUNT_TOO_LOW');
  }

  // Check user balance
  logger.info('DEBUG: Fetching profile balance for userId:', userId);
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();
  logger.info('DEBUG: Profile fetch complete', { error: profileError?.code });

  if (profileError) {
    logger.error('Error fetching user profile:', profileError);
    profileError.context = 'profileQuery';
    throw profileError;
  }

  if (!profile || profile.balance < allocatedAmount) {
    throw new ApiError(400, 'Insufficient balance', 'INSUFFICIENT_FUNDS');
  }

  // Check for an existing relationship with this trader (one row per user/trader pair)
  const { data: existing, error: existingError } = await supabaseAdmin
    .from('copy_relationships')
    .select('id, status')
    .eq('copier_id', userId)
    .eq('master_id', masterId)
    .maybeSingle();

  if (existingError) {
    logger.error('Error checking existing relationship:', existingError);
    existingError.context = 'existingCheck';
    throw existingError;
  }

  if (existing && existing.status !== 'stopped') {
    throw new ApiError(400, 'Already copying this trader', 'ALREADY_COPYING');
  }

  // Deduct allocated amount from balance
  const newBalance = profile.balance - allocatedAmount;
  const { error: balanceError } = await supabaseAdmin
    .from('profiles')
    .update({ balance: newBalance, updated_at: new Date() })
    .eq('id', userId);

  if (balanceError) {
    logger.error('Error updating balance:', balanceError);
    throw new ApiError(400, 'Failed to allocate funds', 'BALANCE_UPDATE_FAILED');
  }

  // Create copy relationship, or restart a previously stopped one
  const relationshipFields = {
    allocated_amount: allocatedAmount,
    copy_percentage: copyPercentage,
    stop_loss_percentage: stopLoss,
    take_profit_percentage: takeProfit,
    status: 'active'
  };

  const relationshipQuery = existing
    ? supabaseAdmin
        .from('copy_relationships')
        .update({
          ...relationshipFields,
          total_copied_trades: 0,
          total_profit: 0,
          started_at: new Date().toISOString(),
          stopped_at: null
        })
        .eq('id', existing.id)
    : supabaseAdmin
        .from('copy_relationships')
        .insert({ copier_id: userId, master_id: masterId, ...relationshipFields });

  const { data: relationship, error: relationshipError } = await relationshipQuery.select().single();

  if (relationshipError) {
    logger.error('Error creating copy relationship:', relationshipError);
    relationshipError.context = 'relationshipInsert';
    // Rollback balance deduction
    await supabaseAdmin
      .from('profiles')
      .update({ balance: profile.balance, updated_at: new Date() })
      .eq('id', userId);
    throw relationshipError;
  }

  // Update master trader followers count
  const { error: followerError } = await supabaseAdmin
    .from('master_traders')
    .update({
      total_followers: (trader.total_followers || 0) + 1
    })
    .eq('id', masterId);

  if (followerError) {
    logger.warn('Failed to update follower count:', followerError);
  }

  // Audit log
  await supabaseAdmin.from('audit_logs').insert({
    user_id: userId,
    action: 'START_COPY_TRADING',
    resource: 'copy_trading',
    details: { masterId, allocatedAmount, copyPercentage },
    ip_address: req.ip
  });

  logger.info('Copy trading started successfully', { userId, masterId, relationshipId: relationship.id });

  res.json({
    message: 'Successfully started copying trader',
    relationship
  });
});

/**
 * Stop copying a master trader
 */
exports.stopCopying = asyncHandler(async (req, res) => {
  const { relationshipId } = req.params;
  // userId can come from body or query param since route is now public
  const userId = req.body.userId || req.query.userId;

  if (!userId) {
    throw new ApiError(400, 'User ID required', 'MISSING_USER_ID');
  }

  logger.info('Stop copying request', { userId, relationshipId });

  // Get relationship
  const { data: relationship, error: relError } = await supabaseAdmin
    .from('copy_relationships')
    .select('*')
    .eq('id', relationshipId)
    .eq('copier_id', userId)
    .single();

  if (relError || !relationship) {
    logger.error('Copy relationship not found:', relError);
    throw new ApiError(404, 'Copy relationship not found', 'NOT_FOUND');
  }

  if (relationship.status !== 'active') {
    throw new ApiError(400, 'Copy relationship is not active', 'NOT_ACTIVE');
  }

  // Calculate final amount to return (allocated + profit)
  const finalAmount = parseFloat(relationship.allocated_amount) + parseFloat(relationship.total_profit || 0);

  // First, get current user balance
  const { data: userProfile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();

  if (profileError) {
    logger.error('Error fetching profile for balance update:', profileError);
    throw new ApiError(500, 'Failed to return funds', 'BALANCE_UPDATE_FAILED');
  }

  // Return allocated amount + profit to user balance
  const { error: balanceError } = await supabaseAdmin
    .from('profiles')
    .update({ balance: userProfile.balance + finalAmount, updated_at: new Date() })
    .eq('id', userId);

  if (balanceError) {
    logger.error('Error updating balance:', balanceError);
    throw new ApiError(500, 'Failed to return funds', 'BALANCE_UPDATE_FAILED');
  }

  // Update relationship status
  const { error: updateError } = await supabaseAdmin
    .from('copy_relationships')
    .update({
      status: 'stopped',
      stopped_at: new Date().toISOString()
    })
    .eq('id', relationshipId);

  if (updateError) {
    logger.error('Error updating relationship:', updateError);
    // Rollback balance addition
    await supabaseAdmin
      .from('profiles')
      .update({ balance: userProfile.balance, updated_at: new Date() })
      .eq('id', userId);
    throw updateError;
  }

  // Update master trader followers count
  const masterTrader = await getTraderById(relationship.master_id);
  const { error: followerError } = await supabaseAdmin
    .from('master_traders')
    .update({
      total_followers: Math.max((masterTrader?.total_followers || 0) - 1, 0)
    })
    .eq('id', relationship.master_id);

  if (followerError) {
    logger.warn('Failed to update follower count:', followerError);
  }

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'STOP_COPY_TRADING',
    resource: 'copy_trading',
    details: { relationshipId, profit: relationship.total_profit },
    ip_address: req.ip
  });

  logger.info('Copy trading stopped successfully', { userId, relationshipId, finalAmount });

  res.json({
    message: 'Successfully stopped copying trader',
    finalProfit: relationship.total_profit,
    returnedAmount: finalAmount
  });
});

/**
 * Get user's active copy relationships
 */
exports.getMyCopyRelationships = asyncHandler(async (req, res) => {
  // userId passed as a query param: /my-copies?userId=xxx
  const userId = req.query.userId || req.body.userId;

  if (!userId) {
    throw new ApiError(400, 'User ID required', 'MISSING_USER_ID');
  }

  const { data, error } = await supabase
    .from('copy_relationships')
    .select(`
      id,
      copier_id,
      master_id,
      allocated_amount,
      copy_percentage,
      stop_loss_percentage,
      take_profit_percentage,
      status,
      total_copied_trades,
      total_profit,
      started_at,
      stopped_at,
      created_at,
      master_traders!copy_relationships_master_id_fkey (
        id,
        display_name,
        bio,
        verified,
        total_followers,
        win_rate,
        risk_score
      )
    `)
    .eq('copier_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching copy relationships:', error);
    throw error;
  }

  // Transform data to include trader info at top level
  const relationships = data.map(rel => ({
    id: rel.id,
    copier_id: rel.copier_id,
    master_trader_id: rel.master_id,
    copy_amount: rel.allocated_amount,
    copy_percentage: rel.copy_percentage,
    stop_loss_percentage: rel.stop_loss_percentage,
    take_profit_percentage: rel.take_profit_percentage,
    status: rel.status,
    trades_copied: rel.total_copied_trades,
    total_profit_loss: rel.total_profit,
    started_at: rel.started_at,
    stopped_at: rel.stopped_at,
    created_at: rel.created_at,
    trader_name: rel.master_traders?.display_name || 'Unknown Trader',
    trader_verified: rel.master_traders?.verified || false,
    win_rate: rel.master_traders?.win_rate || 0
  }));

  res.json({ relationships });
});

/**
 * Get copied trades history
 */
exports.getCopiedTrades = asyncHandler(async (req, res) => {
  // userId passed as a query param: /trades?userId=xxx
  const userId = req.query.userId || req.body.userId;
  const { limit = 50, offset = 0 } = req.query;

  if (!userId) {
    throw new ApiError(400, 'User ID required', 'MISSING_USER_ID');
  }

  const { data, error } = await supabase
    .from('copied_trades')
    .select(`
      id,
      copy_relationship_id,
      copier_id,
      asset_id,
      symbol,
      type,
      quantity,
      entry_price,
      exit_price,
      profit_loss,
      status,
      opened_at,
      closed_at,
      copy_relationships!copied_trades_copy_relationship_id_fkey (
        master_id,
        master_traders!copy_relationships_master_id_fkey (
          display_name
        )
      )
    `)
    .eq('copier_id', userId)
    .order('opened_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (error) {
    logger.error('Error fetching copied trades:', error);
    throw error;
  }

  // Transform data to match expected structure
  const trades = data.map(trade => ({
    id: trade.id,
    copy_relationship_id: trade.copy_relationship_id,
    copier_id: trade.copier_id,
    asset_symbol: trade.symbol,
    trade_type: trade.type,
    amount: parseFloat(trade.entry_price) * parseFloat(trade.quantity),
    quantity: trade.quantity,
    entry_price: trade.entry_price,
    exit_price: trade.exit_price,
    profit_loss: trade.profit_loss || 0,
    status: trade.status,
    copied_at: trade.opened_at,
    closed_at: trade.closed_at,
    master_trader_id: trade.copy_relationships?.master_id,
    trader_name: trade.copy_relationships?.master_traders?.display_name || 'Unknown Trader'
  }));

  res.json({ trades });
});

module.exports = exports;
