-- Add profit column to profiles table
-- This allows admins to set user profit/loss

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00;

-- Add comment
COMMENT ON COLUMN profiles.profit IS 'User profit/loss - positive for profit, negative for loss';
