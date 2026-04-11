# 🎯 START HERE - TradZ Setup Guide

## Welcome to TradZ! 👋

Your broker platform has been upgraded to production-grade standards. Follow this guide to get started.

---

## 📋 What You Need

Before starting, make sure you have:

- ✅ Node.js 18+ installed ([Download](https://nodejs.org))
- ✅ A Supabase account ([Sign up free](https://supabase.com))
- ✅ A Google Cloud account ([Sign up](https://console.cloud.google.com))

---

## 🚀 Setup in 3 Steps

### Step 1: Install Everything

Open your terminal and run:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

⏱️ This takes about 2-3 minutes.

---

### Step 2: Configure Your App

Run the interactive setup wizard:

```bash
npm run setup
```

The wizard will ask you for:
1. **Supabase URL** - Get from [Supabase Dashboard](https://app.supabase.com) → Settings → API
2. **Supabase Keys** - Same place, copy both anon and service_role keys
3. **Google Client ID** - Get from [Google Console](https://console.cloud.google.com) → Credentials

💡 **Tip**: Keep your Supabase and Google Console tabs open!

---

### Step 3: Set Up Database

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Click **SQL Editor** in the left sidebar
3. Open the file `server/config/database.sql` in your code editor
4. Copy ALL the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **Run** (bottom right)

✅ You should see "Success. No rows returned"

---

## 🎉 Start Your App

Open **TWO** terminal windows:

### Terminal 1 - Backend
```bash
cd server
npm run dev
```

You should see:
```
⚡ TradZ API running on http://localhost:5000
Database: ✓ Connected
```

### Terminal 2 - Frontend
```bash
npm run dev
```

You should see:
```
➜ Local: http://localhost:5173/
```

---

## 🌐 Open Your Browser

Go to: **http://localhost:5173**

You should see your TradZ landing page! 🎊

---

## ✅ Test Everything

1. Click **Sign Up** and create an account
2. Check your balance (should be $10,000)
3. Try depositing $1,000
4. Go to Markets and try a test trade
5. Check your portfolio

---

## 🐛 Something Not Working?

### Backend won't start?

**Check this:**
```bash
# Test if backend is running
curl http://localhost:5000/api/health
```

**Common fixes:**
- Make sure you ran `npm install` in the `server` folder
- Check that `server/.env` file exists
- Verify Supabase credentials are correct

### Frontend shows errors?

**Common fixes:**
- Make sure backend is running first
- Check that `.env` file exists in root folder
- Clear browser cache and reload
- Check browser console for errors (F12)

### Database connection failed?

**Check this:**
1. Did you run the SQL schema in Supabase?
2. Are your Supabase credentials correct in `server/.env`?
3. Is your Supabase project active?

### Still stuck?

Check the detailed troubleshooting guide: [QUICKSTART.md](./QUICKSTART.md#-troubleshooting)

---

## 📚 What's Next?

### Learn More
- 📖 [README.md](./README.md) - Full documentation
- ⚡ [QUICKSTART.md](./QUICKSTART.md) - Detailed setup guide
- 🚀 [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) - Deploy to production
- 🔒 [SECURITY.md](./SECURITY.md) - Security best practices

### Customize Your App
- Change starting balance: `server/controllers/authController.js` (line 42)
- Modify trading fee: `server/controllers/tradeController.js` (line 21)
- Update rate limits: `server/.env` (RATE_LIMIT_* variables)
- Customize UI: Files in `src/` folder

### Deploy to Production
When you're ready to go live, follow: [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)

---

## 🎯 Quick Reference

### Important Files

| File | Purpose |
|------|---------|
| `server/.env` | Backend configuration |
| `.env` | Frontend configuration |
| `server/config/database.sql` | Database schema |
| `server/index.js` | Backend server |
| `src/main.jsx` | Frontend entry point |

### Important URLs

| URL | Purpose |
|-----|---------|
| http://localhost:5173 | Your app |
| http://localhost:5000/api/health | Backend health check |
| https://app.supabase.com | Supabase dashboard |
| https://console.cloud.google.com | Google OAuth setup |

### Important Commands

```bash
# Start backend
cd server && npm run dev

# Start frontend
npm run dev

# Run setup wizard
npm run setup

# Install dependencies
npm install
cd server && npm install
```

---

## 🆘 Need Help?

1. **Quick issues**: Check [QUICKSTART.md](./QUICKSTART.md#-troubleshooting)
2. **Deployment**: See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
3. **Features**: Review [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
4. **Security**: Read [SECURITY.md](./SECURITY.md)

---

## 🎊 You're All Set!

Your TradZ broker platform is now running locally. Time to start trading! 📈

**Happy Trading!** 🚀

---

**Pro Tip**: Bookmark this page for quick reference!
