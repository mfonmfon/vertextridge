const { supabase } = require('../config/supabase');
const Logger = require('../utils/logger');
const { asyncHandler, ApiError } = require('../utils/errorHandler');

const logger = new Logger('FINANCE_CONTROLLER');

/**
 * Record a deposit and update balance with transaction safety
 */
exports.deposit = asyncHandler(async (req, res) => {
  const { amount, method = 'bank' } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    throw new ApiError(400, 'Invalid deposit amount', 'INVALID_AMOUNT');
  }

  if (amount > 1000000) {
    throw new ApiError(400, 'Deposit amount exceeds maximum limit', 'AMOUNT_TOO_LARGE');
  }

  logger.info('Processing deposit', { userId, amount, method });

  // Use database function for atomic balance update
  const { data: newBalance, error: balanceError } = await supabase
    .rpc('update_balance', {
      p_user_id: userId,
      p_amount: parseFloat(amount),
      p_operation: 'add'
    });

  if (balanceError) throw balanceError;

  // Insert transaction record
  const { data: transaction, error: txErr } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'deposit',
      amount: parseFloat(amount),
      method: method,
      status: 'completed',
      timestamp: new Date()
    })
    .select()
    .single();

  if (txErr) throw txErr;

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'DEPOSIT',
    resource: 'finance',
    details: { amount, method, transactionId: transaction.id },
    ip_address: req.ip
  });

  logger.info('Deposit successful', { userId, amount, newBalance });

  res.status(200).json({
    message: 'Deposit successful',
    transaction,
    newBalance
  });
});

/**
 * Record a withdrawal and update balance with validation
 */
exports.withdraw = asyncHandler(async (req, res) => {
  const { amount, method = 'bank' } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    throw new ApiError(400, 'Invalid withdrawal amount', 'INVALID_AMOUNT');
  }

  logger.info('Processing withdrawal', { userId, amount, method });

  // Use database function for atomic balance update (will throw if insufficient)
  const { data: newBalance, error: balanceError } = await supabase
    .rpc('update_balance', {
      p_user_id: userId,
      p_amount: parseFloat(amount),
      p_operation: 'subtract'
    });

  if (balanceError) {
    if (balanceError.message.includes('Insufficient balance')) {
      throw new ApiError(400, 'Insufficient funds', 'INSUFFICIENT_FUNDS');
    }
    throw balanceError;
  }

  // Insert transaction record
  const { data: transaction, error: txErr } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'withdrawal',
      amount: parseFloat(amount),
      method: method,
      status: 'completed',
      timestamp: new Date()
    })
    .select()
    .single();

  if (txErr) throw txErr;

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'WITHDRAWAL',
    resource: 'finance',
    details: { amount, method, transactionId: transaction.id },
    ip_address: req.ip
  });

  logger.info('Withdrawal successful', { userId, amount, newBalance });

  res.status(200).json({
    message: 'Withdrawal successful',
    transaction,
    newBalance
  });
});

/**
 * Handle transfer with validation
 */
exports.transfer = asyncHandler(async (req, res) => {
  const { recipient, amount, note } = req.body;
  const userId = req.user.id;

  if (!recipient || !amount || amount <= 0) {
    throw new ApiError(400, 'Invalid transfer details', 'INVALID_TRANSFER');
  }

  if (recipient === userId) {
    throw new ApiError(400, 'Cannot transfer to yourself', 'SELF_TRANSFER');
  }

  logger.info('Processing transfer', { userId, recipient, amount });

  // Use database function for atomic balance update
  const { data: newBalance, error: balanceError } = await supabase
    .rpc('update_balance', {
      p_user_id: userId,
      p_amount: parseFloat(amount),
      p_operation: 'subtract'
    });

  if (balanceError) {
    if (balanceError.message.includes('Insufficient balance')) {
      throw new ApiError(400, 'Insufficient balance', 'INSUFFICIENT_FUNDS');
    }
    throw balanceError;
  }

  // Record transaction
  const { data: transaction, error: txErr } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: 'transfer',
      amount: parseFloat(amount),
      method: 'wallet',
      recipient: recipient,
      status: 'completed',
      metadata: { note },
      timestamp: new Date()
    })
    .select()
    .single();

  if (txErr) throw txErr;

  // Audit log
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'TRANSFER',
    resource: 'finance',
    details: { amount, recipient, transactionId: transaction.id },
    ip_address: req.ip
  });

  logger.info('Transfer successful', { userId, recipient, amount });

  res.status(200).json({
    message: 'Transfer successful',
    transaction,
    newBalance
  });
});

