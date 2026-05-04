# User Guide: Authentication Issues

## "Not authorized, invalid token" Error

If you see this error, it means your login session has expired or become invalid.

### Quick Fix (For Users)

1. **Logout and Login Again**
   - Click your profile icon
   - Select "Logout"
   - Login again with your credentials

2. **Clear Browser Data** (if logout doesn't work)
   - Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
   - Select "Cookies and other site data"
   - Click "Clear data"
   - Refresh the page and login again

3. **Try Incognito/Private Mode**
   - Open a new incognito/private window
   - Navigate to the site
   - Login again
   - If it works, clear your browser cache in normal mode

### Why This Happens

- **Session Expired**: Login sessions expire after a certain time for security
- **Token Invalid**: Your authentication token may have been corrupted
- **Browser Issues**: Sometimes browser cache can cause authentication problems

### Prevention

- **Stay Active**: The session stays valid while you're actively using the platform
- **Don't Share Sessions**: Don't copy session data between devices
- **Use One Tab**: Avoid logging in from multiple tabs simultaneously

### Still Having Issues?

If the problem persists after trying the above steps:

1. Check your internet connection
2. Try a different browser
3. Contact support with:
   - Your email address
   - Time when the error occurred
   - What action you were trying to perform
   - Browser and device information

## For Developers

### Common Causes

1. **Expired JWT Token**
   - Tokens expire after the time set in Supabase
   - Default is usually 1 hour
   - Check `expires_at` in localStorage

2. **Invalid Token Format**
   - Token may be corrupted in localStorage
   - Check `tradz_session` in browser DevTools

3. **Supabase Configuration**
   - JWT secret mismatch
   - RLS policies blocking access
   - User not found in database

### Debugging Steps

1. **Check Browser Console**
   ```javascript
   // Open DevTools Console and run:
   const session = JSON.parse(localStorage.getItem('tradz_session'));
   console.log('Session:', session);
   console.log('Token:', session?.access_token);
   console.log('Expires:', new Date(session?.expires_at * 1000));
   ```

2. **Check Network Tab**
   - Look for 401 responses
   - Check Authorization header in requests
   - Verify token is being sent

3. **Check Server Logs**
   - Look for authentication middleware logs
   - Check for Supabase validation errors
   - Verify user exists in database

### Manual Token Refresh

```javascript
// In browser console:
const { supabase } = await import('./src/config/supabase.js');
const { data, error } = await supabase.auth.refreshSession();
if (data.session) {
  localStorage.setItem('tradz_session', JSON.stringify(data.session));
  console.log('Session refreshed!');
}
```

### Testing Authentication

```javascript
// Test if token is valid:
fetch('http://localhost:5000/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tradz_session')).access_token}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Security Notes

- Never share your authentication tokens
- Tokens are sensitive and should be kept secure
- Clear sessions when using public computers
- Use strong, unique passwords
- Enable 2FA if available

## Related Documentation

- [Copy Trading Fixes](./COPY_TRADING_FIXES_COMPLETE.md)
- [Authentication Fix Details](./AUTHENTICATION_FIX.md)
- [Setup Guide](./SETUP_GUIDE.md)
