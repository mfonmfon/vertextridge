# Vertex Ridge Deployment - Visual Guide

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR DEPLOYMENT STACK                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   RAILWAY    │      │   SUPABASE   │      │   GMAIL   │ │
│  │              │      │              │      │           │ │
│  │  Frontend +  │─────▶│   Database   │      │   Email   │ │
│  │   Backend    │      │   + Auth     │      │  Service  │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                      │                     │      │
│         │                      │                     │      │
│         └──────────────────────┴─────────────────────┘      │
│                            │                                │
│                            ▼                                │
│                   ┌─────────────────┐                       │
│                   │   YOUR USERS    │                       │
│                   │  (Web Browser)  │                       │
│                   └─────────────────┘                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: PREPARE DATABASE                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  You (Local) ──────▶ Supabase SQL Editor                   │
│                                                              │
│  Actions:                                                    │
│  1. Run database.sql                                        │
│  2. Run admin_schema.sql                                    │
│  3. Run other schema files                                  │
│  4. Create admin user                                       │
│                                                              │
│  Result: ✅ Database ready with all tables                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: PUSH TO GITHUB                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Your Code (Local) ──────▶ GitHub Repository               │
│                                                              │
│  Commands:                                                   │
│  $ git add .                                                │
│  $ git commit -m "Deploy"                                   │
│  $ git push origin main                                     │
│                                                              │
│  Result: ✅ Code backed up and ready for deployment         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: DEPLOY ON RAILWAY                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  GitHub ──────▶ Railway ──────▶ Build ──────▶ Deploy       │
│                                                              │
│  Railway does:                                               │
│  1. Clone your repo                                         │
│  2. Install dependencies (npm install)                      │
│  3. Build frontend (npm run build)                          │
│  4. Start server (npm run server:prod)                      │
│                                                              │
│  Result: ✅ App live at your-app.railway.app                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: CONFIGURE ENVIRONMENT                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Railway Dashboard ──────▶ Add Variables ──────▶ Redeploy  │
│                                                              │
│  Variables needed:                                           │
│  • SUPABASE_URL                                             │
│  • SUPABASE_ANON_KEY                                        │
│  • SUPABASE_SERVICE_ROLE_KEY                                │
│  • JWT_SECRET                                               │
│  • SMTP credentials                                         │
│  • CORS_ORIGIN                                              │
│  • VITE_API_URL                                             │
│                                                              │
│  Result: ✅ App configured and working                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure for Deployment

```
vertex-ridge/
│
├── 📁 server/                    ← Backend (Node.js + Express)
│   ├── index.js                  ← Main server file
│   ├── package.json              ← Backend dependencies
│   ├── .env                      ← Backend environment (local only)
│   ├── 📁 config/                ← Database schemas
│   ├── 📁 controllers/           ← Business logic
│   ├── 📁 routes/                ← API endpoints
│   └── 📁 middleware/            ← Auth & validation
│
├── 📁 src/                       ← Frontend (React + Vite)
│   ├── App.jsx                   ← Main React component
│   ├── main.jsx                  ← React entry point
│   ├── 📁 page/                  ← All pages
│   ├── 📁 component/             ← Reusable components
│   └── 📁 services/              ← API calls
│
├── 📁 dist/                      ← Built frontend (created by npm run build)
│   ├── index.html                ← Entry point
│   ├── assets/                   ← JS, CSS, images
│   └── ...
│
├── package.json                  ← Root dependencies + scripts
├── railway.json                  ← Railway configuration
├── vite.config.js                ← Vite build config
└── .env                          ← Frontend environment (local only)

DEPLOYMENT FLOW:
1. npm run build → Creates dist/ folder
2. npm run server:prod → Starts server
3. Server serves dist/ files + API routes
```

---

## How It Works in Production

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REQUEST FLOW                         │
└─────────────────────────────────────────────────────────────┘

