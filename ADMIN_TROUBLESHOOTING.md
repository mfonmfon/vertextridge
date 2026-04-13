# Admin Panel 401 Error - Complete Troubleshooting Guide

## Quick Summary
You're getting 401 Unauthorized errors in the admin panel. This guide will help you fix it in 5 minutes.

---

## 🚀 Quick Fix (Most Common Solution)

### Step 1: Create Admin User in Database

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this SQL (replace the email with yours):

```sql
DO $
DECLARE
  user_id_var UUID;
  user_email TEXT := 'YOUR_EMAIL@example.com';  -- ⚠️ CHANGE THIS
BEGIN
  SELECT id INTO user_id_var 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'User not found. Sign up at /signup first!';
  END IF;
  
  INSERT INTO admin_users (user_id, email, role, permissions)
  VALUES (
    user_id_var,
    user_email,
    'super_admin',
    '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true, "can_delete_users": true, "can_edit_settings": true}'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE 
  SET role = 'super_admin';
  
  RAISE NOTICE 'SUCCESS! Admin user created';
END $;
```

3. Click **Run**
4. You should see: `SUCCESS! Admin user created`

### Step 2: Clear Browser Cache & Login

1. Open browser DevTools (press **F12**)
2. Go to **Console** tab
3. Type this and press Enter:
```javascript
localStorage.clear()
```
4. Go to `/admin/login` and login with the email you used above

### Step 3: Verify It Works

After login, you should be redirected to `/admin/dashboard` without errors.

---

## 🔍 Diagnostic Tool

If the quick fix didn't work, use our diagnostic tool:

1. Go to: `http://localhost:5173/admin/debug`
2. It will show you exactly what's wrong:
   - ✅ Session exists
   - ✅ Access token present
   - ✅ Token is valid
   - ✅ User is admin

3. Follow the recommendations shown on that page

---

## 📋 Detailed Troubleshooting

### Issue 1: "User not found" Error

**Symptom**: SQL says "User not found"

**Solution**:
1. You haven't signed up yet
2. Go to `/signup` and create an account
3. Then run the SQL again

---

### Issue 2: Still Getting 401 After Creating Admin

**Symptom**: Created admin user but still see 401 errors

**Possible Causes**:

#### A. Wrong Email
You're logging in with a different email than the one you made admin.

**Solution**: 
```sql
-- Check which email is admin
SELECT email, role FROM admin_users;
```
Login with that exact email.

#### B. Old Session Cached
Your browser has an old session.

**Solution**:
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
// Then login again
```

#### C. Token Expired
Tokens expire after 1 hour.

**Solution**: Just logout and login again.

---

### Issue 3: Console Shows "Session exists but no access_token"

**Symptom**: Browser console shows session but no token

**Solution**: This is a backend issue. Check:

1. Is your backend running? (`npm run dev` in server folder)
2. Check backend logs for errors
3. Verify `/api/auth/login` endpoint is working:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

Should return:
```json
{
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "...",
    "expires_at": 1234567890
  }
}
```

---

### Issue 4: Backend Shows "Authorization header: Missing"

**Symptom**: Server logs show no auth header

**Solution**: Frontend is not sending the token.

1. Check browser console for API client debug messages
2. Verify session is stored:
```javascript
JSON.parse(localStorage.getItem('tradz_session'))
```
3. Should show `access_token` field

---

## 🛠️ Advanced Debugging

### Check Everything is Set Up

Run these SQL queries in Supabase:

```sql
-- 1. Check if admin_users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'admin_users'
);
-- Should return: true

-- 2. Check if you have any admin users
SELECT * FROM admin_users;
-- Should show at least one row

-- 3. Check if your user exists in auth
SELECT id, email, created_at FROM auth.users 
WHERE email = 'your@email.com';
-- Should show your user

-- 4. Check if your user is linked to admin
SELECT 
  u.email as user_email,
  au.email as admin_email,
  au.role,
  au.permissions
FROM auth.users u
LEFT JOIN admin_users au ON au.user_id = u.id
WHERE u.email = 'your@email.com';
-- Should show role = 'super_admin'
```

### Check Backend Logs

When you try to access admin panel, your server terminal should show:

```
=== AUTH MIDDLEWARE DEBUG ===
Path: /admin/stats
Authorization header: Present
Token extracted: eyJhbGc...
Supabase auth result: { hasUser: true, userId: '...', email: '...' }
```

If you see:
- `Authorization header: Missing` → Frontend not sending token
- `Invalid token attempt` → Token is wrong/expired
- No logs at all → Backend not running or wrong URL

### Check Frontend Logs

Browser console should show:

```
=== LOGIN RESPONSE DEBUG ===
Response status: 200
Has session: true
Session structure: { hasAccessToken: true }

=== API CLIENT DEBUG ===
✓ Added auth header with token: eyJhbGc...
```

If you see:
- `✗ No session found` → Login failed or session not stored
- `✗ Session exists but no access_token` → Backend response wrong
- No logs → Check if you're on the right page

---

## 📝 Checklist

Before asking for help, verify:

- [ ] Backend is running (`npm run dev` in server folder)
- [ ] Frontend is running (`npm run dev` in root folder)
- [ ] Database tables exist (run `server/config/admin_schema.sql`)
- [ ] I have signed up at `/signup`
- [ ] I ran the SQL to create admin user
- [ ] I used the correct email in the SQL
- [ ] I cleared localStorage
- [ ] I logged in with the admin email
- [ ] I checked `/admin/debug` page
- [ ] I checked browser console for errors
- [ ] I checked server terminal for errors

---

## 🆘 Still Not Working?

If you've tried everything above:

1. Go to `/admin/debug`
2. Take a screenshot
3. Copy browser console output
4. Copy server terminal output
5. Run this SQL and copy result:
```sql
SELECT 
  u.id, u.email, u.created_at,
  au.role, au.permissions
FROM auth.users u
LEFT JOIN admin_users au ON au.user_id = u.id
WHERE u.email = 'your@email.com';
```

Share all of the above to get help.

---

## 📚 Related Files

- `CREATE_ADMIN_USER.sql` - SQL scripts to create admin users
- `ADMIN_401_FIX.md` - Detailed fix guide
- `ADMIN_AUTH_DEBUG.md` - Debug steps
- `/admin/debug` - Diagnostic tool page
- `server/config/admin_schema.sql` - Database schema

---

## 🎯 Expected Behavior

When everything works correctly:

1. Login at `/admin/login` → Redirects to `/admin/dashboard`
2. Dashboard loads with stats, users, and charts
3. No 401 errors in console
4. Can navigate to Users, Settings, Logs pages
5. Can edit user balances, KYC status, platform settings

If you see this, you're all set! 🎉
