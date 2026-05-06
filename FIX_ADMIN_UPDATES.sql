-- Fix Admin Updates - Ensure all columns exist and are properly configured
-- Run this script in your Supabase SQL editor

-- 1. Add missing columns if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_holdings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(15, 2) DEFAULT 0.00;

-- 2. Verify columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('balance', 'profit', 'total_holdings', 'portfolio_value', 'updated_at')
ORDER BY column_name;

-- 3. Test update on a specific user (replace with actual user ID)
-- UPDATE profiles 
-- SET 
--   balance = 5000.00,
--   profit = 60.00,
--   total_holdings = 30,
--   portfolio_value = 5060.00,
--   updated_at = NOW()
-- WHERE email = 'test@example.com';

-- 4. Verify the update worked
-- SELECT id, email, balance, profit, total_holdings, portfolio_value, updated_at
-- FROM profiles
-- WHERE email = 'test@example.com';
