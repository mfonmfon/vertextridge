# UserContext Fix - Portfolio Fields Not Loading

## Problem
Admin was updating portfolio values (profit, total_holdings, portfolio_value) in the database, but they weren't showing on the user dashboard. The values remained at $0.000000.

**Root Cause**: The UserContext was fetching the profile from the database but wasn't mapping the new columns to the user state object.

## Solution
Updated UserContext to include the new portfolio fields when building the user state.

## Changes Made

### File: `src/context/UserContext.jsx`

#### 1. Initial Auth Load (useEffect)
**Before:**
```javascript
const userState = {
  ...session.user,
  ...profile,
  balance: profile?.balance || 10500.25,
  kycStatus: profile?.kycStatus || 'unverified',
};
```

**After:**
```javascript
const userState = {
  ...session.user,
  ...profile,
  balance: profile?.balance || 10500.25,
  kycStatus: profile?.kycStatus || 'unverified',
  profit: profile?.profit || 0,
  total_holdings: profile?.total_holdings || 0,
  portfolio_value: profile?.portfolio_value || 0,
};
```

#### 2. Signup Function
**Before:**
```javascript
const userState = {
  ...data.user,
  name: userData.fullName,
  country: userData.country,
  balance: profileRes.profile?.balance || 10000.00,
  kycStatus: profileRes.profile?.kyc_status || 'unverified',
  email: userData.email
};
```

**After:**
```javascript
const userState = {
  ...data.user,
  name: userData.fullName,
  country: userData.country,
  balance: profileRes.profile?.balance || 10000.00,
  kycStatus: profileRes.profile?.kyc_status || 'unverified',
  email: userData.email,
  profit: profileRes.profile?.profit || 0,
  total_holdings: profileRes.profile?.total_holdings || 0,
  portfolio_value: profileRes.profile?.portfolio_value || 0,
};
```

#### 3. Login Function
**Before:**
```javascript
const userState = {
  ...data.user,
  name: profileRes.profile?.name || data.user.user_metadata?.full_name,
  country: profileRes.profile?.country,
  balance: profileRes.profile?.balance || 10000.00,
  kycStatus: profileRes.profile?.kyc_status || 'unverified',
};
```

**After:**
```javascript
const userState = {
  ...data.user,
  name: profileRes.profile?.name || data.user.user_metadata?.full_name,
  country: profileRes.profile?.country,
  balance: profileRes.profile?.balance || 10000.00,
  kycStatus: profileRes.profile?.kyc_status || 'unverified',
  profit: profileRes.profile?.profit || 0,
  total_holdings: profileRes.profile?.total_holdings || 0,
  portfolio_value: profileRes.profile?.portfolio_value || 0,
};
```

## How It Works

### Data Flow

```
1. Admin updates user in database
   ↓
2. User logs in or page refreshes
   ↓
3. UserContext calls onboardingService.getProfile()
   ↓
4. Backend returns profile with ALL columns (including new ones)
   ↓
5. UserContext maps profile fields to user state ✅ (NOW INCLUDES NEW FIELDS)
   ↓
6. Dashboard reads user.profit, user.total_holdings, user.portfolio_value
   ↓
7. Values display correctly! ✅
```

### Before vs After

**Before (Missing Fields):**
```javascript
user = {
  id: "123",
  email: "user@example.com",
  balance: 100.00,
  kycStatus: "verified"
  // ❌ profit: undefined
  // ❌ total_holdings: undefined
  // ❌ portfolio_value: undefined
}
```

**After (All Fields Included):**
```javascript
user = {
  id: "123",
  email: "user@example.com",
  balance: 100.00,
  kycStatus: "verified",
  profit: 5000.00,              // ✅ Now included!
  total_holdings: 10,           // ✅ Now included!
  portfolio_value: 50000.00     // ✅ Now included!
}
```

## Testing Steps

### Test 1: Fresh Login
1. Admin sets values for a user:
   - Balance: $100
   - Total Profit: $5,000
   - Holdings: 10
   - Portfolio Value: $50,000

2. User logs out completely

3. User logs back in

4. Dashboard should show:
   - Total Balance: $100.00 ✅
   - Portfolio P/L: +$5,000.00 ✅
   - Holdings: 10 ✅
   - Total Profit: +$5,000.00 ✅

### Test 2: Page Refresh
1. Admin updates user values while user is logged in

2. User refreshes the page (F5)

3. UserContext re-fetches profile on mount

4. Dashboard shows updated values ✅

### Test 3: New Signup
1. User signs up for new account

2. Admin immediately sets portfolio values

3. User refreshes page

4. Dashboard shows admin-set values ✅

## Important Notes

### Default Values
All new fields default to `0` if not set:
```javascript
profit: profile?.profit || 0
total_holdings: profile?.total_holdings || 0
portfolio_value: profile?.portfolio_value || 0
```

This ensures:
- No undefined errors
- Dashboard calculations work correctly
- Falls back to calculated values when admin hasn't set them

### Database Columns Required
Make sure you've run the SQL migration:
```sql
-- File: server/config/add_portfolio_columns.sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_holdings INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_value DECIMAL(15, 2) DEFAULT 0.00;
```

### Backend Already Working
The backend endpoint (`onboardingService.getProfile()`) was already returning these fields with `.select('*')`. The issue was only in the frontend mapping.

## Files Modified

1. ✅ `src/context/UserContext.jsx` - Added new fields to user state mapping

## Summary

The fix ensures that when the profile is fetched from the database, the new portfolio fields (`profit`, `total_holdings`, `portfolio_value`) are properly mapped to the user state object. This allows the Dashboard component to access and display these admin-set values correctly.

**Key Change**: Added 3 lines to each user state creation to include the new fields from the profile.

Now when admin updates these values, they will show correctly on the user dashboard after login or page refresh!
