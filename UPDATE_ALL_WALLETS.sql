-- ═══════════════════════════════════════════════════════════════
-- UPDATE ALL USER WALLETS TO USE SINGLE BITCOIN ADDRESS
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. Delete all existing wallet addresses
DELETE FROM wallet_addresses;

-- 2. Insert the single Bitcoin wallet for all existing users
INSERT INTO wallet_addresses (user_id, currency, network, address, label, is_active)
SELECT 
  id as user_id,
  'BTC' as currency,
  'Bitcoin' as network,
  'bc1q8mnrq2866x49ec6y0r22t2kfm9044svwzlmy0h' as address,
  'Bitcoin Wallet' as label,
  true as is_active
FROM profiles
ON CONFLICT (user_id, currency, network) 
DO UPDATE SET 
  address = 'bc1q8mnrq2866x49ec6y0r22t2kfm9044svwzlmy0h',
  is_active = true,
  updated_at = NOW();

-- 3. Verify the update
SELECT 
  COUNT(*) as total_users_with_wallet,
  COUNT(DISTINCT address) as unique_addresses
FROM wallet_addresses;

-- Should show: total_users_with_wallet = (number of users), unique_addresses = 1
