# How to Login as Admin - Simple Guide

## Important: There's NO Separate Admin Login!

Admins use the **same login page** as regular users. The only difference is that admin users can access `/admin/dashboard`.

---

## Step-by-Step: Login as Admin

### Step 1: Create Your Admin Account

If you haven't already, create a user account:

1. Go to: `http://localhost:5173/register`
2. Sign up with:
   - Email: `admin@example.com`
   - Password: `Admin123!`
   - Name: Admin User
   - Country: Any country

### Step 2: Make Yourself Admin in Database

1. Go to Supabase: https://app.supabase.com
2. Open your project
3. Click "SQL Editor"
4. Run this script:

```sql
DO $$
DECLARE
  user_id_var UUID;
BEGIN
  -- Get user ID
  SELECT id INTO user_id_var 
  FROM auth.users 
  WHERE email = 'admin@example.com';
  
  -- Make them admin
  INSERT INTO admin_users (user_id, email, role, permissions)
  VALUES (
    user_id_var,
    'admin@example.com',
    'super_admin',
    '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true}'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE 
  SET role = 'super_admin';
  
  RAISE NOTICE 'Admin created successfully!';
END $$;

-- Verify it worked
SELECT * FROM admin_users WHERE email = 'admin@example.com';
```

### Step 3: Login Using Regular Login Page

1. **Go to:** `http://localhost:5173/login`

2. **Enter your credentials:**
   - Email: `admin@example.com`
   - Password: `Admin123!`

3. **Click "Sign In"**

4. **You'll be redirected to the dashboard**

### Step 4: Access Admin Dashboard

After logging in, simply go to:

```
http://localhost:5173/admin/dashboard
```

Or:

```
http://localhost:5173/admin
```

**That's it!** You should now see the admin panel.

---

## Why This Way?

- **Simpler**: No separate admin login system to maintain
- **Secure**: Admin access is controlled by database, not by URL
- **Flexible**: Same user can be both regular user and admin

---

## Quick Test

1. **Login at:** `http://localhost:5173/login`
2. **Then go to:** `http://localhost:5173/admin/dashboard`
3. **You should see the admin panel!**

---

## Troubleshooting 401 Error

If you get a 401 (Unauthorized) error:

### Check 1: Are You Logged In?
- Open browser DevTools (F12)
- Go to Application tab → Local Storage
- Check if `tradz_session` exists
- If not, you need to login first

### Check 2: Is Your Session Valid?
```sql
-- Check if your user exists
SELECT * FROM auth.users WHERE email = 'admin@example.com';

-- Check if you're an admin
SELECT * FROM admin_users WHERE email = 'admin@example.com';
```

### Check 3: Clear Everything and Start Fresh

1. **Logout** (if logged in)
2. **Clear browser data:**
   - Press Ctrl+Shift+Delete
   - Clear "Cookies and site data"
   - Clear "Cached images and files"
3. **Login again** at `/login`
4. **Go to** `/admin/dashboard`

---

## The Flow

```
1. Sign Up (if new user)
   ↓
2. Run SQL to make yourself admin
   ↓
3. Login at /login (regular login page)
   ↓
4. Go to /admin/dashboard
   ↓
5. ✅ You're in the admin panel!
```

---

## Don't Use `/admin/login`

The `/admin/login` page exists but it's not necessary. Just use the regular login at `/login`.

---

## Summary

✅ **Use regular login:** `http://localhost:5173/login`  
✅ **Then access admin:** `http://localhost:5173/admin/dashboard`  
✅ **No separate admin login needed!**

The 401 error happens when you're not logged in or your session expired. Just login first, then access the admin dashboard.
