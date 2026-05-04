# Admin Portfolio Edit Feature - Setup Guide

## Overview
This feature allows admins to edit user portfolio metrics including Total Profit, Holdings, and Portfolio Value directly from the admin dashboard.

## Database Setup

### Step 1: Run the SQL Migration
Execute the following SQL file in your Supabase SQL Editor:
```
vertextridge/server/config/add_portfolio_columns.sql
```

This will add two new columns to the `profiles` table:
- `total_holdings` (INTEGER) - Number of assets/holdings the user has
- `portfolio_value` (DECIMAL) - Total portfolio value

### Step 2: Verify Columns Were Added
Run this query to verify:
```sql
SELECT 
  id, 
  email, 
  balance, 
  profit, 
  total_holdings, 
  portfolio_value 
FROM profiles 
LIMIT 5;
```

## Features Added

### Editable Fields in Admin Dashboard

Admins can now edit the following user metrics:

1. **Name** - User's display name
2. **Country** - User's country
3. **Balance** - User's cash balance (already existed)
4. **Total Profit** - User's total profit/loss (already existed)
5. **Holdings** - Number of assets/trades user has (NEW)
6. **Portfolio Value** - Total portfolio value (NEW)

### UI Layout

The edit modal now has a cleaner 2-column grid layout:

**Row 1:**
- Name (full width)

**Row 2:**
- Country (full width)

**Row 3:**
- Balance | Total Profit

**Row 4:**
- Holdings | Portfolio Value

## How to Use

### From Admin Dashboard

1. Navigate to **Admin Dashboard** → **User Management**
2. Find the user you want to edit
3. Click the **Edit icon** (✏️) in the Actions column
4. In the modal, you'll see all editable fields:
   - **Balance**: User's available cash
   - **Total Profit**: Overall profit/loss (use negative for loss)
   - **Holdings**: Number of assets (e.g., 5 different cryptocurrencies)
   - **Portfolio Value**: Total value of all holdings
5. Update the values as needed
6. Click **Save Changes**

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| Balance | Decimal | Cash available for trading | $50.00 |
| Total Profit | Decimal | Cumulative profit/loss | +$1,234.56 or -$500.00 |
| Holdings | Integer | Number of different assets | 5 (means 5 different coins) |
| Portfolio Value | Decimal | Total value of all holdings | $5,000.00 |

### Calculation Example

If a user has:
- **Balance**: $50.00 (cash)
- **Holdings**: 3 assets (BTC, ETH, USDT)
- **Portfolio Value**: $5,000.00 (value of those 3 assets)
- **Total Profit**: +$1,000.00 (profit from all trades)

The user's dashboard would show:
- **Total Balance**: $50.00 (cash only)
- **Holdings**: 3 (number of assets)
- **Portfolio P/L**: Based on portfolio_value calculation
- **Total Profit**: +$1,000.00

## API Endpoint

The existing endpoint handles all updates:

```
PATCH /api/admin/users/:userId/profile
Body: {
  "name": "John Doe",
  "country": "USA",
  "balance": 50.00,
  "profit": 1234.56,
  "total_holdings": 5,
  "portfolio_value": 5000.00
}
```

## Files Modified

1. ✅ `server/config/add_portfolio_columns.sql` (NEW)
2. ✅ `src/page/admin/AdminUsers.jsx` (MODIFIED)
   - Added `total_holdings` and `portfolio_value` to form state
   - Updated edit modal UI with 2-column grid layout
   - Added new input fields with helper text

## Important Notes

### Data Consistency

- **Holdings** should match the actual number of assets in the `holdings` table
- **Portfolio Value** should reflect the current market value of all holdings
- **Total Profit** is cumulative across all trades
- **Balance** is separate from portfolio value (it's available cash)

### Best Practices

1. **Holdings Count**: Should be the number of unique assets, not total quantity
   - ✅ Correct: User has BTC, ETH, USDT = 3 holdings
   - ❌ Wrong: User has 0.5 BTC, 2 ETH, 100 USDT = 102.5 holdings

2. **Portfolio Value**: Should be calculated as:
   ```
   Portfolio Value = Sum of (quantity × current_price) for all holdings
   ```

3. **Total Profit**: Should include:
   - Realized profits from closed trades
   - Unrealized profits from open positions
   - Can be negative for losses

### Automation Considerations

For production, consider automating these calculations:

1. **Holdings**: Count from `holdings` table
   ```sql
   SELECT COUNT(*) FROM holdings WHERE user_id = ? AND quantity > 0
   ```

2. **Portfolio Value**: Calculate from holdings and current prices
   ```sql
   SELECT SUM(quantity * current_price) FROM holdings WHERE user_id = ?
   ```

3. **Total Profit**: Calculate from trades table
   ```sql
   SELECT SUM(profit_loss) FROM trades WHERE user_id = ? AND status = 'closed'
   ```

## Testing

### Test the Feature

1. Login as admin
2. Go to User Management
3. Click edit icon for any user
4. Update the new fields:
   - Set Holdings to 5
   - Set Portfolio Value to 10000.00
5. Save and verify the changes

### Verify Database

```sql
-- Check updated values
SELECT 
  email,
  balance,
  profit,
  total_holdings,
  portfolio_value,
  updated_at
FROM profiles
WHERE email = 'test@example.com';
```

## Troubleshooting

### Columns don't exist
- Run the SQL migration file in Supabase SQL Editor
- Check for any SQL errors in the logs

### Values not saving
- Check browser console for errors
- Verify API endpoint is accessible
- Check server logs for backend errors

### Values showing as 0
- Ensure you're entering valid numbers
- Check that the database columns accept the data types
- Verify RLS policies allow updates

## Future Enhancements

Potential improvements:
- Auto-calculate holdings from holdings table
- Auto-calculate portfolio value from current market prices
- Real-time profit/loss tracking
- Historical portfolio value charts
- Bulk edit multiple users
- Import/export portfolio data