User visits: https://your-app.railway.app
                        │
                        ▼
            ┌───────────────────────┐
            │   Railway Server      │
            │   (Node.js Express)   │
            └───────────────────────┘
                        │
                        ├─── Is it /api/* ?
                        │
        ┌───────────────┴───────────────┐
        │                               │
       YES                             NO
        │                               │
        ▼                               ▼
┌──────────────┐              ┌──────────────┐
│ API Routes   │              │ Static Files │
│              │              │              │
│ /api/auth    │              │ index.html   │
│ /api/user    │              │ assets/      │
│ /api/trade   │              │ (React App)  │
│ /api/admin   │              │              │
└──────────────┘              └──────────────┘
        │                               │
        ▼                               ▼
┌──────────────┐              ┌──────────────┐
│  Supabase    │              │ User Browser │
│  Database    │              │ (React runs) │
└──────────────┘              └──────────────┘
```

---

## Environment Variables Map

```
┌─────────────────────────────────────────────────────────────┐
│ WHERE TO GET EACH ENVIRONMENT VARIABLE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ SUPABASE_URL                                                │
│ └─▶ Supabase Dashboard → Settings → API → Project URL      │
│                                                              │
│ SUPABASE_ANON_KEY                                           │
│ └─▶ Supabase Dashboard → Settings → API → anon public      │
│                                                              │
│ SUPABASE_SERVICE_ROLE_KEY                                   │
│ └─▶ Supabase Dashboard → Settings → API → service_role     │
│     ⚠️  Keep this secret!                                   │
│                                                              │
│ JWT_SECRET                                                   │
│ └─▶ Generate random string (32+ characters)                │
│     Example: openssl rand -base64 32                        │
│                                                              │
│ SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS                 │
│ └─▶ Gmail: smtp.gmail.com, 587, your-email, app-password  │
│     Get app password: Google Account → Security → App Pass │
│                                                              │
│ CORS_ORIGIN, FRONTEND_URL                                   │
│ └─▶ Your Railway domain (after first deployment)           │
│     Example: https://vertex-ridge.railway.app               │
│                                                              │
│ VITE_API_URL                                                │
│ └─▶ Your Railway domain + /api                             │
│     Example: https://vertex-ridge.railway.app/api           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Timeline

```
┌─────────────────────────────────────────────────────────────┐
│ WHAT HAPPENS WHEN YOU DEPLOY                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 00:00  Push to GitHub                                       │
│   │                                                          │
│   ▼                                                          │
│ 00:30  Railway detects push                                 │
│   │                                                          │
│   ▼                                                          │
│ 01:00  Clone repository                                     │
│   │                                                          │
│   ▼                                                          │
│ 01:30  Install dependencies (npm install)                   │
│   │    - Root package.json                                  │
│   │    - Server package.json                                │
│   │                                                          │
│   ▼                                                          │
│ 03:00  Build frontend (npm run build)                       │
│   │    - Vite compiles React                                │
│   │    - Creates dist/ folder                               │
│   │    - Optimizes assets                                   │
│   │                                                          │
│   ▼                                                          │
│ 04:00  Start server (npm run server:prod)                   │
│   │    - cd server && npm start                             │
│   │    - Server listens on PORT                             │
│   │                                                          │
│   ▼                                                          │
│ 04:30  Health check                                         │
│   │    - Railway pings /api/health                          │
│   │    - Verifies server is running                         │
│   │                                                          │
│   ▼                                                          │
│ 05:00  ✅ DEPLOYMENT COMPLETE                               │
│        App is live!                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting Decision Tree

```
                    Deployment Failed?
                           │
                           ▼
                    Check Logs
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    Build Error      Runtime Error      Connection Error
        │                  │                  │
        ▼                  ▼                  ▼
  Missing deps?      Wrong PORT?      Wrong Supabase URL?
  Syntax error?      Missing env var?  Network issue?
        │                  │                  │
        ▼                  ▼                  ▼
  Fix & redeploy    Add variable      Check credentials
                    & redeploy        & redeploy
```

---

## Success Indicators

```
✅ Deployment Successful When:

┌─────────────────────────────────────────────────────────────┐
│ 1. Build Logs Show:                                         │
│    ✓ Dependencies installed                                 │
│    ✓ Build completed                                        │
│    ✓ Server started                                         │
│    ✓ Database connected                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. Health Check Returns:                                    │
│    {                                                         │
│      "status": "ok",                                        │
│      "database": "connected"                                │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. App Works:                                               │
│    ✓ Landing page loads                                     │
│    ✓ Can sign up                                            │
│    ✓ Can login                                              │
│    ✓ Dashboard displays                                     │
│    ✓ Admin panel accessible                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

### Deploy Command
```bash
git push origin main
```

### Check Logs
```
Railway Dashboard → Deployments → View Logs
```

### Test Health
```bash
curl https://your-app.railway.app/api/health
```

### Redeploy
```
Railway Dashboard → Redeploy
```

### Rollback
```
Railway Dashboard → Deployments → Select Previous → Redeploy
```

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Create admin user
3. ✅ Invite beta users
4. ✅ Monitor logs for 24 hours
5. ✅ Set up custom domain (optional)
6. ✅ Configure monitoring alerts
7. ✅ Plan regular backups

---

**You're ready to deploy! Follow DEPLOY_NOW.md for step-by-step instructions.**
