-- ═══════════════════════════════════════════════════════════════
-- VERIFY ADMIN UPDATES ARE WORKING
-- Run this in Supabase SQL Editor to check if admin updates are saved
-- ═══════════════════════════════════════════════════════════════

-- 1. Check if the required columns exist in profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('profit', 'total_holdings', 'portfolio_value', 'balance')
ORDER BY column_name;

-- 2. Check current user data to see if admin updates are being saved
SELECT 
  id,
  name,
  email,
  balance,
  profit,
  total_holdings,
  portfolio_value,
  updated_at
FROM profiles 
WHERE balance > 0 OR profit != 0 OR total_holdings > 0 OR portfolio_value > 0
ORDER BY updated_at DESC
LIMIT 10;


-- 3. Check a specific user (replace 'USER_ID_HERE' with actual user ID)
-- SELECT 
--   id,
--   name,
--   email,
--   balance,
--   profit,
--   total_holdings,
--   portfolio_value,
--   updated_at
-- FROM profiles 
-- WHERE id = 'USER_ID_HERE';
