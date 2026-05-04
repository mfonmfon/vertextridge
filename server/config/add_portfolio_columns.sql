-- Add portfolio and holdings columns to profiles table
-- This allows admins to set user portfolio metrics

-- Add total_holdings column (number of assets/trades)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_holdings INTEGER DEFAULT 0;

-- Add portfolio_value column (total portfolio value)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(15, 2) DEFAULT 0.00;

-- Add comments
COMMENT ON COLUMN profiles.total_holdings IS 'Total number of holdings/assets user has';
COMMENT ON COLUMN profiles.portfolio_value IS 'Total portfolio value including all holdings';
