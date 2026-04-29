# Add Profit Column to Profiles Table

## Issue
The admin edit profile feature includes a profit/loss field, but the `profit` column doesn't exist in the `profiles` table yet.

## Solution
Run the SQL migration to add the profit column.

## Steps

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the SQL from `server/config/add_profit_column.sql`:

```sql
-- Add profit column to profiles table
-- This allows admins to set user profit/loss

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profit DECIMAL(15, 2) DEFAULT 0.00;

-- Add comment
COMMENT ON COLUMN profiles.profit IS 'User profit/loss - positive for profit, negative for loss';
```

6. Click "Run" to execute the SQL
7. Verify the column was added by checking the profiles table structure

## After Running Migration

Once the profit column is added:
- Admins can edit user profit/loss from the admin dashboard
- Positive values = profit
- Negative values = loss
- The field will display in the user's dashboard

## Note

The code is designed to work even if the profit column doesn't exist yet - it will simply skip updating that field. However, to use the full functionality, you should add the column.
