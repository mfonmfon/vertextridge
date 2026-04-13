-- Platform Settings Table
-- Stores configurable platform-wide settings

-- Drop existing table if it exists
DROP TABLE IF EXISTS platform_settings CASCADE;

-- Create new table with proper TEXT columns
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_platform_settings_key ON platform_settings(key);

-- Insert default settings one by one to avoid any parsing issues
INSERT INTO platform_settings (key, value) VALUES ('signup_bonus', '50.00');
INSERT INTO platform_settings (key, value) VALUES ('trading_fee', '0.001');
INSERT INTO platform_settings (key, value) VALUES ('withdrawal_fee', '2.50');
INSERT INTO platform_settings (key, value) VALUES ('min_deposit', '10.00');
INSERT INTO platform_settings (key, value) VALUES ('min_withdrawal', '20.00');
INSERT INTO platform_settings (key, value) VALUES ('maintenance_mode', 'false');
INSERT INTO platform_settings (key, value) VALUES ('bank_name', 'Vertex Ridge Bank');
INSERT INTO platform_settings (key, value) VALUES ('account_name', 'Vertex Ridge Trading Platform');
INSERT INTO platform_settings (key, value) VALUES ('account_number', '');
INSERT INTO platform_settings (key, value) VALUES ('routing_number', '');
INSERT INTO platform_settings (key, value) VALUES ('swift_code', '');
INSERT INTO platform_settings (key, value) VALUES ('iban', '');
INSERT INTO platform_settings (key, value) VALUES ('bank_address', '');
INSERT INTO platform_settings (key, value) VALUES ('payment_reference', 'VR-{USER_ID}');
