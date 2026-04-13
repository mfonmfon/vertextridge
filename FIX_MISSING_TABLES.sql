-- ═══════════════════════════════════════════════════════════════
-- FIX MISSING TABLES - Run this if you get 500 errors
-- ═══════════════════════════════════════════════════════════════

-- Create platform_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('signup_bonus', '50.00', 'Initial balance for new users'),
  ('trading_fee', '0.001', 'Trading fee percentage'),
  ('withdrawal_fee', '2.50', 'Withdrawal fee in USD'),
  ('min_deposit', '10.00', 'Minimum deposit amount'),
  ('min_withdrawal', '20.00', 'Minimum withdrawal amount'),
  ('maintenance_mode', 'false', 'Platform maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- Create admin_activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID,
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verify tables exist
SELECT 'platform_settings' as table_name, COUNT(*) as row_count FROM platform_settings
UNION ALL
SELECT 'admin_activity_logs', COUNT(*) FROM admin_activity_logs;
