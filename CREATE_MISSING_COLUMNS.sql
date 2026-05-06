-- ═══════════════════════════════════════════════════════════════
-- CREATE MISSING COLUMNS FOR ADMIN UPDATES
-- Run this in Supabase SQL Editor to ensure all columns exist
-- ═══════════════════════════════════════════════════════════════

-- Add profit column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00;

-- Add total_holdings column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_holdings INTEGER DEFAULT 0;

-- Add portfolio_value column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(15, 2) DEFAULT 0.00;

-- Ensure balance column exists (it should already exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS balance DECIMAL(15, 2) DEFAULT 10000.00;

-- Add comments for clarity
COMMENT ON COLUMN profiles.profit IS 'User profit/loss - positive for profit, negative for loss';
COMMENT ON COLUMN profiles.total_holdings IS 'Total number of holdings/assets user has';
COMMENT ON COLUMN profiles.portfolio_value IS 'Total portfolio value including all holdings';
COMMENT ON COLUMN profiles.balance IS 'User cash balance';

-- Verify columns were created
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('profit', 'total_holdings', 'portfolio_value', 'balance')
ORDER BY column_name;