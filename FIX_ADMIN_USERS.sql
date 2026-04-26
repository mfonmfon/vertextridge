-- ═══════════════════════════════════════════════════════════════
-- FIX ADMIN DASHBOARD - ENSURE ALL USERS SHOW UP
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to fix the admin dashboard

-- Step 1: Create profiles for all auth users who don't have them
INSERT INTO profiles (
  id,
  email,
  name,
  balance,
  kyc_status,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ) as name,
  50.00 as balance,
  'unverified' as kyc_status,
  false as onboarding_completed,
  u.created_at,
  NOW() as updated_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL 
  AND u.aud = 'authenticated'
  AND u.email NOT LIKE '%admin%'
  AND u.email_confirmed_at IS NOT NULL;

-- Step 2: Create a function to automatically sync users
CREATE OR REPLACE FUNCTION ensure_user_profiles()
RETURNS void AS $$
BEGIN
  INSERT INTO profiles (
    id, email, name, balance, kyc_status, created_at, updated_at
  )
  SELECT 
    u.id,
    u.email,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      split_part(u.email, '@', 1)
    ),
    50.00,
    'unverified',
    u.created_at,
    NOW()
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  WHERE p.id IS NULL 
    AND u.aud = 'authenticated'
    AND u.email NOT LIKE '%admin%'
    AND u.email_confirmed_at IS NOT NULL
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Update any profiles with missing data
UPDATE profiles 
SET 
  name = COALESCE(name, split_part(email, '@', 1)),
  balance = COALESCE(balance, 50.00),
  kyc_status = COALESCE(kyc_status, 'unverified'),
  updated_at = NOW()
WHERE name IS NULL OR name = '' OR balance IS NULL OR kyc_status IS NULL;

-- Step 4: Verify the fix
SELECT 
  'Total auth users' as type,
  COUNT(*) as count
FROM auth.users 
WHERE aud = 'authenticated' AND email NOT LIKE '%admin%'

UNION ALL

SELECT 
  'Total profiles' as type,
  COUNT(*) as count
FROM profiles

UNION ALL

SELECT 
  'Users with profiles' as type,
  COUNT(*) as count
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.aud = 'authenticated' AND u.email NOT LIKE '%admin%';

-- Step 5: Show sample users for verification
SELECT 
  p.id,
  p.email,
  p.name,
  p.balance,
  p.kyc_status,
  p.created_at,
  'Profile exists' as status
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 10;

-- Success message
SELECT 'Admin dashboard users fix completed successfully!' as message;