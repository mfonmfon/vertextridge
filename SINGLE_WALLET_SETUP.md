# Single Bitcoin Wallet Setup for All Users

## Overview
All users (existing and new) will use the same Bitcoin address for deposits:
**`bc1q8mnrq2866x49ec6y0r22t2kfm9044svwzlmy0h`**

## What Was Changed

### 1. New User Signup
- Every new user automatically gets the fixed Bitcoin address
- File: `server/controllers/authController.js`
- Happens during signup process

### 2. Admin Wallet Generation
- Admin can still "generate" wallets, but it always uses the fixed address
- File: `server/controllers/adminController.js`
- Removed random address generation function

### 3. Existing Users
- Need to run migration to add wallet to all existing users
- Two options: SQL script or Node.js script

## Setup Instructions

### Option 1: Using SQL (Recommended - Fastest)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `UPDATE_ALL_WALLETS.sql`
4. Click "Run"
5. Verify the results show all users have the wallet

### Option 2: Using Node.js Script

1. Open terminal in the server directory:
   ```bash
   cd vertextridge/server
   ```

2. Run the migration script:
   ```bash
   node scripts/addWalletToAllUsers.js
   ```

3. Check the output for success/error counts

## Verification

### Check in Supabase:
```sql
SELECT 
  COUNT(*) as total_wallets,
  COUNT(DISTINCT address) as unique_addresses,
  address
FROM wallet_addresses
WHERE currency = 'BTC'
GROUP BY address;
```

**Expected Result:**
- `total_wallets`: Should equal number of users
- `unique_addresses`: Should be 1
- `address`: Should be `bc1q8mnrq2866x49ec6y0r22t2kfm9044svwzlmy0h`

### Check in Application:
1. Login as any user
2. Go to Deposit page
3. Select Bitcoin
4. Should see the address: `bc1q8mnrq2866x49ec6y0r22t2kfm9044svwzlmy0h`

## How It Works

### For New Users:
1. User signs up
2. Profile created
3. **Automatically**: Bitcoin wallet created with fixed address
4. User can immediately deposit

### For Existing Users (After Migration):
1. Migration script runs
2. Checks all users in `profiles` table
3. Creates/updates wallet entry for each user
4. All users now have the same Bitcoin address

### For Deposits:
1. User goes to deposit page
2. Selects Bitcoin
3. System shows the fixed address
4. User sends Bitcoin to that address
5. **Important**: You need to manually track which user sent funds (using transaction IDs or amounts)

## Important Notes

### ⚠️ Tracking Deposits
Since all users use the same address, you need to:
1. Ask users to enter transaction ID after sending
2. Or ask users to send a specific amount
3. Or manually match deposits to users based on timing/amount

### 💡 Recommendation
Consider adding a deposit tracking system:
- User initiates deposit
- System generates unique amount (e.g., $100.23 instead of $100.00)
- User sends that exact amount
- System matches deposit to user based on amount

### 🔒 Security
- The Bitcoin address is public (safe to share)
- Never share the private key
- Keep private key secure and backed up
- Consider using a hardware wallet for the private key

## Files Modified

1. ✅ `server/controllers/authController.js`
   - Added automatic wallet creation on signup

2. ✅ `server/controllers/adminController.js`
   - Changed to use fixed address
   - Removed random address generation

3. ✅ `UPDATE_ALL_WALLETS.sql`
   - SQL script to update all existing users

4. ✅ `server/scripts/addWalletToAllUsers.js`
   - Node.js script to update all existing users

## Testing Checklist

- [ ] Run migration script (SQL or Node.js)
- [ ] Verify all users have wallet in database
- [ ] Create new test user
- [ ] Check new user has Bitcoin wallet automatically
- [ ] Login as existing user
- [ ] Check deposit page shows correct address
- [ ] Admin generates wallet for user
- [ ] Verify it uses the fixed address

## Troubleshooting

### Issue: Some users don't have wallet
**Solution**: Run the migration script again (it's safe to run multiple times)

### Issue: Wrong address showing
**Solution**: 
1. Check database: `SELECT * FROM wallet_addresses WHERE currency = 'BTC' LIMIT 5;`
2. Verify address is correct
3. Clear browser cache and reload

### Issue: Admin can't generate wallet
**Solution**: Check server logs for errors, ensure user exists in database

## Next Steps

After setup:
1. Test with a small deposit
2. Verify you can track the deposit
3. Implement deposit tracking system
4. Train support team on manual deposit matching
5. Consider automated deposit tracking solution
