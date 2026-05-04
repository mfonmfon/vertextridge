const { supabase } = require('../config/supabase');
const Logger = require('../utils/logger');
const { asyncHandler, ApiError } = require('../utils/errorHandler');

const logger = new Logger('COPY_TRADING_CONTROLLER');

/**
 * Get all master traders with filters
 */
exports.getMasterTraders = asyncHandler(async (req, res) => {
  const { sortBy = 'followers', limit = 20, offset = 0 } = req.query;

  let query = supabase
    .from('master_traders')
    .select('*')
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

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  res.json({
    traders: data,
    total: count,
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
  const { masterId, allocatedAmount, copyPercentage = 100, stopLoss, takeProfit } = req.body;
  const userId = req.user.id;

  logger.info('Start copying request', { userId, masterId, allocatedAmount });

  if (!masterId || !allocatedAmount) {
    throw new ApiError(400, 'Master ID and allocated amount required', 'MISSING_FIELDS');
  }

  if (allocatedAmount < 100) {
    throw new ApiError(400, 'Minimum copy amount is $100', 'AMOUNT_TOO_LOW');
  }

  // Check user balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();

  if (profileError) {
    logger.error('Error fetching user profile:', profileError);
    throw profileError;
  }

  if (!profile || profile.balance < allocatedAmount) {
    throw new ApiError(400, 'Insufficient balance', 'INSUFFICIENT_FUNDS');
  }

  // Check if already copying this trader
  const { data: existing, error: existingError } = await supabase
    .from('copy_relationships')
    .select('id')
    .eq('copier_id', userId)
    .eq('master_id', masterId)
    .eq('status', 'active')
    .maybeSingle();

  if (existingError) {
    logger.error('Error checking existing relationship:', existingError);
    throw existingError;
  }

  if (existing) {
    throw new ApiError(400, 'Already copying this trader', 'ALREADY_COPYING');
  }

  // Deduct allocated amount from balance
  const { error: balanceError } = await supabase.rpc('update_balance', {
    p_user_id: userId,
    p_amount: allocatedAmount,
    p_operation: 'subtract'
  });

  if (balanceError) {
    logger.error('Error updating balance:', balanceError);
    throw new ApiError(400, 'Failed to allocate funds', 'BALANCE_UPDATE_FAILED');
  }

  // Create copy relationship
  const { data: relationship, error: relationshipError } = await supabase
    .from('copy_relationships')
    .insert({
      copier_id: userId,
      master_id: masterId,
      allocated_amount: allocatedAmount,
      copy_percentage: copyPercentage,
      stop_loss_percentage: stopLoss,
      take_profit_percentage: takeProfit,
      status: 'active'
    })
    .select()
    .single();

  if (relationshipError) {
    logger.error('Error creating copy relationship:', relationshipError);
    // Rollback balance deduction
    await supabase.rpc('update_balance', {
      p_user_id: userId,
      p_amount: allocatedAmount,
      p_operation: 'add'
    });
    throw relationshipError;
  }

  // Update master trader followers count
  const { error: followerError } = await supabase
    .from('master_traders')
    .update({
      total_followers: supabase.raw('total_followers + 1')
    })
    .eq('id', masterId);

  if (followerError) {
    logger.warn('Failed to update follower count:', followerError);
  }

  // Audit log
  await supabase.from('audit_logs').insert({
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
  const userId = req.user.id;

  logger.info('Stop copying request', { userId, relationshipId });

  // Get relationship
  const { data: relationship, error: relError } = await supabase
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

  // Return allocated amount + profit to user balance
  const { error: balanceError } = await supabase.rpc('update_balance', {
    p_user_id: userId,
    p_amount: finalAmount,
    p_operation: 'add'
  });

  if (balanceError) {
    logger.error('Error updating balance:', balanceError);
    throw new ApiError(500, 'Failed to return funds', 'BALANCE_UPDATE_FAILED');
  }

  // Update relationship status
  const { error: updateError } = await supabase
    .from('copy_relationships')
    .update({
      status: 'stopped',
      stopped_at: new Date().toISOString()
    })
    .eq('id', relationshipId);

  if (updateError) {
    logger.error('Error updating relationship:', updateError);
    // Rollback balance addition
    await supabase.rpc('update_balance', {
      p_user_id: userId,
      p_amount: finalAmount,
      p_operation: 'subtract'
    });
    throw updateError;
  }

  // Update master trader followers count
  const { error: followerError } = await supabase
    .from('master_traders')
    .update({
      total_followers: supabase.raw('GREATEST(total_followers - 1, 0)')
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
  const userId = req.user.id;

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
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;

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
