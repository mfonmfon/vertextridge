# 🚨 Quick Fix: Admin 401 Error

## Problem
Getting "401 Unauthorized" errors in admin panel after login.

## Solution (2 Minutes)

### Step 1: Create Admin User
Open **Supabase SQL Editor** and run:

```sql
DO $
DECLARE user_id_var UUID; user_email TEXT := 'YOUR_EMAIL@example.com';
BEGIN
  SELECT id INTO user_id_var FROM auth.users WHERE email = user_email;
  INSERT INTO admin_users (user_id, email, role, permissions)
  VALUES (user_id_var, user_email, 'super_admin', '{"can_edit_balances": true}'::jsonb)
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END $;
```

⚠️ Replace `YOUR_EMAIL@example.com` with your actual email!

### Step 2: Clear Cache
Open browser console (F12) and run:
```javascript
localStorage.clear()
```

### Step 3: Login
Go to `/admin/login` and login.

## Still Not Working?

Go to: **http://localhost:5173/admin/debug**

This page will diagnose the exact issue.

## Need Help?

Read: **ADMIN_TROUBLESHOOTING.md** (complete guide)
