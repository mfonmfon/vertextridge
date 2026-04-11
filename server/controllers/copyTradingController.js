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

  if (!masterId || !allocatedAmount) {
    throw new ApiError(400, 'Master ID and allocated amount required', 'MISSING_FIELDS');
  }

  if (allocatedAmount < 100) {
    throw new ApiError(400, 'Minimum copy amount is $100', 'AMOUNT_TOO_LOW');
  }

  // Check user balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();

  if (profile.balance < allocatedAmount) {
    throw new ApiError(400, 'Insufficient balance', 'INSUFFICIENT_FUNDS');
  }

  // Check if already copying this trader
  const { data: existing } = await supabase
    .from('copy_relationships')
    .select('*')
    .eq('copier_id', userId)
    .eq('master_id', masterId)
    .eq('status', 'active')
    .single();

  if (existing) {
    throw new ApiError(400, 'Already copying this trader', 'ALREADY_COPYING');
  }

  // Deduct allocated amount from balance
  await supabase.rpc('update_balance', {
    p_user_id: userId,
    p_amount: allocatedAmount,
    p_operation: 'subtract'
  });

  // Create copy relationship
  const { data: relationship, error } = await supabase
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

  if (error) throw error;

  // Update master trader followers count
  await supabase.rpc('increment', {
    table_name: 'master_traders',
    row_id: masterId,
    column_name: 'total_followers'
  });

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'START_COPY_TRADING',
    resource: 'copy_trading',
    details: { masterId, allocatedAmount, copyPercentage },
    ip_address: req.ip
  });

  logger.info('Copy trading started', { userId, masterId, allocatedAmount });

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

  // Get relationship
  const { data: relationship, error: relError } = await supabase
    .from('copy_relationships')
    .select('*')
    .eq('id', relationshipId)
    .eq('copier_id', userId)
    .single();

  if (relError) throw relError;

  if (!relationship) {
    throw new ApiError(404, 'Copy relationship not found', 'NOT_FOUND');
  }

  // Return allocated amount to user balance
  await supabase.rpc('update_balance', {
    p_user_id: userId,
    p_amount: relationship.allocated_amount + relationship.total_profit,
    p_operation: 'add'
  });

  // Update relationship status
  const { error: updateError } = await supabase
    .from('copy_relationships')
    .update({
      status: 'stopped',
      stopped_at: new Date()
    })
    .eq('id', relationshipId);

  if (updateError) throw updateError;

  // Update master trader followers count
  await supabase
    .from('master_traders')
    .update({
      total_followers: supabase.raw('total_followers - 1')
    })
    .eq('id', relationship.master_id);

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'STOP_COPY_TRADING',
    resource: 'copy_trading',
    details: { relationshipId, profit: relationship.total_profit },
    ip_address: req.ip
  });

  logger.info('Copy trading stopped', { userId, relationshipId });

  res.json({
    message: 'Successfully stopped copying trader',
    finalProfit: relationship.total_profit
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
      *,
      master:master_traders(*)
    `)
    .eq('copier_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.json({ relationships: data });
});

/**
 * Get copied trades history
 */
exports.getCopiedTrades = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;

  const { data, error } = await supabase
    .from('copied_trades')
    .select('*')
    .eq('copier_id', userId)
    .order('opened_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  res.json({ trades: data });
});

module.exports = exports;
