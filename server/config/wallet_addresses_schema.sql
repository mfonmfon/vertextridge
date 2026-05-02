-- ═══════════════════════════════════════════════════════════════
-- WALLET ADDRESSES TABLE
-- ═══════════════════════════════════════════════════════════════
-- This table stores crypto wallet addresses generated for users
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS wallet_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency IN ('BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL')),
  address TEXT NOT NULL,
  network TEXT NOT NULL,
  label TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  generated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, currency, network)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_user_id ON wallet_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_currency ON wallet_addresses(currency);
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_address ON wallet_addresses(address);

-- Enable RLS
ALTER TABLE wallet_addresses ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet addresses
CREATE POLICY "Users can view own wallet addresses" ON wallet_addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all wallet addresses (handled by service role)
CREATE POLICY "Service role can manage wallet addresses" ON wallet_addresses
  FOR ALL USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_wallet_addresses_updated_at
  BEFORE UPDATE ON wallet_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE wallet_addresses IS 'Stores crypto wallet addresses generated for users by admins';
COMMENT ON COLUMN wallet_addresses.currency IS 'Cryptocurrency type (BTC, ETH, USDT, etc.)';
COMMENT ON COLUMN wallet_addresses.network IS 'Blockchain network (Bitcoin, Ethereum, BSC, etc.)';
COMMENT ON COLUMN wallet_addresses.generated_by IS 'Admin user who generated this address';
