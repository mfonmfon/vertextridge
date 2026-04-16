-- ═══════════════════════════════════════════════════════════════
-- CREATE ADMIN-ONLY ACCOUNT
-- ═══════════════════════════════════════════════════════════════
-- This creates an admin account that can ONLY access the admin dashboard
-- and NOT the regular user dashboard
--
-- USAGE:
-- 1. Replace 'admin@vertexridgee.com' with your desired admin email
-- 2. Replace 'YourSecurePassword123!' with your desired password
-- 3. Run this entire script in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  new_user_id UUID;
  admin_email TEXT := 'admin@vertexridgee.com';  -- CHANGE THIS
  admin_password TEXT := 'YourSecurePassword123!';  -- CHANGE THIS
  admin_name TEXT := 'System Administrator';  -- CHANGE THIS
BEGIN
  -- Step 1: Create auth user (this creates the login credentials)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', admin_name, 'is_admin_only', true),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Step 2: Create admin user record
  INSERT INTO admin_users (
    user_id,
    email,
    role,
    permissions
  ) VALUES (
    new_user_id,
    admin_email,
    'super_admin',
    '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true, "can_delete_users": true, "can_edit_settings": true}'::jsonb
  );

  -- Step 3: Mark this user as admin-only (no regular profile)
  -- We intentionally DO NOT create a profile for this user
  -- This prevents them from accessing the regular user dashboard

  RAISE NOTICE '✓ SUCCESS! Admin-only account created';
  RAISE NOTICE 'Email: %', admin_email;
  RAISE NOTICE 'User ID: %', new_user_id;
  RAISE NOTICE 'This account can ONLY access /admin/login';
  RAISE NOTICE 'It CANNOT access the regular user dashboard';
END $$;

-- ═══════════════════════════════════════════════════════════════
-- VERIFY ADMIN WAS CREATED
-- ═══════════════════════════════════════════════════════════════

SELECT 
  au.email,
  au.role,
  au.permissions,
  au.created_at,
  u.email_confirmed_at,
  CASE 
    WHEN p.id IS NULL THEN 'Admin-only (No user profile)'
    ELSE 'Has user profile'
  END as account_type
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id
LEFT JOIN profiles p ON p.id = au.user_id
WHERE au.email = 'admin@vertexridgee.com'  -- CHANGE THIS TO MATCH YOUR EMAIL
ORDER BY au.created_at DESC;

-- ═══════════════════════════════════════════════════════════════
-- QUICK EXAMPLES FOR DIFFERENT ADMIN EMAILS
-- ═══════════════════════════════════════════════════════════════

-- Example 1: Create admin@vertexridgee.com
/*
DO $$
DECLARE new_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    'admin@vertexridgee.com', crypt('Admin123!@#', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin","is_admin_only":true}',
    NOW(), NOW(), '', '', '', ''
  ) RETURNING id INTO new_user_id;
  
  INSERT INTO admin_users (user_id, email, role)
  VALUES (new_user_id, 'admin@vertexridgee.com', 'super_admin');
  
  RAISE NOTICE 'Admin created: admin@vertexridgee.com';
END $$;
*/

-- Example 2: Create support@vertexridgee.com
/*
DO $$
DECLARE new_user_id UUID;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    'support@vertexridgee.com', crypt('Support123!@#', gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Support Team","is_admin_only":true}',
    NOW(), NOW(), '', '', '', ''
  ) RETURNING id INTO new_user_id;
  
  INSERT INTO admin_users (user_id, email, role)
  VALUES (new_user_id, 'support@vertexridgee.com', 'admin');
  
  RAISE NOTICE 'Admin created: support@vertexridgee.com';
END $$;
*/

-- ═══════════════════════════════════════════════════════════════
-- USEFUL ADMIN MANAGEMENT QUERIES
-- ═══════════════════════════════════════════════════════════════

-- List all admin accounts
SELECT 
  au.email,
  au.role,
  au.created_at,
  CASE 
    WHEN p.id IS NULL THEN 'Admin-only'
    ELSE 'Has user profile'
  END as account_type
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id
LEFT JOIN profiles p ON p.id = au.user_id
ORDER BY au.created_at DESC;

-- Delete an admin account
/*
DELETE FROM admin_users WHERE email = 'admin@example.com';
DELETE FROM auth.users WHERE email = 'admin@example.com';
*/

-- Change admin password
/*
UPDATE auth.users 
SET encrypted_password = crypt('NewPassword123!', gen_salt('bf'))
WHERE email = 'admin@vertexridgee.com';
*/

-- Change admin role
/*
UPDATE admin_users 
SET role = 'super_admin'  -- or 'admin'
WHERE email = 'admin@vertexridgee.com';
*/

-- ═══════════════════════════════════════════════════════════════
-- NOTES
-- ═══════════════════════════════════════════════════════════════
-- 
-- ADMIN-ONLY ACCOUNTS:
-- - Can log in at /admin/login
-- - CANNOT log in at /login (regular user login)
-- - CANNOT access user dashboard
-- - Have NO profile in the profiles table
-- - Have admin_users record only
--
-- REGULAR USERS WHO ARE ALSO ADMINS:
-- - Can log in at both /login and /admin/login
-- - Can access both dashboards
-- - Have BOTH profile and admin_users records
--
-- To convert a regular user to admin:
-- INSERT INTO admin_users (user_id, email, role)
-- SELECT id, email, 'super_admin' FROM auth.users WHERE email = 'user@example.com';
--
-- ═══════════════════════════════════════════════════════════════
