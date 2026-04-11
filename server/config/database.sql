-- ═══════════════════════════════════════════════════════════════
-- TradZ Broker Platform - Production Database Schema
-- ═══════════════════════════════════════════════════════════════
-- Run this in your Supabase SQL Editor
-- https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- PROFILES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  country TEXT,
  avatar_url TEXT,
  balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
  kyc_status TEXT DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  investment_goals TEXT[],
  risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TRANSACTIONS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL CHECK (method IN ('bank', 'card', 'crypto', 'wallet')),
  recipient TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- TRADES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0),
  price DECIMAL(15, 2) NOT NULL CHECK (price > 0),
  total DECIMAL(15, 2) NOT NULL CHECK (total > 0),
  fee DECIMAL(15, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- HOLDINGS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  quantity DECIMAL(20, 8) NOT NULL CHECK (quantity >= 0),
  avg_buy_price DECIMAL(15, 2) NOT NULL CHECK (avg_buy_price > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, asset_id)
);

-- ═══════════════════════════════════════════════════════════════
-- WATCHLIST TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, asset_id)
);

-- ═══════════════════════════════════════════════════════════════
-- AUDIT LOGS TABLE (Production Security)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trades_asset_id ON trades(asset_id);

CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_asset_id ON holdings(asset_id);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Transactions: Users can only see their own
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trades: Users can only see their own
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Holdings: Users can only see their own
CREATE POLICY "Users can view own holdings" ON holdings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own holdings" ON holdings
  FOR ALL USING (auth.uid() = user_id);

-- Watchlist: Users can only see their own
CREATE POLICY "Users can view own watchlist" ON watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" ON watchlist
  FOR ALL USING (auth.uid() = user_id);

-- Audit logs: Read-only for users
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS FOR UPDATED_AT
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at
  BEFORE UPDATE ON holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS FOR BUSINESS LOGIC
-- ═══════════════════════════════════════════════════════════════

-- Function to safely update balance (prevents race conditions)
CREATE OR REPLACE FUNCTION update_balance(
  p_user_id UUID,
  p_amount DECIMAL,
  p_operation TEXT
)
RETURNS DECIMAL AS $$
DECLARE
  v_new_balance DECIMAL;
BEGIN
  IF p_operation = 'add' THEN
    UPDATE profiles
    SET balance = balance + p_amount
    WHERE id = p_user_id
    RETURNING balance INTO v_new_balance;
  ELSIF p_operation = 'subtract' THEN
    UPDATE profiles
    SET balance = balance - p_amount
    WHERE id = p_user_id AND balance >= p_amount
    RETURNING balance INTO v_new_balance;
    
    IF v_new_balance IS NULL THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
  END IF;
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA (Optional - for testing)
-- ═══════════════════════════════════════════════════════════════
-- Uncomment to add test data
-- INSERT INTO profiles (id, email, name, balance, kyc_status)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000001', 'test@tradz.com', 'Test User', 10000.00, 'verified')
-- ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- CRYPTO ADDRESS ROTATION POINTER
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS crypto_address_pointers (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_index INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
