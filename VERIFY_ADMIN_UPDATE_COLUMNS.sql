-- Verify that all required columns exist in the profiles table
-- Run this to ensure admin updates will work properly

-- Check if columns exist
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('balance', 'profit', 'total_holdings', 'portfolio_value')
ORDER BY column_name;

-- If any columns are missing, add them:

-- Add profit column if missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00;

-- Add total_holdings column if missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_holdings INTEGER DEFAULT 0;

-- Add portfolio_value column if missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(15, 2) DEFAULT 0.00;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('balance', 'profit', 'total_holdings', 'portfolio_value')
ORDER BY column_name;

-- Test query: View a sample user's data
SELECT 
    id,
    email,
    name,
    balance,
    profit,
    total_holdings,
    portfolio_value,
    updated_at
FROM profiles
LIMIT 5;
