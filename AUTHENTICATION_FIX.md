# Authentication Error Fix - "Not authorized, invalid token"

## Problem
Users were getting "Not authorized, invalid token" error when trying to start copy trading, even though they were logged in.

## Root Causes Identified

1. **Token Expiration**: JWT tokens expire after a certain time, but the app wasn't checking expiration before making requests
2. **Poor Error Handling**: When 401 errors occurred, the app didn't clear the session or redirect to login
3. **No Session Validation**: The frontend wasn't validating if the session was still valid before making authenticated requests

## Fixes Applied

### 1. API Service (`src/services/api.js`)

#### Added Token Expiration Check
```javascript
const isTokenExpired = (session) => {
  if (!session || !session.expires_at) return true;
  const expiresAt = session.expires_at * 1000;
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  return now >= (expiresAt - bufferTime);
};
```

#### Enhanced Request Function
- Checks if token is expired before making request
- Clears session and redirects to login if expired
- Prevents unnecessary API calls with expired tokens

#### Improved 401 Error Handling
- Automatically clears localStorage on 401 errors
- Redirects to login page with session_expired parameter
- Prevents redirect loops on auth pages

### 2. TraderDetail Component (`src/page/copytrading/TraderDetail.jsx`)

#### Added Session Validation
```javascript
// Validate session before starting copy
const sessionStr = localStorage.getItem('tradz_session');
if (!sessionStr) {
  toast.error('Session expired. Please login again.');
  navigate('/login');
  return;
}
```

#### Enhanced Error Handling
- Specific error messages for different error codes:
  - `INVALID_TOKEN` / `TOKEN_EXPIRED`: Clear session and redirect to login
  - `INSUFFICIENT_FUNDS`: Prompt user to deposit
  - `ALREADY_COPYING`: Inform user they're already copying this trader
  - Generic errors: Show error message from server

### 3. Backend Middleware (`server/middleware/authMiddleware.js`)

Already had robust fallback mechanisms:
- Tries Supabase client validation first
- Falls back to admin client if needed
- Falls back to JWT decode + database lookup as last resort
- Comprehensive logging for debugging

## How It Works Now

### Normal Flow:
1. User logs in → Session stored with `expires_at` timestamp
2. User clicks "Start Copying"
3. Frontend checks if token is expired
4. If valid, makes API request with Bearer token
5. Backend validates token
6. Copy trading relationship created

### Expired Token Flow:
1. User clicks "Start Copying"
2. Frontend detects token is expired
3. Clears localStorage
4. Redirects to `/login?expired=true`
5. User sees message to login again

### Invalid Token Flow (401 from server):
1. User clicks "Start Copying"
2. API request made with token
3. Server returns 401 Unauthorized
4. Frontend catches error
5. Clears localStorage
6. Redirects to `/login?session_expired=true`
7. Shows "Session expired" toast

## Testing Checklist

- [x] Token expiration check before requests
- [x] Automatic session clearing on 401 errors
- [x] Redirect to login on authentication failure
- [x] Specific error messages for different scenarios
- [x] No redirect loops on auth pages
- [x] Session validation in copy trading flow

## User Experience Improvements

1. **Clear Error Messages**: Users know exactly why the action failed
2. **Automatic Cleanup**: No stale sessions left in localStorage
3. **Smooth Redirects**: Automatically redirected to login when needed
4. **No Confusion**: Specific messages for each error type

## Prevention Measures

1. **Token Refresh**: Consider implementing automatic token refresh before expiration
2. **Session Monitoring**: Add a global session monitor to check expiration periodically
3. **Retry Logic**: Could add automatic retry after token refresh
4. **Better UX**: Show session expiration warning before it expires

## Files Modified

1. `vertextridge/src/services/api.js`
   - Added `isTokenExpired()` function
   - Enhanced token validation in `request()` function
   - Improved 401 error handling with session cleanup

2. `vertextridge/src/page/copytrading/TraderDetail.jsx`
   - Added session validation before copy trading
   - Enhanced error handling with specific error codes
   - Better user feedback for different error scenarios

## Next Steps (Optional Enhancements)

1. **Token Refresh**: Implement automatic token refresh using Supabase's `refreshSession()`
2. **Session Monitor**: Add a global timer to check session expiration every minute
3. **Graceful Degradation**: Show warning 5 minutes before expiration
4. **Persistent Sessions**: Consider using refresh tokens for longer sessions
5. **Activity Tracking**: Extend session on user activity

## How to Test

1. **Normal Flow**:
   - Login
   - Navigate to copy trading
   - Click "Start Copying"
   - Should work normally

2. **Expired Token**:
   - Login
   - Wait for token to expire (or manually set old `expires_at`)
   - Try to start copying
   - Should redirect to login with message

3. **Invalid Token**:
   - Login
   - Manually corrupt the token in localStorage
   - Try to start copying
   - Should get 401, clear session, redirect to login

## Support

If users still experience authentication issues:
1. Clear browser cache and localStorage
2. Logout and login again
3. Check browser console for detailed error logs
4. Verify Supabase project settings and JWT secret
