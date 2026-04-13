-- ═══════════════════════════════════════════════════════════════
-- CREATE ADMIN USER - Quick Setup Script
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor after creating a user account
-- Replace 'your-email@example.com' with your actual email

-- STEP 1: Find your user ID (check the result)
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'your-email@example.com';

-- STEP 2: Make yourself an admin (copy the user_id from above)
-- Replace 'PASTE_USER_ID_HERE' with the actual UUID from step 1
INSERT INTO admin_users (user_id, email, role, permissions)
VALUES (
  'PASTE_USER_ID_HERE',  -- Replace this with your user ID
  'your-email@example.com',  -- Replace with your email
  'super_admin',
  '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true, "can_delete_users": true, "can_edit_settings": true}'::jsonb
)
ON CONFLICT (user_id) DO UPDATE 
SET role = 'super_admin',
    permissions = '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true, "can_delete_users": true, "can_edit_settings": true}'::jsonb;

-- STEP 3: Verify admin was created
SELECT 
  au.email,
  au.role,
  au.permissions,
  au.created_at,
  u.email as auth_email
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id
WHERE au.email = 'your-email@example.com';

-- ═══════════════════════════════════════════════════════════════
-- ALTERNATIVE: Automatic Script (No manual ID copy needed)
-- ═══════════════════════════════════════════════════════════════
-- Just replace the email and run this entire block:

DO $$
DECLARE
  user_id_var UUID;
  user_email TEXT := 'your-email@example.com';  -- CHANGE THIS
BEGIN
  -- Get user ID
  SELECT id INTO user_id_var 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. Please sign up first!', user_email;
  END IF;
  
  -- Create admin user
  INSERT INTO admin_users (user_id, email, role, permissions)
  VALUES (
    user_id_var,
    user_email,
    'super_admin',
    '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true, "can_delete_users": true, "can_edit_settings": true}'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE 
  SET role = 'super_admin',
      permissions = '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true, "can_delete_users": true, "can_edit_settings": true}'::jsonb;
  
  RAISE NOTICE 'SUCCESS! Admin user created for: % (ID: %)', user_email, user_id_var;
END $$;

-- Verify
SELECT * FROM admin_users WHERE email = 'your-email@example.com';

-- ═══════════════════════════════════════════════════════════════
-- QUICK EXAMPLES
-- ═══════════════════════════════════════════════════════════════

-- Example 1: Make admin@example.com an admin
DO $$
DECLARE user_id_var UUID;
BEGIN
  SELECT id INTO user_id_var FROM auth.users WHERE email = 'admin@example.com';
  INSERT INTO admin_users (user_id, email, role) 
  VALUES (user_id_var, 'admin@example.com', 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END $$;

-- Example 2: Make test@test.com an admin
DO $$
DECLARE user_id_var UUID;
BEGIN
  SELECT id INTO user_id_var FROM auth.users WHERE email = 'test@test.com';
  INSERT INTO admin_users (user_id, email, role) 
  VALUES (user_id_var, 'test@test.com', 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END $$;

-- ═══════════════════════════════════════════════════════════════
-- USEFUL QUERIES
-- ═══════════════════════════════════════════════════════════════

-- List all users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- List all admins
SELECT * FROM admin_users ORDER BY created_at DESC;

-- Remove admin privileges
DELETE FROM admin_users WHERE email = 'user@example.com';

-- Change admin role
UPDATE admin_users 
SET role = 'admin'  -- or 'super_admin'
WHERE email = 'user@example.com';
