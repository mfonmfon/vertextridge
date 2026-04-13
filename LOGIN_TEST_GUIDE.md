# Login Testing Guide

## The Error You're Seeing

The error `Unexpected token '"', ""admin@tradz.com"" is not valid JSON` means the email is being double-stringified (wrapped in quotes twice).

## Quick Fix - Restart Everything

1. **Stop both servers** (Ctrl+C in both terminals)

2. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete`
   - Select "Cached images and files"
   - Click "Clear data"

3. **Restart backend:**
```bash
cd server
npm run dev
```

4. **Restart frontend:**
```bash
npm run dev
```

5. **Try logging in again**

## If That Doesn't Work - Test with Browser DevTools

1. **Open your browser** and go to `http://localhost:5173/login`

2. **Open DevTools** (Press F12)

3. **Go to Network tab**

4. **Try to login** with:
   - Email: `admin@example.com`
   - Password: `Admin123!`

5. **Click on the `/api/auth/login` request** in the Network tab

6. **Check the "Payload" or "Request" tab** - it should show:
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

7. **If it shows something else** (like a string or double-quoted), take a screenshot and let me know

## Alternative - Test with a Fresh Account

If the issue persists, try creating a completely new account:

1. **Go to:** `http://localhost:5173/register`

2. **Sign up with:**
   - Name: `Test Admin`
   - Email: `testadmin@example.com`
   - Password: `TestAdmin123!`
   - Country: Any

3. **After signup, make this user an admin:**

Go to Supabase SQL Editor and run:
```sql
DO $$
DECLARE
  user_id_var UUID;
BEGIN
  SELECT id INTO user_id_var 
  FROM auth.users 
  WHERE email = 'testadmin@example.com';
  
  INSERT INTO admin_users (user_id, email, role)
  VALUES (user_id_var, 'testadmin@example.com', 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END $$;
```

4. **Now try accessing:** `http://localhost:5173/admin/dashboard`

## Check Server Logs

When you try to login, check the server terminal. You should see:
```
[DEBUG] POST /api/auth/login
[DEBUG] Request body for /api/auth/login: { body: { email: '...', password: '...' } }
```

If you see something different, that's the issue.

## Common Causes

1. **Old cached requests** - Clear browser cache
2. **Server not restarted** - Restart backend server
3. **Frontend not restarted** - Restart frontend server
4. **Browser extension interfering** - Try incognito mode
5. **CORS issue** - Check server logs for CORS errors

## Test Login Without Admin

To verify login works at all:

1. **Create a regular account** (if you haven't)
2. **Login** at `http://localhost:5173/login`
3. **You should be redirected to** `/dashboard`
4. **If this works**, the issue is specific to admin access

## Still Not Working?

If you're still getting the error:

1. **Check what's in the Network tab** (F12 → Network)
2. **Look at the request payload**
3. **Check the response**
4. **Share the exact error message**

The login should work fine - this error is unusual and likely caused by cached data or a server that needs restarting.
