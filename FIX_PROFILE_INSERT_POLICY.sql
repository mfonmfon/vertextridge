-- Fix for profile creation during email signup
-- Add missing INSERT policy for profiles table

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);