# Fix 401 Unauthorized Error in Admin Panel

## Problem
After logging in to the admin panel, you see these errors:
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
ApiError: Not authorized, invalid token
```

## Root Cause
The 401 error happens when:
1. You haven't created an admin user in the database yet, OR
2. The authentication token is invalid/expired, OR
3. The session is not being stored/sent correctly

## Solution

### Step 1: Verify You Have an Admin User

1. Go to your Supabase Dashboard
2. Click on "SQL Editor"
3. Run this query to check if you're an admin:

```sql
-- Check if your user is an admin
SELECT 
  au.email,
  au.role,
  au.permissions,
  u.email as auth_email
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id
WHERE au.email = 'YOUR_EMAIL_HERE';  -- Replace with your email
```

If this returns **no rows**, you need to create an admin user.

### Step 2: Create Admin User (If Needed)

Run this in Supabase SQL Editor:

```sql
-- Replace 'your-email@example.com' with your actual email
DO $
DECLARE
  user_id_var UUID;
  user_email TEXT := 'your-email@example.com';  -- CHANGE THIS TO YOUR EMAIL
BEGIN
  -- Get user ID
  SELECT id INTO user_id_var 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. Please sign up first at /signup!', user_email;
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
  
  RAISE NOTICE 'SUCCESS! Admin user created for: %', user_email;
END $;
```

### Step 3: Verify Admin User Was Created

```sql
-- Verify admin was created
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```

You should see a row with your email and role = 'super_admin'.

### Step 4: Clear Browser Storage and Login Again

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command:
```javascript
localStorage.clear()
```
4. Refresh the page
5. Login again at `/admin/login`

### Step 5: Check Console for Debug Messages

After logging in, check the browser console. You should see:

```
=== LOGIN RESPONSE DEBUG ===
Response status: 200
Has session: true
Session structure: { hasAccessToken: true, ... }

=== API CLIENT DEBUG ===
✓ Added auth header with token: eyJhbGc...
```

If you see `✗` (red X) instead of `✓` (green check), there's a session storage issue.

### Step 6: Check Server Logs

In your server terminal, you should see:

```
=== AUTH MIDDLEWARE DEBUG ===
Path: /admin/stats
Authorization header: Present
Token extracted: eyJhbGc...
Supabase auth result: { hasUser: true, userId: '...', email: '...' }
```

## Common Issues & Solutions

### Issue 1: "User not found" when creating admin
**Problem**: You haven't signed up yet
**Solution**: 
1. Go to `/signup` and create an account first
2. Then run the admin creation SQL

### Issue 2: Still getting 401 after creating admin user
**Problem**: Old session is cached
**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Logout and login again
3. Make sure you're logging in with the same email you made admin

### Issue 3: "Session exists but no access_token"
**Problem**: Session structure is wrong
**Solution**: This is a backend issue. Check that `/api/auth/login` returns:
```json
{
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_at": 1234567890
  }
}
```

### Issue 4: Token expires quickly
**Problem**: Supabase tokens expire after 1 hour by default
**Solution**: Implement token refresh logic (future enhancement)

## Quick Checklist

- [ ] I have signed up at `/signup`
- [ ] I ran the SQL to create admin user
- [ ] I verified admin user exists in database
- [ ] I cleared localStorage
- [ ] I logged in at `/admin/login` with the admin email
- [ ] I checked browser console for debug messages
- [ ] I checked server terminal for auth middleware logs

## Still Not Working?

If you've done all the above and still getting 401:

1. Copy all console output from browser DevTools
2. Copy all server terminal output
3. Run this query and share the result:
```sql
SELECT 
  u.id,
  u.email,
  au.role,
  au.permissions
FROM auth.users u
LEFT JOIN admin_users au ON au.user_id = u.id
WHERE u.email = 'your-email@example.com';
```

This will help identify the exact issue.
