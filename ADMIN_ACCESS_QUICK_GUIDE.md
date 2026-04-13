# Quick Guide: Access Admin Dashboard

## Step 1: Sign Up or Login

1. Go to http://localhost:5173
2. If you don't have an account, click "Sign Up" and create one
3. If you have an account, login with your credentials
4. Remember your email address!

## Step 2: Make Yourself an Admin

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your TradZ project
3. Click on **SQL Editor** in the left sidebar
4. Copy and paste this SQL query:

```sql
-- First, find your user ID
SELECT id, email FROM auth.users;
```

5. Click **Run** - you'll see a list of users
6. Find your email and copy the `id` (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

7. Now run this query (replace `YOUR_USER_ID` and `YOUR_EMAIL`):

```sql
INSERT INTO admin_users (user_id, email, role, permissions)
VALUES (
  'YOUR_USER_ID',  -- Paste your user ID here
  'YOUR_EMAIL',    -- Your email here
  'super_admin',
  '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true}'::jsonb
);
```

8. Click **Run**

## Step 3: Access Admin Dashboard

Now you can access the admin dashboard in two ways:

### Method A: Direct URL (Recommended)
1. Go to: **http://localhost:5173/admin**
2. You should see the admin dashboard!

### Method B: Via Admin Login Page
1. Logout from your current session
2. Go to: **http://localhost:5173/admin/login**
3. Login with your admin credentials
4. You'll be redirected to the admin dashboard

## What You Should See

The admin dashboard includes:
- **Statistics Cards**: Total users, trades, volume, balance
- **User Management Table**: List of all users with search
- **Platform Settings**: Configurable platform values
- **Actions**: Edit balances, update KYC, delete users

## Troubleshooting

### "Cannot access /admin"
- Make sure you're logged in first
- Check that you ran the SQL query to create admin user
- Verify the admin_users table exists

### "Access Denied"
- Run this SQL to verify you're an admin:
```sql
SELECT * FROM admin_users WHERE email = 'your-email@example.com';
```
- If no results, run the INSERT query again

### "Table admin_users does not exist"
- You need to run the admin schema SQL first
- Go to SQL Editor and run: `server/config/admin_schema.sql`

### Still Can't Access?
1. Check browser console (F12) for errors
2. Check server terminal for errors
3. Make sure both frontend and backend are running
4. Try logging out and back in

## Quick Test

Once you're in the admin dashboard, try:
1. Search for your username
2. Click edit on your balance
3. Change it to 1000
4. Add reason: "Testing"
5. Save and check your profile - balance should be updated!

## Admin Routes

- `/admin/login` - Admin login page
- `/admin` - Admin dashboard (main page)

That's it! You should now have full admin access.
