# Deploy Vertex Ridge NOW - Quick Guide

## What You Need (5 minutes to gather)

1. **Supabase Account** - https://supabase.com
   - Create project
   - Get URL and keys from Settings → API

2. **Gmail App Password** - For sending emails
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **GitHub Account** - https://github.com
   - Create repository
   - Push your code

4. **Railway Account** - https://railway.app
   - Sign up with GitHub (free)

---

## Step-by-Step Deployment (15 minutes)

### STEP 1: Setup Database (5 minutes)

1. Go to your Supabase project
2. Click "SQL Editor"
3. Run these files in order:
   - `server/config/database.sql`
   - `server/config/admin_schema.sql`
   - `server/config/copy_trading_schema.sql`
   - `server/config/notifications_schema.sql`
   - `server/config/platform_settings_schema.sql`

4. Create your admin user:
```sql
DO $
DECLARE user_id_var UUID; user_email TEXT := 'mfonmfon903@gmail.com';
BEGIN
  SELECT id INTO user_id_var FROM auth.users WHERE email = user_email;
  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'Sign up at /signup first!';
  END IF;
  INSERT INTO admin_users (user_id, email, role, permissions)
  VALUES (user_id_var, user_email, 'super_admin', '{}'::jsonb)
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END $;
```

### STEP 2: Push to GitHub (2 minutes)

```bash
# If you haven't already
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/vertex-ridge.git
git branch -M main
git push -u origin main
```

### STEP 3: Deploy on Railway (5 minutes)

1. Go to https://railway.app
2. Click "Start a New Project"
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Wait for initial deployment (will fail - that's OK!)

### STEP 4: Add Environment Variables (3 minutes)

Click "Variables" tab and add these:

```env
# From Supabase (Settings → API)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Generate random string (32+ characters)
JWT_SECRET=your_random_secret_here_make_it_long_and_secure

# Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-from-google
EMAIL_FROM=Vertex Ridge <noreply@vertexridge.com>

# Production settings
NODE_ENV=production
PORT=5000
```

### STEP 5: Get Your Domain & Update Variables

1. Railway will show your domain: `your-app.railway.app`
2. Add these variables:

```env
CORS_ORIGIN=https://your-app.railway.app
FRONTEND_URL=https://your-app.railway.app
VITE_API_URL=https://your-app.railway.app/api
```

3. Click "Redeploy"

### STEP 6: Test Your App

1. Visit: `https://your-app.railway.app`
2. You should see the landing page
3. Try signing up at `/register`
4. Try logging in at `/login`
5. Try admin login at `/admin/login`

---

## If Something Goes Wrong

### Check Deployment Logs
Railway Dashboard → Deployments → View Logs

### Common Issues:

**"Build failed"**
- Check logs for specific error
- Make sure all dependencies are in package.json

**"Cannot connect to database"**
- Verify Supabase URL and keys
- Check if Supabase project is active

**"CORS error"**
- Make sure CORS_ORIGIN matches your Railway domain
- No trailing slashes

**"Admin login fails"**
- Did you create admin user in database?
- Did you sign up first at /signup?

---

## Environment Variables Template

Copy this and fill in your values:

```env
# === SUPABASE (Get from Supabase Dashboard → Settings → API) ===
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# === SECURITY ===
JWT_SECRET=generate_a_random_string_at_least_32_characters_long
NODE_ENV=production
PORT=5000

# === EMAIL (Gmail) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM=Vertex Ridge <noreply@vertexridge.com>

# === DOMAINS (Get from Railway after first deployment) ===
CORS_ORIGIN=https://your-app.railway.app
FRONTEND_URL=https://your-app.railway.app
VITE_API_URL=https://your-app.railway.app/api

# === GOOGLE OAUTH (Optional) ===
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## Quick Checklist

Before deploying:
- [ ] Supabase project created
- [ ] All SQL files run in Supabase
- [ ] Admin user created
- [ ] Gmail app password generated
- [ ] Code pushed to GitHub

During deployment:
- [ ] Railway project created
- [ ] Repository connected
- [ ] Environment variables added
- [ ] Domain copied and added to variables
- [ ] Redeployed with new variables

After deployment:
- [ ] Landing page loads
- [ ] Can sign up
- [ ] Can login
- [ ] Admin login works
- [ ] Dashboard works

---

## What Happens Next?

1. **Railway builds your app** (2-3 minutes)
   - Installs dependencies
   - Builds frontend
   - Starts server

2. **App goes live** at your Railway domain

3. **You can access**:
   - Landing page: `https://your-app.railway.app`
   - User signup: `https://your-app.railway.app/register`
   - User login: `https://your-app.railway.app/login`
   - Admin login: `https://your-app.railway.app/admin/login`
   - Dashboard: `https://your-app.railway.app/dashboard`

---

## Cost

- **Railway Free Tier**: $5 credit/month (enough for testing)
- **Supabase Free Tier**: 500MB database (enough for small app)
- **Total**: $0/month to start

When you need more:
- Railway Pro: $20/month
- Supabase Pro: $25/month

---

## Need Help?

1. Check deployment logs in Railway
2. Check browser console (F12)
3. Read DEPLOYMENT_CHECKLIST.md for detailed troubleshooting
4. Check ADMIN_TROUBLESHOOTING.md if admin login fails

---

## You're Ready!

Follow the 6 steps above and your app will be live in 15 minutes.

Good luck! 🚀
