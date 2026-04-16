# How to Create an Admin User

## Quick Overview
To create an admin user, you need to:
1. Sign up as a regular user first
2. Run SQL commands in Supabase to make that user an admin

---

## Step-by-Step Guide

### Step 1: Sign Up as a Regular User

1. Go to your website: https://vertexridgee.com/register
2. Sign up with the email you want to use as admin (e.g., `admin@vertexridgee.com`)
3. Complete the registration process
4. Verify your email if required

### Step 2: Access Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: `lieqzabrzhnjyoccjuia`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 3: Run the Admin Creation Script

Copy and paste this SQL script into the SQL Editor:

```sql
-- ═══════════════════════════════════════════════════════════════
-- CREATE ADMIN USER - AUTOMATIC SCRIPT
-- ═══════════════════════════════════════════════════════════════
-- Just replace the email and run!

DO $$
DECLARE
  user_id_var UUID;
  user_email TEXT := 'admin@vertexridgee.com';  -- CHANGE THIS TO YOUR EMAIL
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

-- Verify admin was created
SELECT 
  au.email,
  au.role,
  au.permissions,
  au.created_at
FROM admin_users au
WHERE au.email = 'admin@vertexridgee.com';  -- CHANGE THIS TO YOUR EMAIL
```

**IMPORTANT**: Replace `admin@vertexridgee.com` with your actual email address in TWO places:
- Line 9: `user_email TEXT := 'admin@vertexridgee.com';`
- Last line: `WHERE au.email = 'admin@vertexridgee.com';`

### Step 4: Run the Query

1. Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)
2. You should see a success message: `SUCCESS! Admin user created for: your-email@example.com`
3. The verification query at the bottom will show your admin details

### Step 5: Test Admin Access

1. Go to: https://vertexridgee.com/admin/login
2. Log in with your admin email and password
3. You should now have access to the admin dashboard!

---

## Alternative: Manual Method (If Automatic Fails)

If the automatic script doesn't work, use this manual method:

### Step 1: Find Your User ID

```sql
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'your-email@example.com';
```

Copy the `user_id` from the result.

### Step 2: Create Admin User

```sql
INSERT INTO admin_users (user_id, email, role, permissions)
VALUES (
  'PASTE_YOUR_USER_ID_HERE',  -- Replace with the UUID from step 1
  'your-email@example.com',   -- Replace with your email
  'super_admin',
  '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true, "can_delete_users": true, "can_edit_settings": true}'::jsonb
);
```

### Step 3: Verify

```sql
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```

---

## Admin Roles & Permissions

### Roles:
- **admin**: Regular admin with basic permissions
- **super_admin**: Full access to all features

### Permissions:
- `can_edit_balances`: Can modify user balances
- `can_manage_users`: Can view and manage users
- `can_view_analytics`: Can view analytics and reports
- `can_delete_users`: Can delete user accounts
- `can_edit_settings`: Can modify platform settings

---

## Useful Admin Commands

### List All Users
```sql
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

### List All Admins
```sql
SELECT * FROM admin_users ORDER BY created_at DESC;
```

### Remove Admin Privileges
```sql
DELETE FROM admin_users WHERE email = 'user@example.com';
```

### Change Admin Role
```sql
UPDATE admin_users 
SET role = 'admin'  -- or 'super_admin'
WHERE email = 'user@example.com';
```

### Update Admin Permissions
```sql
UPDATE admin_users 
SET permissions = '{"can_edit_balances": false, "can_manage_users": true, "can_view_analytics": true}'::jsonb
WHERE email = 'user@example.com';
```

---

## Troubleshooting

### Error: "User with email X not found"
**Solution**: Make sure you've signed up on the website first. The user must exist in `auth.users` before you can make them an admin.

### Error: "relation admin_users does not exist"
**Solution**: Run the admin schema SQL first:
1. Go to Supabase SQL Editor
2. Open the file: `server/config/admin_schema.sql`
3. Copy all the SQL
4. Paste and run it in Supabase SQL Editor

### Can't Access Admin Dashboard
**Solution**: 
1. Verify admin was created: `SELECT * FROM admin_users WHERE email = 'your-email@example.com';`
2. Clear browser cache and cookies
3. Try logging out and logging back in
4. Check browser console for errors (F12)

### Admin Login Shows "Unauthorized"
**Solution**: 
1. Make sure you're using the correct email and password
2. Verify the admin exists in the database
3. Check that the `user_id` in `admin_users` matches the `id` in `auth.users`

---

## Security Best Practices

1. **Use a Strong Password**: Admin accounts should have very strong passwords
2. **Use a Dedicated Email**: Consider using a separate email for admin access
3. **Limit Super Admins**: Only give super_admin role to trusted individuals
4. **Monitor Activity**: Regularly check `admin_activity_logs` table
5. **Enable 2FA**: Consider implementing two-factor authentication for admin accounts

---

## Quick Examples

### Create admin@vertexridgee.com as Super Admin
```sql
DO $$
DECLARE user_id_var UUID;
BEGIN
  SELECT id INTO user_id_var FROM auth.users WHERE email = 'admin@vertexridgee.com';
  INSERT INTO admin_users (user_id, email, role) 
  VALUES (user_id_var, 'admin@vertexridgee.com', 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END $$;
```

### Create support@vertexridgee.com as Regular Admin
```sql
DO $$
DECLARE user_id_var UUID;
BEGIN
  SELECT id INTO user_id_var FROM auth.users WHERE email = 'support@vertexridgee.com';
  INSERT INTO admin_users (user_id, email, role) 
  VALUES (user_id_var, 'support@vertexridgee.com', 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
END $$;
```

---

## Summary

1. Sign up on the website with your desired admin email
2. Go to Supabase SQL Editor
3. Run the automatic admin creation script (replace the email)
4. Verify the admin was created
5. Log in to the admin dashboard

That's it! You now have admin access to your platform.
