# ⚡ TradZ Quick Start Guide

Get your TradZ broker platform running in 5 minutes!

---

## 🎯 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Google Cloud Console account (for OAuth)

---

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 2. Run Interactive Setup

```bash
npm run setup
```

This will prompt you for:
- Supabase URL and keys
- Google Client ID
- Server configuration

### 3. Set Up Database

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Open your project
3. Click **SQL Editor** in the sidebar
4. Copy the entire contents of `server/config/database.sql`
5. Paste and click **Run**

✅ You should see "Success. No rows returned"

### 4. Get Supabase Credentials

In your Supabase project:
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → Use in setup
   - **anon public** key → Use in setup
   - **service_role** key → Use in setup (⚠️ Keep secret!)

### 5. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Add authorized origins:
   ```
   http://localhost:5173
   ```
6. Copy the **Client ID**

### 6. Start Development Servers

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

You should see:
```
⚡ TradZ API running on http://localhost:5000
Environment: development
Database: ✓ Connected
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

### 7. Test the Application

1. Open http://localhost:5173
2. Click **Sign Up**
3. Create an account
4. Try depositing funds
5. Execute a test trade

---

## ✅ Verify Everything Works

### Test Backend Health

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-...",
  "uptime": 1.234,
  "environment": "development"
}
```

### Test Database Connection

In Supabase Dashboard:
1. Go to **Table Editor**
2. You should see these tables:
   - profiles
   - transactions
   - trades
   - holdings
   - watchlist
   - audit_logs

### Test Authentication

1. Sign up with email/password
2. Check Supabase **Authentication** tab
3. You should see your new user
4. Check **Table Editor** → **profiles**
5. You should see your profile with $10,000 balance

---

## 🐛 Troubleshooting

### "Database: ✗ Disconnected"

**Solution:**
1. Check `server/.env` has correct Supabase credentials
2. Verify you ran the database schema
3. Check Supabase project is active

### "CORS Error" in Browser

**Solution:**
1. Check backend is running on port 5000
2. Verify `CORS_ORIGIN` in `server/.env` includes `http://localhost:5173`
3. Restart backend server

### "Google OAuth Not Working"

**Solution:**
1. Verify Client ID matches in both `.env` files
2. Check authorized origins in Google Console
3. Try in incognito mode
4. Clear browser cache

### "Cannot find module"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

cd server
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"

**Solution:**
```bash
# Kill process on port 5000 (backend)
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

---

## 📚 Next Steps

### Learn More
- Read [README.md](./README.md) for full documentation
- Check [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for deployment
- Review [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) for features

### Customize
- Modify starting balance in `server/controllers/authController.js`
- Change trading fee in `server/controllers/tradeController.js`
- Update rate limits in `server/.env`
- Customize UI in `src/` components

### Deploy
- Follow [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
- Use Railway, Render, or AWS for backend
- Use Vercel or Netlify for frontend

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review server logs in terminal
3. Check browser console for errors
4. Verify all environment variables are set
5. Ensure database schema was run successfully

---

## 🎉 You're Ready!

Your TradZ broker platform is now running locally. Start building your trading empire!

**Happy Trading! 📈**
