# Vertex Ridge - Deployment Steps

## Prerequisites Checklist

Before deploying, make sure you have:

- [ ] Supabase project created (database)
- [ ] All database tables created (run all SQL files)
- [ ] Admin user created in database
- [ ] SMTP email credentials (for email notifications)
- [ ] Google OAuth credentials (if using Google login)
- [ ] GitHub account (for deployment)
- [ ] Code pushed to GitHub repository

---

## Option 1: Railway (Recommended - Easiest)

Railway can deploy both frontend and backend from one repository.

### Step 1: Prepare Your Code

1. **Create a `railway.json` file** in your project root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Update `package.json`** in root folder - add these scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "server": "cd server && npm run dev",
    "start:prod": "npm run build && npm run server:prod",
    "server:prod": "cd server && npm start"
  }
}
```

3. **Update `server/package.json`** - make sure you have:

```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  }
}
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 3: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Click **"Deploy from GitHub repo"**
4. Select your repository
5. Railway will detect your app automatically

### Step 4: Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_random_secret_key_here

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL (Railway will provide this)
FRONTEND_URL=https://your-app.railway.app

# Node Environment
NODE_ENV=production
PORT=5000
```

### Step 5: Get Your Domain

1. Railway will give you a domain like: `your-app.railway.app`
2. Copy this URL
3. Update `FRONTEND_URL` in environment variables
4. Update `VITE_API_URL` to: `https://your-app.railway.app/api`

### Step 6: Redeploy

Click **"Redeploy"** in Railway dashboard.

### Step 7: Test Your App

Visit: `https://your-app.railway.app`

---

## Option 2: Render (Alternative)

Render requires separate deployments for frontend and backend.

### Backend Deployment

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `vertex-ridge-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

5. Add environment variables (same as Railway above)

6. Click **"Create Web Service"**

7. Copy your backend URL: `https://vertex-ridge-api.onrender.com`

### Frontend Deployment

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `vertex-ridge`
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add environment variable:
   ```
   VITE_API_URL=https://vertex-ridge-api.onrender.com/api
   ```

5. Click **"Create Static Site"**

6. Your frontend URL: `https://vertex-ridge.onrender.com`

---

## Option 3: Vercel (Frontend) + Railway (Backend)

### Backend on Railway
Follow Railway steps above for backend only.

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

6. Click **"Deploy"**

---

## Post-Deployment Checklist

After deployment, verify:

### 1. Database Setup
- [ ] All SQL schemas are run in Supabase
- [ ] Admin user is created
- [ ] Test database connection

### 2. Environment Variables
- [ ] All variables are set correctly
- [ ] VITE_API_URL points to your backend
- [ ] FRONTEND_URL is set in backend

### 3. CORS Configuration
Update `server/index.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-app.railway.app',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));
```

### 4. Test Features
- [ ] Landing page loads
- [ ] User signup works
- [ ] User login works
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Trading features work
- [ ] Deposit/Withdraw pages load
- [ ] Email notifications work

### 5. Security
- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Review CORS settings

---

## Common Issues & Solutions

### Issue 1: "Cannot GET /api/..."
**Problem**: Backend routes not working
**Solution**: Make sure `server/index.js` has:
```javascript
app.use('/api', routes);
```

### Issue 2: CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**: Update CORS in `server/index.js` with your frontend URL

### Issue 3: Environment Variables Not Working
**Problem**: App can't connect to database
**Solution**: 
- Check variable names match exactly
- Restart the deployment after adding variables
- Check logs for specific errors

### Issue 4: Build Fails
**Problem**: Deployment fails during build
**Solution**:
- Check build logs
- Make sure all dependencies are in `package.json`
- Test build locally: `npm run build`

### Issue 5: Database Connection Fails
**Problem**: Can't connect to Supabase
**Solution**:
- Verify Supabase URL and keys
- Check if Supabase project is active
- Test connection locally first

---

## Monitoring & Logs

### Railway
- View logs: Dashboard → Deployments → View Logs
- Monitor: Dashboard → Metrics

### Render
- View logs: Dashboard → Logs tab
- Monitor: Dashboard → Metrics tab

### Vercel
- View logs: Dashboard → Deployments → Function Logs
- Monitor: Dashboard → Analytics

---

## Custom Domain (Optional)

### Railway
1. Go to Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `app.yourdomain.com`
4. Add DNS records as shown

### Render
1. Go to Settings → Custom Domain
2. Enter your domain
3. Add CNAME record to your DNS

### Vercel
1. Go to Settings → Domains
2. Add your domain
3. Configure DNS as instructed

---

## Backup & Rollback

### Railway
- Automatic backups of deployments
- Rollback: Deployments → Select previous → Redeploy

### Render
- Automatic backups
- Rollback: Deploys → Select previous → Redeploy

---

## Cost Estimates

### Railway (Recommended)
- **Free Tier**: $5 credit/month (enough for small apps)
- **Pro**: $20/month (unlimited projects)

### Render
- **Free Tier**: Available (with limitations)
- **Starter**: $7/month per service

### Vercel
- **Free Tier**: Generous limits
- **Pro**: $20/month

---

## Next Steps

1. Choose your deployment platform (Railway recommended)
2. Follow the steps for that platform
3. Set up environment variables
4. Deploy and test
5. Set up custom domain (optional)
6. Monitor logs and performance

---

## Need Help?

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

---

## Quick Command Reference

```bash
# Test build locally
npm run build

# Test backend locally
cd server && npm start

# Check for errors
npm run build 2>&1 | grep -i error

# Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main
```
