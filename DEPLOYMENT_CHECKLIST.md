# Deployment Checklist for Vertex Ridge

## Before You Start

### 1. Database Setup (Supabase)
- [ ] Supabase project created
- [ ] Run `server/config/database.sql`
- [ ] Run `server/config/admin_schema.sql`
- [ ] Run `server/config/copy_trading_schema.sql`
- [ ] Run `server/config/notifications_schema.sql`
- [ ] Run `server/config/platform_settings_schema.sql`
- [ ] Run `CREATE_ADMIN_USER.sql` (with your email)
- [ ] Verify all tables exist:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name;
  ```

### 2. Environment Variables Ready
- [ ] Supabase URL
- [ ] Supabase Anon Key
- [ ] Supabase Service Role Key
- [ ] JWT Secret (generate random string)
- [ ] SMTP credentials (Gmail or other)
- [ ] Google OAuth credentials (optional)

### 3. Code Ready
- [ ] All code committed to Git
- [ ] Repository pushed to GitHub
- [ ] No sensitive data in code (check .env files)
- [ ] Build works locally: `npm run build`
- [ ] Server works locally: `cd server && npm start`

---

## Deployment Steps (Railway - Recommended)

### Step 1: Prepare Files
- [x] `railway.json` created
- [x] `package.json` has production scripts
- [x] `server/index.js` serves static files in production

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3: Deploy on Railway

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js

3. **Configure Environment Variables**
   Click "Variables" tab and add:

   ```env
   # Database
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Security
   JWT_SECRET=your_random_secret_minimum_32_characters_long
   NODE_ENV=production
   PORT=5000

   # Email (Gmail example)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-specific-password
   EMAIL_FROM=Vertex Ridge <noreply@vertexridge.com>

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret

   # CORS (Railway will provide your domain)
   CORS_ORIGIN=https://your-app.railway.app
   FRONTEND_URL=https://your-app.railway.app

   # API URL for frontend
   VITE_API_URL=https://your-app.railway.app/api
   ```

4. **Get Your Domain**
   - Railway assigns: `your-app.railway.app`
   - Copy this URL
   - Update `CORS_ORIGIN`, `FRONTEND_URL`, and `VITE_API_URL` with this domain

5. **Redeploy**
   - Click "Redeploy" to apply new environment variables

### Step 4: Verify Deployment

1. **Check Build Logs**
   - Go to "Deployments" tab
   - Click latest deployment
   - Check logs for errors

2. **Test Health Endpoint**
   ```bash
   curl https://your-app.railway.app/api/health
   ```
   Should return:
   ```json
   {
     "status": "ok",
     "database": "connected"
   }
   ```

3. **Test Frontend**
   - Visit: `https://your-app.railway.app`
   - Should see landing page

4. **Test Signup**
   - Go to `/register`
   - Create test account
   - Check if email is sent

5. **Test Login**
   - Login with test account
   - Should redirect to dashboard

6. **Test Admin**
   - Go to `/admin/login`
   - Login with admin email
   - Should see admin dashboard

---

## Post-Deployment Configuration

### 1. Update Google OAuth (if using)
- Go to Google Cloud Console
- Add your Railway domain to authorized origins:
  - `https://your-app.railway.app`
- Add to authorized redirect URIs:
  - `https://your-app.railway.app/login`

### 2. Update Supabase Settings
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your Railway domain to:
  - Site URL: `https://your-app.railway.app`
  - Redirect URLs: `https://your-app.railway.app/**`

### 3. Test All Features
- [ ] Landing page loads
- [ ] User signup works
- [ ] Email verification sent
- [ ] User login works
- [ ] Dashboard loads
- [ ] Markets page works
- [ ] Trading works
- [ ] Deposit page loads
- [ ] Withdraw page loads
- [ ] Profile page works
- [ ] Settings page works
- [ ] Admin login works
- [ ] Admin dashboard works
- [ ] Admin can edit users
- [ ] Admin can edit settings

---

## Troubleshooting

### Build Fails
**Check logs for:**
- Missing dependencies
- Build errors
- Memory issues

