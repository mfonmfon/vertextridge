-- ═══════════════════════════════════════════════════════════════
-- ADMIN DASHBOARD SCHEMA
-- ═══════════════════════════════════════════════════════════════

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{"can_edit_balances": true, "can_manage_users": true, "can_view_analytics": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES admin_users(id),
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

-- Admin activity logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin tables
CREATE POLICY "Admins can view admin_users" ON admin_users FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Admins can view platform_settings" ON platform_settings FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Super admins can update platform_settings" ON platform_settings FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM admin_users WHERE role = 'super_admin')
);

CREATE POLICY "Admins can view activity logs" ON admin_activity_logs FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