/**
 * Return bank transfer details from env config.
 * Includes a unique reference code per user so deposits can be matched.
 */
exports.getBankDetails = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Generate a short unique reference from user ID so you can match the deposit
  const ref = `${process.env.BANK_REFERENCE_PREFIX || 'DEP'}-${userId.slice(0, 8).toUpperCase()}`;

  res.json({
    accountName: process.env.BANK_ACCOUNT_NAME || 'TradZ Financial Ltd',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '',
    routingNumber: process.env.BANK_ROUTING_NUMBER || '',
    swiftCode: process.env.BANK_SWIFT_CODE || '',
    iban: process.env.BANK_IBAN || '',
    bankName: process.env.BANK_NAME || '',
    branch: process.env.BANK_BRANCH || '',
    reference: ref,
    note: `You MUST include reference code "${ref}" in your transfer so we can identify your deposit.`,
  });
});

/**
 * Addresses are defined in .env as a comma-separated list and rotate
 * via a pointer stored in the database so every request gets the same
 * address until it is marked used.
 */
exports.getCryptoAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Pull address pool from env  e.g.  CRYPTO_WALLETS=addr1::BTC,addr2::ETH
  const raw = process.env.CRYPTO_WALLETS || '';
  const wallets = raw
    .split(',')
    .map(w => w.trim())
    .filter(Boolean)
    .map(w => {
      const [address, network] = w.split('::');
      return { address: address?.trim(), network: network?.trim() || 'BTC' };
    })
    .filter(w => w.address);

  if (wallets.length === 0) {
    // Fallback demo address so the UI always works during development
    return res.json({
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      network: 'Bitcoin (BTC)',
      note: 'Send only BTC to this address. Minimum deposit: $10.',
    });
  }

  // Fetch or create a pointer row for this user
  const { data: ptr } = await supabase
    .from('crypto_address_pointers')
    .select('wallet_index')
    .eq('user_id', userId)
    .maybeSingle();

  const idx = ptr ? ptr.wallet_index % wallets.length : 0;
  const wallet = wallets[idx];

  logger.info('Serving crypto deposit address', { userId, idx, network: wallet.network });

  res.json({
    address: wallet.address,
    network: wallet.network,
    note: `Send only ${wallet.network} to this address. Minimum deposit: $10.`,
  });
});

/**
 * Mark the current crypto address as used and rotate to the next one.
 * Called automatically after a user confirms they've sent payment.
 */
exports.rotateCryptoAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const raw = process.env.CRYPTO_WALLETS || '';
  const total = raw.split(',').filter(Boolean).length || 1;

  const { data: ptr } = await supabase
    .from('crypto_address_pointers')
    .select('wallet_index')
    .eq('user_id', userId)
    .maybeSingle();

  const nextIdx = ptr ? (ptr.wallet_index + 1) % total : 1;

  await supabase
    .from('crypto_address_pointers')
    .upsert({ user_id: userId, wallet_index: nextIdx }, { onConflict: 'user_id' });

  logger.info('Rotated crypto address', { userId, nextIdx });

  res.json({ success: true });
});


exports.getTransactions = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;

  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  res.status(200).json({ 
    transactions: data,
    total: count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});
