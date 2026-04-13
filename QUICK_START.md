# Quick Start Guide - TradZ Platform

Get up and running in 10 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Gmail account (for email notifications)

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd tradz

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

## Step 2: Set Up Supabase (3 minutes)

1. Go to https://supabase.com and create a new project
2. Wait for the project to be ready (2-3 minutes)
3. Go to **SQL Editor** and run these scripts in order:
   - Copy and paste `server/config/database.sql` → Click Run
   - Copy and paste `server/config/admin_schema.sql` → Click Run
   - Copy and paste `server/config/notifications_schema.sql` → Click Run
   - Copy and paste `server/config/copy_trading_schema.sql` → Click Run

4. Go to **Settings** → **API** and copy:
   - Project URL
   - anon public key
   - service_role key (click "Reveal" to see it)

## Step 3: Configure Environment Variables (2 minutes)

### Backend Configuration

Create `server/.env`:
```env
# Supabase (paste your values from Step 2)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google OAuth (optional - skip for now)
GOOGLE_CLIENT_ID=

# Security
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173

# Email (Gmail - optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=TradZ
SMTP_FROM_EMAIL=noreply@tradz.com
FRONTEND_URL=http://localhost:5173

# Other
NODE_ENV=development
```

### Frontend Configuration

Create `.env` in the root directory:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_CLIENT_ID=
```

## Step 4: Start the Application (1 minute)

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on port 3000
✅ Database connected
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

## Step 5: Test the Application (2 minutes)

1. Open http://localhost:5173 in your browser
2. Click "Sign Up"
3. Create an account with:
   - Name: Test User
   - Email: test@example.com
   - Password: Test1234
   - Country: United States
4. You should be logged in with $50.00 balance!

## Step 6: Create Admin User (Optional)

1. After signing up, go to Supabase → **SQL Editor**
2. Run this query to get your user ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'test@example.com';
```

3. Copy the `id` and run:
```sql
INSERT INTO admin_users (user_id, email, role)
VALUES ('paste-your-id-here', 'test@example.com', 'super_admin');
```

4. Now visit http://localhost:5173/admin/dashboard
5. You should see the admin dashboard!

## Optional: Set Up Gmail for Email Notifications

1. Go to https://myaccount.google.com/apppasswords
2. Sign in to your Google account
3. Create a new app password:
   - App: Mail
   - Device: Your computer
4. Copy the 16-character password
5. Update `server/.env`:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # paste the app password
```
6. Restart the backend server
7. Sign up a new user and check your email!

## Troubleshooting

### "Database connection failed"
- Check your Supabase URL and keys in `.env`
- Make sure you ran all SQL scripts
- Verify your Supabase project is active

### "Cannot find module"
- Run `npm install` in both root and `server` directories
- Delete `node_modules` and reinstall if needed

### "Port already in use"
- Backend: Change port in `server/index.js`
- Frontend: Vite will automatically use next available port

### "CORS error"
- Check `CORS_ORIGIN` in `server/.env` matches your frontend URL
- Make sure both servers are running

### "Email not sending"
- Email is optional - app works without it
- Check SMTP credentials if you want emails
- See EMAIL_SETUP_GUIDE.md for detailed setup

## Next Steps

Now that you're up and running:

1. **Explore the Platform**:
   - Try trading some crypto
   - Add items to your watchlist
   - Check out the markets page
   - View your portfolio

2. **Customize**:
   - Update profile picture
   - Change settings
   - Complete KYC (if implemented)

3. **Admin Features** (if you created admin user):
   - View platform statistics
   - Manage users
   - Update platform settings
   - View activity logs

4. **Read Documentation**:
   - `ADMIN_SETUP_GUIDE.md` - Admin features
   - `EMAIL_SETUP_GUIDE.md` - Email configuration
   - `DEPLOYMENT_CHECKLIST.md` - Deploy to production
   - `IMPLEMENTATION_SUMMARY.md` - All features

## Common Tasks

### Reset Database
```sql
-- In Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run all SQL scripts
```

### Clear User Data
```sql
-- Delete all users (careful!)
DELETE FROM profiles;
DELETE FROM auth.users;
```

### View Logs
```bash
# Backend logs
cd server
npm run dev

# Check for errors in the console
```

## Support

If you get stuck:
1. Check the error message in the console
2. Review the troubleshooting section above
3. Check the documentation files
4. Verify all environment variables are set
5. Make sure both servers are running

## Success!

You should now have:
- ✅ Frontend running on http://localhost:5173
- ✅ Backend running on http://localhost:3000
- ✅ Database connected to Supabase
- ✅ User account created with $50 balance
- ✅ (Optional) Admin access configured
- ✅ (Optional) Email notifications working

Happy trading! 🚀
