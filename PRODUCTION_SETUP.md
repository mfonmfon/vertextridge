# TradZ Broker Platform - Production Setup Guide

## 🚀 Quick Start

This guide will help you set up your TradZ broker platform for production deployment.

---

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account ([https://supabase.com](https://supabase.com))
- Google Cloud Console account (for OAuth)

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details and wait for setup to complete

### Step 2: Run Database Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Copy the entire contents of `server/config/database.sql`
4. Paste into the SQL Editor and click **Run**

This will create:
- All required tables (profiles, transactions, trades, holdings, watchlist, audit_logs)
- Indexes for performance optimization
- Row Level Security (RLS) policies
- Database functions for atomic operations
- Triggers for automatic timestamp updates

### Step 3: Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NEVER expose this to frontend!**

---

## 🔐 Google OAuth Setup

### Step 1: Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted
6. Application type: **Web application**
7. Add authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:5174
   https://yourdomain.com
   ```
8. Add authorized redirect URIs:
   ```
   http://localhost:5173
   https://yourdomain.com
   ```
9. Copy the **Client ID**

---

## ⚙️ Environment Configuration

### Backend Configuration (`server/.env`)

```env
PORT=5000
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Security
JWT_SECRET=generate-a-strong-random-secret-here
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Frontend Configuration (`.env`)

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_URL=https://your-api-domain.com/api
```

---

## 📦 Installation

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
npm install
```

---

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
cd server
npm run dev
```

Check the console output:
```
⚡ TradZ API running on http://localhost:5000
Environment: development
Database: ✓ Connected
```

### 2. Test Health Endpoint

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "database": "connected",
  "uptime": 1.234,
  "environment": "development"
}
```

### 3. Test Frontend

```bash
npm run dev
```

Visit `http://localhost:5173` and test:
- User signup
- User login
- Google OAuth login
- Deposit/Withdrawal
- Trading functionality

---

## 🔒 Security Checklist

### Before Production Deployment:

- [ ] Change all default secrets and keys
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Never commit `.env` files to version control
- [ ] Verify RLS policies are enabled in Supabase
- [ ] Test rate limiting is working
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domains only
- [ ] Set NODE_ENV=production
- [ ] Review and test all authentication flows
- [ ] Enable Supabase email verification
- [ ] Set up monitoring and logging (Sentry, Datadog, etc.)
- [ ] Configure database backups
- [ ] Test error handling and edge cases

---

## 🚀 Production Deployment

### Backend Deployment (Recommended: Railway, Render, or AWS)

#### Using Railway:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set SUPABASE_URL=your-url
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key
# ... add all other variables

# Deploy
railway up
```

#### Using Render:

1. Connect your GitHub repository
2. Create new **Web Service**
3. Build command: `cd server && npm install`
4. Start command: `cd server && npm start`
5. Add all environment variables in dashboard

### Frontend Deployment (Recommended: Vercel, Netlify)

#### Using Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

#### Using Netlify:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

---

## 📊 Monitoring & Maintenance

### Recommended Tools:

1. **Error Tracking**: Sentry
2. **Logging**: Datadog, CloudWatch, or LogRocket
3. **Uptime Monitoring**: UptimeRobot, Pingdom
4. **Performance**: New Relic, AppDynamics
5. **Database**: Supabase built-in monitoring

### Key Metrics to Monitor:

- API response times
- Error rates
- Database query performance
- User authentication success/failure rates
- Trading volume and transaction counts
- Balance update accuracy

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check Supabase credentials
curl https://your-project.supabase.co/rest/v1/

# Verify service role key has correct permissions
```

### Authentication Failures

- Verify JWT tokens are being sent correctly
- Check CORS configuration
- Ensure Supabase Auth is enabled
- Verify email confirmation settings

### Google OAuth Not Working

- Check authorized origins and redirect URIs
- Verify Client ID matches in both frontend and backend
- Test in incognito mode to rule out cookie issues

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Check Supabase dashboard for database issues
4. Verify all environment variables are set correctly

---

## 📝 License

Proprietary - TradZ Broker Platform
