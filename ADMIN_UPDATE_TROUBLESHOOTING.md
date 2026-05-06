# Admin Update Troubleshooting Guide

## Problem
Admin updates to balance, profit, total_holdings, and portfolio_value are not saving.

## Root Causes & Solutions

### 1. Database Columns Missing
**Symptom**: Console shows warnings about columns not existing

**Fix**: Run `COMPLETE_ADMIN_UPDATE_FIX.sql` in Supabase SQL Editor

```sql
-- This will add all missing columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_holdings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(15, 2) DEFAULT 0.00;
```

### 2. Row Level Security (RLS) Blocking Updates
**Symptom**: Updates fail silently or return permission errors

**Fix**: Ensure service role has full access
```sql
CREATE POLICY "Service role full access"
ON profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### 3. Frontend Not Refreshing Data
**Symptom**: Updates save but user dashboard doesn't show changes

**Fix**: User needs to:
- Click "Refresh Data" button on dashboard
- Or logout and login again
- Or wait for auto-refresh (if implemented)

### 4. Invalid Data Types
**Symptom**: Updates fail with type conversion errors

**Fix**: Ensure data is properly parsed:
- `balance`: parseFloat()
- `profit`: parseFloat()
- `total_holdings`: parseInt()
- `portfolio_value`: parseFloat()

## Step-by-Step Debugging

### Step 1: Check Database Columns
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('balance', 'profit', 'total_holdings', 'portfolio_value')
ORDER BY column_name;
```

**Expected Result**: All 4 columns should exist

### Step 2: Check RLS Policies
```sql
SELECT policyname, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles';
```

**Expected Result**: Should see "Service role full access" policy

### Step 3: Test Direct Update
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

**Expected Result**: Values should update successfully

### Step 4: Check Backend Logs
Look for these console messages:
```
🔧 ADMIN UPDATE REQUEST: { userId, updates, timestamp }
📋 EXISTING USER DATA: { balance, profit, total_holdings, portfolio_value }
📝 EXISTING COLUMNS: [array of column names]
✅ ALLOWED UPDATES: { filtered updates }
🎉 PROFILE UPDATED SUCCESSFULLY: { updated values }
```

### Step 5: Check Frontend Logs
Look for these console messages:
```
🔧 ADMIN FORM: Updating user profile
🔧 ADMIN SERVICE: Updating user profile
✅ ADMIN SERVICE: Profile update response
✅ ADMIN FORM: Update successful
```

### Step 6: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make an admin update
4. Look for PATCH request to `/admin/users/{userId}/profile`
5. Check:
   - Request payload has correct data
   - Response status is 200
   - Response body contains updated user data

## Common Issues & Fixes

### Issue: "Column does not exist" error
**Solution**: Run `COMPLETE_ADMIN_UPDATE_FIX.sql`

### Issue: Updates save but dashboard doesn't update
**Solution**: 
1. User needs to refresh their dashboard
2. Or implement auto-refresh (see below)

### Issue: Permission denied error
**Solution**: Check RLS policies and service role key

### Issue: NaN or null values
**Solution**: Ensure form inputs are properly validated and parsed

### Issue: Updates work for balance but not profit/holdings
**Solution**: Columns might not exist - run SQL fix script

## Testing Checklist

- [ ] Run `COMPLETE_ADMIN_UPDATE_FIX.sql` in Supabase
- [ ] Verify all columns exist in database
- [ ] Verify RLS policies allow service role access
- [ ] Test direct SQL update works
- [ ] Test admin panel update
- [ ] Check backend console logs
- [ ] Check frontend console logs
- [ ] Check network requests
- [ ] Verify user dashboard shows updates after refresh

## Quick Fix Commands

### 1. Add All Columns
```bash
# Run in Supabase SQL Editor
psql -f COMPLETE_ADMIN_UPDATE_FIX.sql
```

### 2. Restart Backend Server
```bash
cd vertextridge/server
npm restart
```

### 3. Clear Browser Cache
```javascript
// Run in browser console
localStorage.clear();
location.reload();
```

## Prevention

To prevent this issue in the future:

1. **Always run migrations** when adding new columns
2. **Test admin updates** after any database changes
3. **Monitor backend logs** for errors
4. **Implement auto-refresh** on user dashboard
5. **Add validation** on admin form inputs

## Need More Help?

If issue persists:
1. Check all console logs (backend + frontend)
2. Verify Supabase service role key is correct
3. Test with Supabase dashboard directly
4. Check if other admin functions work
5. Verify network connectivity to Supabase
