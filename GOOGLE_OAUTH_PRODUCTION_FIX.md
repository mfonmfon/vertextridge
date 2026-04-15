# Fix Google OAuth for Production

## Problem
Google OAuth works on localhost but fails in production with "Access blocked: Authorization Error"

## Root Causes
1. ✅ **FIXED**: Frontend `.env` was pointing to localhost backend instead of production
2. ✅ **FIXED**: Backend CORS wasn't allowing production frontend domain
3. ⚠️ **ACTION REQUIRED**: Google Cloud Console OAuth settings need production URLs

---

## What I Fixed

### 1. Frontend Environment Variables (`.env`)
Changed:
```
VITE_API_URL=http://localhost:5000/api
```
To:
```
VITE_API_URL=https://vertextridge.onrender.com/api
```

### 2. Backend CORS Settings (`server/.env`)
Changed:
```
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```
To:
```
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://vertextridge.vercel.app
```

---

## What YOU Need to Do

### Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or the project with Client ID: `430583586826-...`)

2. **Navigate to OAuth Consent Screen**
   - Go to: APIs & Services → OAuth consent screen
   - Make sure your app is published or add test users

3. **Configure Authorized Domains**
   - Click "Edit App"
   - Under "Authorized domains", add:
     - `vercel.app`
     - `vertextridge.vercel.app` (if custom domain)
   - Save

4. **Update OAuth 2.0 Client ID**
   - Go to: APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID
   - Under "Authorized JavaScript origins", add:
     ```
     https://vertextridge.vercel.app
     ```
   - Under "Authorized redirect URIs", add:
     ```
     https://vertextridge.vercel.app
     https://vertextridge.vercel.app/register
     https://vertextridge.vercel.app/login
     ```
   - Click "Save"

### Step 2: Set Environment Variables on Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Add Environment Variables**
   - Go to: Settings → Environment Variables
   - Add these variables:
     ```
     VITE_GOOGLE_CLIENT_ID=430583586826-7t34v6u3a37osgcjhb3m98jj7nsd67jt.apps.googleusercontent.com
     VITE_API_URL=https://vertextridge.onrender.com/api
     VITE_SUPABASE_URL=https://lieqzabrzhnjyoccjuia.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZXF6YWJyemhuanlvY2NqdWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTUzOTUsImV4cCI6MjA5MTM5MTM5NX0.eFJbdpyvjOiNDyKYdTYVZixduLkmRYioCCmKkKZFWrY
     ```
   - Make sure to select "Production", "Preview", and "Development" for each variable

3. **Redeploy**
   - Go to: Deployments
   - Click the three dots on the latest deployment
   - Click "Redeploy"

### Step 3: Set Environment Variables on Render (Backend)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Select your backend service

2. **Update Environment Variables**
   - Go to: Environment
   - Update or add:
     ```
     CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://vertextridge.vercel.app
     GOOGLE_CLIENT_ID=430583586826-7t34v6u3a37osgcjhb3m98jj7nsd67jt.apps.googleusercontent.com
     ```
   - Save changes (this will trigger a redeploy)

### Step 4: Test

1. Clear your browser cache or use incognito mode
2. Visit: https://vertextridge.vercel.app/register
3. Click "Sign in with Google"
4. It should now work!

---

## Common Issues & Solutions

### Issue: Still getting "Authorization Error"
**Solution**: Wait 5-10 minutes after updating Google Cloud Console settings. Google needs time to propagate changes.

### Issue: CORS errors in browser console
**Solution**: Make sure backend CORS_ORIGIN includes your Vercel domain and redeploy backend.

### Issue: "Invalid Client" error
**Solution**: Double-check that VITE_GOOGLE_CLIENT_ID matches the Client ID in Google Cloud Console.

### Issue: Redirect URI mismatch
**Solution**: Make sure all your app URLs are added to "Authorized redirect URIs" in Google Cloud Console.

---

## Quick Checklist

- [ ] Updated `.env` file with production API URL
- [ ] Updated `server/.env` with production CORS origin
- [ ] Added production domain to Google Cloud Console Authorized JavaScript origins
- [ ] Added redirect URIs to Google Cloud Console
- [ ] Set environment variables on Vercel
- [ ] Set environment variables on Render
- [ ] Redeployed both frontend and backend
- [ ] Tested Google OAuth on production

---

## Important Notes

1. **Never commit `.env` files to Git** - They contain sensitive keys
2. **Use environment variables on hosting platforms** - Set them in Vercel/Render dashboards
3. **Keep localhost URLs for development** - You can have both localhost and production URLs in Google Console
4. **Test in incognito mode** - Avoids cached credentials causing issues

---

## Need Help?

If you're still having issues after following these steps:

1. Check browser console for specific error messages
2. Check Render logs for backend errors
3. Verify all URLs are HTTPS (not HTTP) in production
4. Make sure Google OAuth consent screen is published or you're added as a test user
