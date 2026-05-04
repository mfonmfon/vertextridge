# Copy Trading Authentication Fix

## Problem
When clicking "Start Copying", you get logged out immediately with error "Not authorized, no token provided".

## Root Cause
The backend middleware (`protect`) expects a valid Supabase JWT token, but the session might not have one or it's invalid.

## Solution Steps

### Step 1: Check Your Login Method
Open browser console (F12) and run:
```javascript
const session = JSON.parse(localStorage.getItem('tradz_session'));
console.log('Session keys:', Object.keys(session));
console.log('Has access_token:', !!session.access_token);
console.log('Token preview:', session.access_token?.substring(0, 50));
```

### Step 2: If No Token or Invalid Token
You need to **logout and login again** to get a fresh token:
1. Click Logout
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again with email/password (NOT Google OAuth for now)
4. Try "Start Copying" again

### Step 3: Test the Fix
1. Login with email/password
2. Open browser console
3. Navigate to a trader detail page
4. Click "Start Copying"
5. Check console logs - you should see:
   - "🔐 API Request: /copy-trading/start"
   - "🔑 Token preview: ey..."
   - Backend logs showing successful authentication

### Step 4: If Still Failing
The token might be expired. Check:
```javascript
const session = JSON.parse(localStorage.getItem('tradz_session'));
const expiresAt = session.expires_at;
const now = Math.floor(Date.now() / 1000);
console.log('Token expired:', now > expiresAt);
```

If expired, logout and login again.

## Technical Details

The authentication flow:
1. Frontend stores session with `access_token` in localStorage
2. API client reads token and adds to Authorization header
3. Backend middleware validates token with Supabase
4. If valid, request proceeds; if invalid, returns 401

## Debug Logs Added
- Frontend: Console logs showing token being sent
- Backend: Middleware logs showing token validation
- TraderDetail: Logs showing session state before API call

## Next Steps if Issue Persists
1. Check backend logs for exact error from Supabase
2. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env
3. Ensure Supabase project is active and not paused
4. Check if RLS policies are blocking the request
