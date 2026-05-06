# Quick Fix Guide - Admin Updates Not Saving

## 🚀 5-Minute Fix

### Step 1: Run SQL Fix (2 minutes)
1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Copy and paste this:

```sql
-- Add missing columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_holdings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(15, 2) DEFAULT 0.00;

-- Fix RLS policies
DROP POLICY IF EXISTS "Service role full access" ON profiles;

CREATE POLICY "Service role full access"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('balance', 'profit', 'total_holdings', 'portfolio_value');
```

4. Click **Run**
5. Verify you see 4 columns in the result

### Step 2: Restart Backend (1 minute)
```bash
cd vertextridge/server
npm restart
```

### Step 3: Test Update (2 minutes)
1. Open admin panel
2. Click edit on any user
3. Change balance, profit, holdings, portfolio value
4. Click "Save Changes"
5. Should see success message

### Step 4: Verify (1 minute)
1. Login as that user
2. Click "Refresh Data" button
3. Should see updated values

## ✅ Done!

If it works, you're all set. If not, see `ADMIN_UPDATE_TROUBLESHOOTING.md` for detailed debugging.

## Quick Test

Run this SQL to test directly:
```sql
-- Replace with actual user email
UPDATE profiles 
SET 
  balance = 5000.00,
  profit = 60.00,
  total_holdings = 30,
  portfolio_value = 5060.00,
  updated_at = NOW()
WHERE email = 'test@example.com';

-- Verify
SELECT email, balance, profit, total_holdings, portfolio_value
FROM profiles
WHERE email = 'test@example.com';
```

If this works but admin panel doesn't, check:
- Backend server is running
- Service role key is in `.env`
- Console logs for errors

## Still Not Working?

1. Check `ADMIN_UPDATE_TROUBLESHOOTING.md`
2. Use `TEST_ADMIN_UPDATE.html` to test
3. Check console logs (F12 in browser)
4. Verify backend logs

## Key Files
- `COMPLETE_ADMIN_UPDATE_FIX.sql` - Full database fix
- `ADMIN_UPDATE_TROUBLESHOOTING.md` - Detailed debugging
- `TEST_ADMIN_UPDATE.html` - Browser test tool
- `ADMIN_UPDATE_FIX_SUMMARY.md` - Complete documentation
