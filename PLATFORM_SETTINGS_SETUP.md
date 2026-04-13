# Platform Settings Table Setup

The admin settings feature requires a `platform_settings` table in your Supabase database.

## Quick Setup

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL from `server/config/platform_settings_schema.sql`
4. Click "Run" to execute

## What This Creates

- `platform_settings` table with key-value pairs
- Default settings for:
  - Financial settings (signup bonus, fees, limits)
  - Bank details (account info, routing, SWIFT, IBAN)
  - System settings (maintenance mode)

## Verification

After running the SQL, you can verify by running:

```sql
SELECT * FROM platform_settings;
```

You should see all the default settings populated.

## Alternative: Manual Creation

If you prefer to create the table manually:

```sql
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Then insert default values as needed.
