# Admin Authentication Debugging Guide

## Current Issue
Getting 401 Unauthorized errors when accessing admin endpoints after login.

## Debug Steps

### Step 1: Login and Check Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/admin/login`
4. Enter admin credentials and login
5. Check console for these debug messages:

```
=== LOGIN RESPONSE DEBUG ===
Response status: 200
Response OK: true
Data keys: [...]
Has session: true
Has user: true
Session keys: [...]
Session structure: { hasAccessToken: true, ... }
```

### Step 2: Verify Session Storage
After login, in the Console tab, run:
```javascript
JSON.parse(localStorage.getItem('tradz_session'))
```

You should see an object with:
- `access_token`: A long JWT string
- `refresh_token`: Another JWT string
- `expires_at`: Timestamp
- `expires_in`: Number (usually 3600)
- `token_type`: "bearer"

### Step 3: Check API Calls
When the admin dashboard loads, check console for:
```
=== API CLIENT DEBUG ===
Endpoint: /admin/stats
Session string exists: true
Parsed session keys: [...]
✓ Added auth header with token: eyJhbGc...
```

### Step 4: Check Backend Logs
In your server terminal, you should see:
```
=== AUTH MIDDLEWARE DEBUG ===
Path: /admin/stats
Authorization header: Present
Token extracted: eyJhbGc...
Supabase auth result: { hasUser: true, userId: '...', email: '...' }
```

## Common Issues

### Issue 1: No access_token in session
**Symptom**: Console shows `Session exists but no access_token`
**Solution**: The login response structure is wrong. Check backend `/api/auth/login` response.

### Issue 2: Token not being sent
**Symptom**: Backend shows `Authorization header: Missing`
**Solution**: Session storage is not working. Clear localStorage and login again.

### Issue 3: Invalid token
**Symptom**: Backend shows `Invalid token attempt`
**Solution**: Token might be expired or malformed. Check token expiry time.

### Issue 4: User not admin
**Symptom**: 403 Forbidden instead of 401
**Solution**: User exists but is not in `admin_users` table. Run admin setup SQL.

## Quick Fix Commands

### Clear all sessions and try again:
```javascript
localStorage.clear()
location.reload()
```

### Check if admin user exists in database:
```sql
SELECT * FROM admin_users WHERE user_id = 'YOUR_USER_ID';
```

### Create admin user if missing:
```sql
-- First, get your user ID from profiles table
SELECT id, email FROM profiles WHERE email = 'your-admin@email.com';

-- Then insert into admin_users
INSERT INTO admin_users (user_id, email, role, permissions)
VALUES ('YOUR_USER_ID', 'your-admin@email.com', 'super_admin', '["all"]');
```

## Next Steps
1. Follow the debug steps above
2. Copy the console output
3. Share the output to identify the exact issue
