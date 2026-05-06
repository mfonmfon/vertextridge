-- ═══════════════════════════════════════════════════════════════
-- TEST ADMIN UPDATE FLOW
-- Run this step by step in Supabase SQL Editor to test the entire flow
-- ═══════════════════════════════════════════════════════════════

-- STEP 1: Create the required columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_holdings INTEGER DEFAULT 0;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(15, 2) DEFAULT 0.00;

-- STEP 2: Check if columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('profit', 'total_holdings', 'portfolio_value', 'balance')
ORDER BY column_name;

-- STEP 3: Find a test user (replace with actual user ID)
SELECT id, name, email, balance, profit, total_holdings, portfolio_value
FROM profiles 
LIMIT 5;

-- STEP 4: Manually update a user to test (replace USER_ID_HERE with actual ID)
-- UPDATE profiles 
-- SET 
--   balance = 15000.00,
--   profit = 2500.00,
--   total_holdings = 5,
--   portfolio_value = 17500.00,
--   updated_at = NOW()
-- WHERE id = 'USER_ID_HERE';

-- STEP 5: Verify the update worked
-- SELECT id, name, email, balance, profit, total_holdings, portfolio_value, updated_at
-- FROM profiles 
-- WHERE id = 'USER_ID_HERE';

-- STEP 6: Check all users with non-zero values
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
WHERE balance != 10000.00 OR profit != 0 OR total_holdings != 0 OR portfolio_value != 0
ORDER BY updated_at DESC;