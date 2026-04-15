# Debug: Google OAuth "Failed to fetch" Error

## Error Analysis
You're seeing two errors:
1. **"Google sign-in failed"** - Frontend error message
2. **"Failed to fetch"** - Network/API error

This means the frontend can't reach the backend API.

---

## Immediate Checks

### 1. Check if Backend is Running
Open a new browser tab and visit:
```
https://vertextridge.onrender.com/api/health
```

**Expected**: Should return something like `{"status":"ok"}` or similar
**If it fails**: Your backend is down or not responding

### 2. Check Environment Variables on Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project (vertexridgee.com)
3. Go to: Settings → Environment Variables
4. **CRITICAL**: Make sure `VITE_API_URL` is set to:
   ```
   https://vertextridge.onrender.com/api
   ```
5. If it's not set or wrong, add/update it
6. **IMPORTANT**: After changing, you MUST redeploy!

### 3. Open Browser DevTools

1. Press F12 to open DevTools
2. Go to "Console" tab
3. Look for the line that says: `API_BASE_URL`
4. It should show: `https://vertextridge.onrender.com/api`
5. If it shows `http://localhost:5000/api`, your env var isn't set on Vercel

### 4. Check Network Tab

1. In DevTools, go to "Network" tab
2. Try Google sign-in again
3. Look for a request to `/auth/google`
4. Click on it and check:
   - **Request URL**: Should be `https://vertextridge.onrender.com/api/auth/google`
   - **Status**: What's the status code?
   - **Response**: What's the error message?

---

## Common Issues & Solutions

### Issue 1: Environment Variable Not Set on Vercel

**Symptoms**: 
- DevTools console shows `http://localhost:5000/api`
- Network requests go to localhost

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   Name: VITE_API_URL
   Value: https://vertextridge.onrender.com/api
   ```
3. Select: Production, Preview, Development
4. Click "Save"
5. Go to Deployments tab
6. Click ••• on latest deployment → "Redeploy"
7. Wait for deployment to complete
8. Hard refresh your browser (Ctrl+Shift+R)

### Issue 2: Backend is Down/Sleeping

**Symptoms**:
- Request times out
- "Failed to fetch" error
- Backend health check fails

**Solution**:
1. Go to: https://dashboard.render.com/
2. Check if your service is running
3. If it's sleeping, click to wake it up
4. Check logs for any errors
5. Make sure all environment variables are set on Render

### Issue 3: CORS Error

**Symptoms**:
- Console shows: "CORS policy: No 'Access-Control-Allow-Origin' header"
- Request reaches backend but fails

**Solution**:
1. Go to Render Dashboard → Your Service → Environment
2. Check `CORS_ORIGIN` includes:
   ```
   https://vertexridgee.com,https://www.vertexridgee.com
   ```
3. If not, update it to:
   ```
   http://localhost:5173,http://localhost:5174,https://vertextridge.vercel.app,https://vertexridgee.com,https://www.vertexridgee.com
   ```
4. Save (will auto-redeploy)
5. Wait 2-3 minutes for redeploy
6. Try again

### Issue 4: Google OAuth Not Configured

**Symptoms**:
- Request reaches backend
- Backend returns error about invalid client

**Solution**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under "Authorized JavaScript origins", add:
   - `https://vertexridgee.com`
   - `https://www.vertexridgee.com`
4. Under "Authorized redirect URIs", add:
   - `https://vertexridgee.com`
   - `https://vertexridgee.com/register`
   - `https://vertexridgee.com/login`
5. Save
6. Wait 5-10 minutes for changes to propagate
7. Try again

---

## Step-by-Step Debugging Process

### Step 1: Verify Backend is Alive
```bash
# Open this URL in browser:
https://vertextridge.onrender.com/api/health
```
- ✅ If you see a response: Backend is working
- ❌ If it times out: Backend is down or sleeping

### Step 2: Check What API URL Frontend is Using
1. Open https://vertexridgee.com/login
2. Press F12 → Console tab
3. Type: `import.meta.env.VITE_API_URL`
4. Press Enter
5. Should show: `https://vertextridge.onrender.com/api`
6. If it shows `undefined` or `localhost`: Env var not set on Vercel

### Step 3: Test API Directly
Open browser console and run:
```javascript
fetch('https://vertextridge.onrender.com/api/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ credential: 'test', country: 'US' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Expected**: Some error about invalid credential (that's OK, means API is reachable)
**If CORS error**: Backend CORS not configured
**If timeout**: Backend is down

### Step 4: Check Render Logs
1. Go to: https://dashboard.render.com/
2. Select your backend service
3. Click "Logs" tab
4. Look for:
   - Service startup messages
   - Any error messages
   - CORS-related logs
   - Google OAuth errors

---

## Quick Fix Checklist

Run through this checklist in order:

- [ ] Backend is running (check Render dashboard)
- [ ] Backend health endpoint responds: `https://vertextridge.onrender.com/api/health`
- [ ] `VITE_API_URL` is set on Vercel to `https://vertextridge.onrender.com/api`
- [ ] Redeployed frontend after setting env var
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] `CORS_ORIGIN` on Render includes `https://vertexridgee.com`
- [ ] Backend redeployed after CORS change
- [ ] Google Cloud Console has `https://vertexridgee.com` in authorized origins
- [ ] Waited 5-10 minutes after Google Cloud Console changes
- [ ] Tested in incognito/private mode

---

## Still Not Working?

### Get Detailed Error Info

1. Open DevTools (F12)
2. Go to Network tab
3. Try Google sign-in
4. Find the failed request
5. Right-click → Copy → Copy as cURL
6. Send me the cURL command (remove any sensitive tokens)

### Check These Logs

1. **Vercel Deployment Logs**
   - Go to Vercel → Deployments → Click latest
   - Check build logs for errors
   - Check function logs for runtime errors

2. **Render Service Logs**
   - Go to Render → Your Service → Logs
   - Look for startup errors
   - Look for request errors when you try to sign in

3. **Browser Console**
   - Any red errors?
   - Any warnings about CORS?
   - Any network errors?

---

## Most Likely Issue

Based on the "Failed to fetch" error, the most likely issue is:

**Environment variable `VITE_API_URL` is not set on Vercel**

This means your frontend is trying to call `http://localhost:5000/api` which doesn't exist in production.

**Fix**:
1. Vercel Dashboard → Settings → Environment Variables
2. Add `VITE_API_URL` = `https://vertextridge.onrender.com/api`
3. Redeploy
4. Hard refresh browser

This should fix 90% of cases!
