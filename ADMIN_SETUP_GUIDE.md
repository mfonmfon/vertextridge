# Admin Dashboard Setup Guide

This guide explains how to set up and use the admin dashboard for managing the TradZ platform.

## Overview

The admin dashboard allows you to:
- View platform statistics (users, trades, volume, balance)
- Manage user accounts and balances
- Update KYC verification status
- Configure platform settings
- View activity logs
- Delete user accounts

## Database Setup

First, you need to create the admin tables in your Supabase database.

### Step 1: Run Admin Schema SQL

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Run the SQL script from `server/config/admin_schema.sql`

This will create:
- `admin_users` table
- `platform_settings` table with default values
- `admin_activity_logs` table
- Row Level Security (RLS) policies

### Step 2: Create Your First Admin User

Run this SQL in Supabase SQL Editor:

```sql
-- First, sign up a regular user account through the app
-- Then promote that user to admin:

INSERT INTO admin_users (user_id, email, role, permissions)
VALUES (
  'YOUR_USER_ID_HERE',  -- Get this from auth.users table
  'admin@yourdomain.com',
  'super_admin',
  '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true, "can_delete_users": true, "can_edit_settings": true}'::jsonb
);
```

To find your user ID:
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

## Accessing the Admin Dashboard

1. **Login** with your admin account at `/admin/login`
2. **Navigate** to `/admin/dashboard`

## Admin Features

### Dashboard Statistics

View real-time platform metrics:
- Total registered users
- Total trades executed
- Total transaction volume
- Total user balances

### User Management

**Search Users**: Find users by name or email

**Update Balance**:
1. Click the edit icon next to a user's balance
2. Enter new balance amount
3. Provide a reason for the change
4. Click checkmark to save

**Update KYC Status**:
- Select from dropdown: Unverified, Pending, Verified, Rejected
- Changes are saved automatically
- Users receive email notifications (if configured)

**Delete User**:
- Click trash icon
- Confirm deletion
- All user data is permanently removed

### Platform Settings

Configure platform-wide settings:

- **Signup Bonus**: Initial balance for new users (default: $50)
- **Trading Fee**: Fee percentage per trade (default: 0.1%)
- **Withdrawal Fee**: Fixed fee for withdrawals (default: $2.50)
- **Min Deposit**: Minimum deposit amount (default: $10)
- **Min Withdrawal**: Minimum withdrawal amount (default: $20)
- **Maintenance Mode**: Enable/disable platform access

Changes are saved automatically when you blur the input field.

### Activity Logs

View all admin actions:
- Balance updates
- KYC status changes
- Setting modifications
- User deletions

Logs include:
- Admin who performed the action
- Target user (if applicable)
- Action details
- Timestamp
- IP address

## Admin Roles

### Admin
- View dashboard statistics
- View user list
- Update user balances
- Update KYC status
- View activity logs

### Super Admin
All admin permissions plus:
- Delete user accounts
- Modify platform settings
- Manage other admins

## Security Best Practices

1. **Use Strong Passwords**: Require complex passwords for admin accounts
2. **Enable 2FA**: Set up two-factor authentication
3. **Limit Admin Access**: Only create admin accounts when necessary
4. **Monitor Activity Logs**: Regularly review admin actions
5. **Rotate Credentials**: Change admin passwords periodically
6. **Use HTTPS**: Always access admin panel over secure connection
7. **IP Whitelisting**: Consider restricting admin access by IP

## API Endpoints

The admin dashboard uses these API endpoints:

```
GET    /api/admin/stats              - Dashboard statistics
GET    /api/admin/users              - List users (with pagination)
PATCH  /api/admin/users/:id/balance  - Update user balance
PATCH  /api/admin/users/:id/kyc      - Update KYC status
DELETE /api/admin/users/:id          - Delete user
GET    /api/admin/settings           - Get platform settings
PUT    /api/admin/settings           - Update platform setting
GET    /api/admin/activity-logs      - Get activity logs
```

## Troubleshooting

### Cannot Access Admin Dashboard

**Issue**: Getting "Access Denied" error

**Solution**:
1. Verify your user is in the `admin_users` table
2. Check that `user_id` matches your auth user ID
3. Ensure RLS policies are enabled
4. Try logging out and back in

### Settings Not Saving

**Issue**: Platform settings changes don't persist

**Solution**:
1. Check browser console for errors
2. Verify `platform_settings` table exists
3. Ensure your admin role has permission
4. Check that the setting key exists in the table

### Users Not Appearing

**Issue**: User list is empty

**Solution**:
1. Verify users exist in `profiles` table
2. Check pagination settings
3. Clear search filters
4. Refresh the page

## Customization

### Adding New Settings

1. **Add to database**:
```sql
INSERT INTO platform_settings (key, value, description)
VALUES ('new_setting', '100', 'Description of new setting');
```

2. **Update AdminDashboard.jsx** to display the new setting

### Custom Admin Permissions

Modify the `permissions` JSONB field in `admin_users`:

```sql
UPDATE admin_users
SET permissions = '{"can_edit_balances": true, "can_view_reports": true, "custom_permission": true}'::jsonb
WHERE email = 'admin@example.com';
```

### Email Notifications

Admin actions can trigger email notifications:
- Balance changes
- KYC status updates
- Account suspensions

Configure in `server/services/emailService.js`

## Monitoring

### Key Metrics to Monitor

1. **User Growth**: Track new signups daily
2. **Trading Volume**: Monitor total trade value
3. **Balance Changes**: Watch for unusual balance modifications
4. **Failed Transactions**: Identify payment issues
5. **KYC Completion Rate**: Track verification progress

### Setting Up Alerts

Consider setting up alerts for:
- Large balance changes (> $10,000)
- Multiple failed login attempts
- Unusual trading patterns
- System errors

## Backup and Recovery

### Database Backups

Supabase automatically backs up your database, but you should also:

1. **Export admin data regularly**:
```sql
COPY admin_activity_logs TO '/path/to/backup.csv' CSV HEADER;
```

2. **Test restore procedures** periodically

3. **Keep offline backups** of critical data

## Support

For issues or questions:
1. Check server logs for errors
2. Review Supabase dashboard for database issues
3. Verify admin permissions in database
4. Check browser console for frontend errors

## Future Enhancements

Consider adding:
- [ ] Bulk user operations
- [ ] Advanced analytics and reporting
- [ ] User communication tools
- [ ] Automated fraud detection
- [ ] Export functionality for reports
- [ ] Real-time notifications
- [ ] Multi-factor authentication
- [ ] Audit trail export
