-- COMPLETE FIX FOR ADMIN UPDATES
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: Ensure all columns exist
-- ============================================

-- Add profit column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00;

-- Add total_holdings column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_holdings INTEGER DEFAULT 0;

-- Add portfolio_value column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(15, 2) DEFAULT 0.00;

-- Ensure updated_at exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- STEP 2: Verify columns exist
-- ============================================

SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('balance', 'profit', 'total_holdings', 'portfolio_value', 'updated_at')
ORDER BY column_name;

-- ============================================
-- STEP 3: Fix RLS Policies
-- ============================================

-- Drop existing policies that might be blocking updates
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can only update certain fields" ON profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create new comprehensive policies

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- CRITICAL: Allow service role (used by admin) to do everything
CREATE POLICY "Service role full access"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON profiles TO service_role;
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- ============================================
-- STEP 4: Verify policies are correct
-- ============================================

SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- STEP 5: Test update (UNCOMMENT AND MODIFY)
-- ============================================

-- Replace 'user@example.com' with actual user email to test
/*
UPDATE profiles 
SET 
  balance = 5000.00,
  profit = 60.00,
  total_holdings = 30,
  portfolio_value = 5060.00,
  updated_at = NOW()
WHERE email = 'user@example.com';

-- Verify the update
SELECT 
    id, 
    email, 
    balance, 
    profit, 
    total_holdings, 
    portfolio_value, 
    updated_at
FROM profiles
WHERE email = 'user@example.com';
*/

-- ============================================
-- STEP 6: Check for any users with updates
-- ============================================

SELECT 
    id,
    email,
    name,
    balance,
    profit,
    total_holdings,
    portfolio_value,
    updated_at,
    created_at
FROM profiles
ORDER BY updated_at DESC
LIMIT 10;

-- ============================================
-- STEP 7: Diagnostic - Check if columns have data
-- ============================================

SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN profit != 0 THEN 1 END) as users_with_profit,
    COUNT(CASE WHEN total_holdings != 0 THEN 1 END) as users_with_holdings,
    COUNT(CASE WHEN portfolio_value != 0 THEN 1 END) as users_with_portfolio
FROM profiles;