**Solutions:**
```bash
# Test build locally
npm run build

# Check for errors
npm run build 2>&1 | grep -i error
```

### Database Connection Fails
**Check:**
- Supabase URL is correct
- Supabase keys are correct
- Supabase project is active

**Test:**
```bash
curl https://your-app.railway.app/api/health
```

### CORS Errors
**Check:**
- `CORS_ORIGIN` includes your domain
- No trailing slashes in URLs

**Fix in `server/index.js`:**
```javascript
const corsOrigins = [
  'https://your-app.railway.app'
];
```

### Environment Variables Not Working
**Check:**
- Variable names match exactly
- No extra spaces
- Redeploy after adding variables

### 404 on Routes
**Check:**
- `server/index.js` has static file serving
- `NODE_ENV=production` is set
- Build created `dist` folder

---

## Monitoring

### Railway Dashboard
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: History of all deployments

### Check Logs
```bash
# In Railway dashboard
Deployments → Latest → View Logs
```

### Common Log Patterns
- ✅ `⚡ TradZ API running on http://localhost:5000`
- ✅ `Database: ✓ Connected`
- ❌ `Database connection failed`
- ❌ `ECONNREFUSED`

---

## Security Checklist

- [ ] All environment variables are set
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] SMTP password is app-specific (not main password)
- [ ] Supabase Service Role Key is secret
- [ ] No sensitive data in GitHub
- [ ] HTTPS is enabled (Railway does this automatically)
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled (check `server/index.js`)

---

## Performance Optimization

### 1. Enable Caching
Already implemented in `server/routes/market.js`

### 2. Database Indexes
Already created in SQL schemas

### 3. Image Optimization
- Use WebP format for images
- Compress images before upload

### 4. CDN (Optional)
- Use Cloudflare for static assets
- Improves global load times

---

## Backup Strategy

### Database Backups
Supabase automatically backs up your database daily.

**Manual Backup:**
1. Go to Supabase Dashboard
2. Database → Backups
3. Click "Create Backup"

### Code Backups
Your code is backed up on GitHub.

**Create Release:**
```bash
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

---

## Rollback Plan

### If Deployment Fails

**Railway:**
1. Go to Deployments
2. Select previous working deployment
3. Click "Redeploy"

**GitHub:**
```bash
git revert HEAD
git push origin main
```

---

## Custom Domain (Optional)

### 1. Buy Domain
- Namecheap, GoDaddy, or Google Domains

### 2. Configure DNS
In Railway:
1. Settings → Domains
2. Add custom domain: `app.yourdomain.com`
3. Add DNS records as shown

### 3. SSL Certificate
Railway automatically provisions SSL certificates.

---

## Cost Estimate

### Railway
- **Free Tier**: $5 credit/month
- **Usage**: ~$5-10/month for small app
- **Pro Plan**: $20/month (if needed)

### Supabase
- **Free Tier**: 500MB database, 2GB bandwidth
- **Pro**: $25/month (if you exceed free tier)

### Domain (Optional)
- **Cost**: $10-15/year

**Total**: $0-10/month (free tier) or $20-35/month (paid)

---

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check logs regularly
   - Test all features
   - Monitor performance

2. **Set up alerts**
   - Railway can notify you of issues
   - Set up email alerts

3. **Create admin account**
   - Run CREATE_ADMIN_USER.sql
   - Test admin panel

4. **Invite beta users**
   - Start with small group
   - Gather feedback

5. **Plan updates**
   - Use GitHub for version control
   - Deploy updates via Railway

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Node.js Docs**: https://nodejs.org/docs
- **React Docs**: https://react.dev

---

## Success Criteria

Your deployment is successful when:
- ✅ App loads at your Railway URL
- ✅ Users can sign up and login
- ✅ Dashboard displays correctly
- ✅ Trading features work
- ✅ Admin panel is accessible
- ✅ No errors in logs
- ✅ Database is connected
- ✅ Emails are being sent

**Congratulations! Your app is live! 🎉**
