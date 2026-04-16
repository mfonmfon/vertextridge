# Admin Account Creation Guide

## What You Want
Create an admin account that can ONLY access the admin dashboard at `/admin/login` and NOT the regular user dashboard.

---

## Super Simple Steps

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Click on your project
3. Click "SQL Editor" on the left sidebar
4. Click "New query"

### Step 2: Copy This Code

Copy this ENTIRE block:

```sql
DO $$
DECLARE
  new_user_id UUID;
  admin_email TEXT := 'admin@vertexridgee.com';
  admin_password TEXT := 'Admin123!@#';
  admin_name TEXT := 'System Administrator';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    admin_email, crypt(admin_password, gen_salt('bf')), NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', admin_name, 'is_admin_only', true),
    NOW(), NOW(), '', '', '', ''
  ) RETURNING id INTO new_user_id;

  INSERT INTO admin_users (user_id, email, role, permissions)
  VALUES (
    new_user_id, admin_email, 'super_admin',
    '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true, "can_delete_users": true, "can_edit_settings": true}'::jsonb
  );

  RAISE NOTICE 'SUCCESS! Admin created: %', admin_email;
END $$;
```

### Step 3: Customize It

Change these 3 lines:
- Line 4: `admin_email TEXT := 'admin@vertexridgee.com';` → Your email
- Line 5: `admin_password TEXT := 'Admin123!@#';` → Your password
- Line 6: `admin_name TEXT := 'System Administrator';` → Your name

### Step 4: Run It

1. Paste the code into Supabase SQL Editor
2. Click "Run" (or press Ctrl+Enter)
3. You should see: "SUCCESS! Admin created: your-email@example.com"

### Step 5: Log In

1. Go to: https://vertexridgee.com/admin/login
2. Enter your email and password
3. You're in! 🎉

---

## What This Does

This creates an account that:
- ✅ CAN access `/admin/login` (admin dashboard)
- ❌ CANNOT access `/login` (regular user login)
- ❌ CANNOT access user dashboard
- ✅ Has full admin privileges

---

## Quick Examples

### Create admin@vertexridgee.com
```sql
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
    '{"provider":"email","providers":["email"]}', '{"full_name":"Admin","is_admin_only":true}',
    NOW(), NOW(), '', '', '', ''
  ) RETURNING id INTO new_user_id;
  
  INSERT INTO admin_users (user_id, email, role)
  VALUES (new_user_id, 'admin@vertexridgee.com', 'super_admin');
END $$;
```

### Create support@vertexridgee.com
```sql
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
    '{"provider":"email","providers":["email"]}', '{"full_name":"Support","is_admin_only":true}',
    NOW(), NOW(), '', '', '', ''
  ) RETURNING id INTO new_user_id;
  
  INSERT INTO admin_users (user_id, email, role)
  VALUES (new_user_id, 'support@vertexridgee.com', 'admin');
END $$;
```

---

## Useful Commands

### List all admins
```sql
SELECT 
  au.email,
  au.role,
  au.created_at,
  CASE WHEN p.id IS NULL THEN 'Admin-only' ELSE 'Has user profile' END as type
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id
LEFT JOIN profiles p ON p.id = au.user_id;
```

### Change password
```sql
UPDATE auth.users 
SET encrypted_password = crypt('NewPassword123!', gen_salt('bf'))
WHERE email = 'admin@vertexridgee.com';
```

### Delete admin
```sql
DELETE FROM admin_users WHERE email = 'admin@vertexridgee.com';
DELETE FROM auth.users WHERE email = 'admin@vertexridgee.com';
```

---

## Troubleshooting

### "relation admin_users does not exist"
Run the admin schema first:
1. Open `server/config/admin_schema.sql`
2. Copy all the SQL
3. Run it in Supabase SQL Editor

### Can't log in
- Make sure you're using `/admin/login` not `/login`
- Check your email and password are correct
- Verify admin was created: `SELECT * FROM admin_users WHERE email = 'your-email';`

### Still confused?
Tell me what email you want to use and I'll give you the exact SQL to run!

---

## Summary

1. Open Supabase SQL Editor
2. Copy the SQL code
3. Change email, password, and name
4. Run it
5. Log in at `/admin/login`

Done! 🎉
