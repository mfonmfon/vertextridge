const { supabase } = require('../config/supabase');
const Logger = require('../utils/logger');
const { asyncHandler, ApiError } = require('../utils/errorHandler');

const logger = new Logger('TRADE_CONTROLLER');

/**
 * Execute a trade (buy or sell) with atomic transactions
 */
exports.executeTrade = asyncHandler(async (req, res) => {
  const { asset, type, quantity, price } = req.body;
  const userId = req.user.id;

  if (!asset || !type || !quantity || !price) {
    throw new ApiError(400, 'Missing trade details', 'MISSING_DETAILS');
  }

  if (!['buy', 'sell'].includes(type)) {
    throw new ApiError(400, 'Invalid trade type', 'INVALID_TYPE');
  }

  const total = quantity * price;
  const fee = total * 0.001; // 0.1% trading fee
  const totalWithFee = type === 'buy' ? total + fee : total - fee;

  logger.info('Executing trade', { userId, asset: asset.id, type, quantity, price });

  // Start transaction-like operations
  if (type === 'buy') {
    // Deduct balance
    const { data: newBalance, error: balanceError } = await supabase
      .rpc('update_balance', {
        p_user_id: userId,
        p_amount: totalWithFee,
        p_operation: 'subtract'
      });

    if (balanceError) {
      if (balanceError.message.includes('Insufficient balance')) {
        throw new ApiError(400, 'Insufficient balance', 'INSUFFICIENT_FUNDS');
      }
      throw balanceError;
    }

    // Update or create holding
    const { data: currentHolding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('asset_id', asset.id)
      .single();

    if (currentHolding) {
      // Average up
      const totalQty = parseFloat(currentHolding.quantity) + parseFloat(quantity);
      const avgPrice = ((currentHolding.avg_buy_price * currentHolding.quantity) + total) / totalQty;
      
      await supabase
        .from('holdings')
        .update({ 
          quantity: totalQty, 
          avg_buy_price: avgPrice, 
          updated_at: new Date() 
        })
        .eq('id', currentHolding.id);
    } else {
      await supabase
        .from('holdings')
        .insert({
          user_id: userId,
          asset_id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          image: asset.image,
          quantity: parseFloat(quantity),
          avg_buy_price: price
        });
    }
  } else {
    // Sell: Check holdings first
    const { data: currentHolding } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('asset_id', asset.id)
      .single();

    if (!currentHolding || parseFloat(currentHolding.quantity) < parseFloat(quantity)) {
      throw new ApiError(400, 'Insufficient holdings to sell', 'INSUFFICIENT_HOLDINGS');
    }

    // Add balance
    await supabase.rpc('update_balance', {
      p_user_id: userId,
      p_amount: totalWithFee,
      p_operation: 'add'
    });

    // Update holdings
    const remainingQty = parseFloat(currentHolding.quantity) - parseFloat(quantity);
    if (remainingQty <= 0) {
      await supabase.from('holdings').delete().eq('id', currentHolding.id);
    } else {
      await supabase
        .from('holdings')
        .update({ quantity: remainingQty, updated_at: new Date() })
        .eq('id', currentHolding.id);
    }
  }

  // Record the trade
  const { data: tradeData, error: tradeErr } = await supabase
    .from('trades')
    .insert({
      user_id: userId,
      asset_id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      image: asset.image,
      type,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      total,
      fee,
      status: 'completed',
      timestamp: new Date()
    })
    .select()
    .single();

  if (tradeErr) throw tradeErr;

  // Get updated balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', userId)
    .single();

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: `TRADE_${type.toUpperCase()}`,
    resource: 'trade',
    details: { 
      assetId: asset.id, 
      symbol: asset.symbol,
      quantity, 
      price, 
      total,
      fee,
      tradeId: tradeData.id 
    },
    ip_address: req.ip
  });

  logger.info('Trade executed successfully', { 
    userId, 
    tradeId: tradeData.id, 
    type, 
    asset: asset.symbol 
  });

  res.status(200).json({
    message: 'Trade executed successfully',
    trade: tradeData,
    newBalance: profile.balance
  });
});

/**
 * Get user trade history with pagination
 */
exports.getTradeHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;

  const { data, error, count } = await supabase
    .from('trades')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  res.status(200).json({ 
    trades: data,
    total: count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

/**
 * Get user holdings with current values
 */
exports.getHoldings = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  res.status(200).json({ holdings: data });
});
