-- Fix Admin RLS Policies
-- This allows admins to read all profiles

-- First, drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new policies that allow admins to see all profiles
-- Users can still only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Service role (admin) can view all profiles
CREATE POLICY "Service role can view all profiles" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role can update any profile
CREATE POLICY "Service role can update all profiles" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');
