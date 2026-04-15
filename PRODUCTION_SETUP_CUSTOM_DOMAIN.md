# Production Setup for vertexridgee.com

## Your Production URLs
- **Frontend**: https://vertexridgee.com
- **Backend**: https://vertextridge.onrender.com

---

## Step-by-Step Setup Guide

### Step 1: Update Google Cloud Console OAuth Settings

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project with Client ID: `430583586826-7t34v6u3a37osgcjhb3m98jj7nsd67jt`

2. **Update OAuth Consent Screen**
   - Go to: APIs & Services → OAuth consent screen
   - Click "Edit App"
   - Under "Authorized domains", add:
     - `vertexridgee.com`
   - Click "Save"

3. **Update OAuth 2.0 Client ID**
   - Go to: APIs & Services → Credentials
   - Click on your OAuth 2.0 Client ID (the one starting with 430583586826)
   
   - **Authorized JavaScript origins** - Add these:
     ```
     https://vertexridgee.com
     https://www.vertexridgee.com
     ```
   
   - **Authorized redirect URIs** - Add these:
     ```
     https://vertexridgee.com
     https://vertexridgee.com/register
     https://vertexridgee.com/login
     https://www.vertexridgee.com
     https://www.vertexridgee.com/register
     https://www.vertexridgee.com/login
     ```
   
   - Click "Save"

---

### Step 2: Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project (vertexridgee.com)

2. **Update Environment Variables**
   - Go to: Settings → Environment Variables
   - Update or add these:
     ```
     VITE_GOOGLE_CLIENT_ID=430583586826-7t34v6u3a37osgcjhb3m98jj7nsd67jt.apps.googleusercontent.com
     VITE_API_URL=https://vertextridge.onrender.com/api
     VITE_SUPABASE_URL=https://lieqzabrzhnjyoccjuia.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZXF6YWJyemhuanlvY2NqdWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTUzOTUsImV4cCI6MjA5MTM5MTM5NX0.eFJbdpyvjOiNDyKYdTYVZixduLkmRYioCCmKkKZFWrY
     ```
   - Select "Production", "Preview", and "Development" for each

3. **Redeploy**
   - Go to: Deployments tab
   - Click the three dots (•••) on the latest deployment
   - Click "Redeploy"
   - Wait for deployment to complete

---

### Step 3: Update Render Backend Environment Variables

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Select your backend service (vertextridge)

2. **Update Environment Variables**
   - Go to: Environment tab
   - Update `CORS_ORIGIN` to:
     ```
     http://localhost:5173,http://localhost:5174,https://vertextridge.vercel.app,https://vertexridgee.com,https://www.vertexridgee.com
     ```
   - Make sure these are also set:
     ```
     GOOGLE_CLIENT_ID=430583586826-7t34v6u3a37osgcjhb3m98jj7nsd67jt.apps.googleusercontent.com
     NODE_ENV=production
     ```
   - Click "Save Changes"
   - This will automatically trigger a redeploy

---

### Step 4: Verify Domain Configuration

1. **Check DNS Settings**
   - Make sure your domain `vertexridgee.com` is properly pointed to Vercel
   - Both `vertexridgee.com` and `www.vertexridgee.com` should work

2. **Check SSL Certificate**
   - Vercel should automatically provision SSL
   - Make sure both URLs show the padlock icon (🔒)

---

### Step 5: Test Everything

1. **Clear Browser Cache**
   - Or use Incognito/Private mode

2. **Test Regular Login**
   - Go to: https://vertexridgee.com/login
   - Try logging in with email/password
   - Should work ✅

3. **Test Google OAuth**
   - Go to: https://vertexridgee.com/register
   - Click "Sign in with Google"
   - Should redirect to Google and back successfully ✅

4. **Test API Calls**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Navigate around the site
   - Check that API calls go to `https://vertextridge.onrender.com/api`
   - No CORS errors should appear ✅

---

## Troubleshooting

### Issue: "Access blocked: Authorization Error" from Google
**Solution**: 
- Wait 5-10 minutes after updating Google Cloud Console (changes take time to propagate)
- Clear browser cache and try again
- Make sure OAuth consent screen is published or you're added as a test user

### Issue: CORS errors in browser console
**Solution**:
- Check that backend CORS_ORIGIN includes `https://vertexridgee.com`
- Make sure backend has redeployed after environment variable changes
- Check Render logs for any CORS-related errors

### Issue: API calls still going to localhost
**Solution**:
- Make sure environment variables are set on Vercel (not just in local `.env`)
- Redeploy frontend after setting environment variables
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: "Invalid Client" error
**Solution**:
- Verify VITE_GOOGLE_CLIENT_ID matches the Client ID in Google Cloud Console
- Make sure environment variable is set on Vercel, not just locally

### Issue: SSL/HTTPS errors
**Solution**:
- Wait for Vercel to provision SSL certificate (can take a few minutes)
- Make sure domain DNS is properly configured
- Check Vercel domain settings

---

## Quick Checklist

- [ ] Added `vertexridgee.com` to Google Cloud Console Authorized domains
- [ ] Added `https://vertexridgee.com` to Authorized JavaScript origins
- [ ] Added redirect URIs for vertexridgee.com to Google Cloud Console
- [ ] Set all environment variables on Vercel
- [ ] Updated CORS_ORIGIN on Render backend
- [ ] Redeployed frontend on Vercel
- [ ] Redeployed backend on Render (automatic after env change)
- [ ] Tested regular login on https://vertexridgee.com
- [ ] Tested Google OAuth on https://vertexridgee.com
- [ ] Verified no CORS errors in browser console
- [ ] Confirmed API calls go to production backend

---

## Important Security Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use environment variables on hosting platforms** - Set them in dashboards
3. **Keep production and development separate** - Use different Client IDs if needed
4. **Monitor logs** - Check Render logs for any backend errors

---

## Environment Variables Summary

### Frontend (Vercel) - Set in Vercel Dashboard
```
VITE_GOOGLE_CLIENT_ID=430583586826-7t34v6u3a37osgcjhb3m98jj7nsd67jt.apps.googleusercontent.com
VITE_API_URL=https://vertextridge.onrender.com/api
VITE_SUPABASE_URL=https://lieqzabrzhnjyoccjuia.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZXF6YWJyemhuanlvY2NqdWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTUzOTUsImV4cCI6MjA5MTM5MTM5NX0.eFJbdpyvjOiNDyKYdTYVZixduLkmRYioCCmKkKZFWrY
```

### Backend (Render) - Set in Render Dashboard
```
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://vertextridge.vercel.app,https://vertexridgee.com,https://www.vertexridgee.com
GOOGLE_CLIENT_ID=430583586826-7t34v6u3a37osgcjhb3m98jj7nsd67jt.apps.googleusercontent.com
NODE_ENV=production
```

Plus all your other backend environment variables (Supabase, JWT, etc.)

---

## Next Steps After Setup

1. **Test all features thoroughly**
   - User registration
   - Login (email + Google)
   - Dashboard access
   - Trading features
   - Deposit/Withdrawal
   - Admin panel

2. **Monitor for errors**
   - Check Render logs regularly
   - Monitor Vercel deployment logs
   - Watch for user-reported issues

3. **Set up monitoring** (Optional but recommended)
   - Set up error tracking (Sentry, LogRocket, etc.)
   - Set up uptime monitoring
   - Set up performance monitoring

---

## Support

If you encounter any issues:
1. Check browser console for frontend errors
2. Check Render logs for backend errors
3. Verify all environment variables are set correctly
4. Make sure all URLs use HTTPS (not HTTP)
5. Wait 5-10 minutes after Google Cloud Console changes
