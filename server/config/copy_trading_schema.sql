-- ═══════════════════════════════════════════════════════════════
-- Copy Trading Schema - Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- MASTER TRADERS
CREATE TABLE IF NOT EXISTS master_traders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  total_followers INTEGER DEFAULT 0,
  total_profit DECIMAL(15, 2) DEFAULT 0.00,
  win_rate DECIMAL(5, 2) DEFAULT 0.00,
  total_trades INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 5 CHECK (risk_score BETWEEN 1 AND 10),
  avg_trade_duration TEXT,
  specialization TEXT[],
  min_copy_amount DECIMAL(15, 2) DEFAULT 100.00,
  max_copiers INTEGER DEFAULT 1000,
  performance_fee DECIMAL(5, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COPY RELATIONSHIPS
CREATE TABLE IF NOT EXISTS copy_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  copier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  master_id UUID NOT NULL REFERENCES master_traders(id) ON DELETE CASCADE,
  allocated_amount DECIMAL(15, 2) NOT NULL CHECK (allocated_amount > 0),
  copy_percentage DECIMAL(5, 2) DEFAULT 100.00 CHECK (copy_percentage BETWEEN 1 AND 100),
  stop_loss_percentage DECIMAL(5, 2),
  take_profit_percentage DECIMAL(5, 2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  total_copied_trades INTEGER DEFAULT 0,
  total_profit DECIMAL(15, 2) DEFAULT 0.00,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  stopped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(copier_id, master_id)
);

-- PERFORMANCE HISTORY
CREATE TABLE IF NOT EXISTS master_performance_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id UUID NOT NULL REFERENCES master_traders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  profit DECIMAL(15, 2) DEFAULT 0.00,
  trades_count INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(master_id, date)
);

-- COPIED TRADES (no foreign key to trades table)
CREATE TABLE IF NOT EXISTS copied_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  copy_relationship_id UUID NOT NULL REFERENCES copy_relationships(id) ON DELETE CASCADE,
  copier_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  quantity DECIMAL(20, 8) NOT NULL,
  entry_price DECIMAL(15, 2) NOT NULL,
  exit_price DECIMAL(15, 2),
  profit_loss DECIMAL(15, 2) DEFAULT 0.00,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- CRYPTO ADDRESS ROTATION
CREATE TABLE IF NOT EXISTS crypto_address_pointers (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_index INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_master_traders_active ON master_traders(is_active);
CREATE INDEX IF NOT EXISTS idx_master_traders_followers ON master_traders(total_followers DESC);
CREATE INDEX IF NOT EXISTS idx_master_traders_profit ON master_traders(total_profit DESC);
CREATE INDEX IF NOT EXISTS idx_master_traders_win_rate ON master_traders(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_copy_relationships_copier ON copy_relationships(copier_id);
CREATE INDEX IF NOT EXISTS idx_copy_relationships_master ON copy_relationships(master_id);
CREATE INDEX IF NOT EXISTS idx_copy_relationships_status ON copy_relationships(status);
CREATE INDEX IF NOT EXISTS idx_master_performance_date ON master_performance_history(master_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_copied_trades_copier ON copied_trades(copier_id);

-- RLS
ALTER TABLE master_traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE copied_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_address_pointers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active master traders" ON master_traders;
CREATE POLICY "Anyone can view active master traders" ON master_traders
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can manage own master profile" ON master_traders;
CREATE POLICY "Users can manage own master profile" ON master_traders
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own copy relationships" ON copy_relationships;
CREATE POLICY "Users can view own copy relationships" ON copy_relationships
  FOR SELECT USING (auth.uid() = copier_id);

DROP POLICY IF EXISTS "Users can manage own copy relationships" ON copy_relationships;
CREATE POLICY "Users can manage own copy relationships" ON copy_relationships
  FOR ALL USING (auth.uid() = copier_id);

DROP POLICY IF EXISTS "Anyone can view master performance" ON master_performance_history;
CREATE POLICY "Anyone can view master performance" ON master_performance_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own copied trades" ON copied_trades;
CREATE POLICY "Users can view own copied trades" ON copied_trades
  FOR SELECT USING (auth.uid() = copier_id);

DROP POLICY IF EXISTS "Users can manage own copied trades" ON copied_trades;
CREATE POLICY "Users can manage own copied trades" ON copied_trades
  FOR ALL USING (auth.uid() = copier_id);

DROP POLICY IF EXISTS "Users can manage own address pointer" ON crypto_address_pointers;
CREATE POLICY "Users can manage own address pointer" ON crypto_address_pointers
  FOR ALL USING (auth.uid() = user_id);

-- SEED: 8 realistic master traders
INSERT INTO master_traders (display_name, bio, verified, total_followers, total_profit, win_rate, total_trades, risk_score, specialization, min_copy_amount, performance_fee, avg_trade_duration)
VALUES
  ('Sarah Chen', 'Professional crypto trader with 7+ years experience. Specializing in BTC and ETH swing trading with a disciplined risk management approach.', true, 2847, 125000.00, 89.5, 1250, 7, ARRAY['crypto', 'bitcoin', 'ethereum'], 500.00, 15.00, '3-5 days'),
  ('Marcus Rodriguez', 'Forex expert focusing on EUR/USD and GBP/USD. Conservative approach with consistent monthly returns.', true, 1923, 89000.00, 85.3, 980, 5, ARRAY['forex', 'currencies'], 300.00, 12.00, '1-2 days'),
  ('Elena Volkov', 'High-frequency day trader. Quick in-and-out positions with tight stop losses. Not for the faint-hearted.', true, 3156, 210000.00, 82.1, 3580, 8, ARRAY['crypto', 'forex'], 200.00, 18.00, '2-6 hours'),
  ('James Park', 'Conservative long-term investor. Capital preservation first, growth second. Perfect for risk-averse investors.', true, 1234, 45000.00, 78.4, 560, 3, ARRAY['stocks', 'etf', 'bonds'], 1500.00, 8.00, '2-4 weeks'),
  ('Aisha Patel', 'Tech stocks specialist. Early mover in FAANG and emerging tech. Consistent outperformer.', true, 4521, 312000.00, 91.2, 1580, 6, ARRAY['stocks', 'tech', 'nasdaq'], 1000.00, 20.00, '1-2 weeks'),
  ('David Kim', 'Swing trader across crypto and stocks. Medium-term positions with strong technical analysis.', true, 987, 67000.00, 76.8, 1120, 4, ARRAY['crypto', 'stocks'], 400.00, 14.00, '5-7 days'),
  ('Isabella Santos', 'Commodities and precious metals expert. Gold, oil, and agricultural futures specialist.', true, 2341, 95000.00, 88.6, 890, 5, ARRAY['commodities', 'gold', 'oil'], 800.00, 11.00, '1-2 weeks'),
  ('Mohammed Al-Rashid', 'Index fund and ETF specialist. Low-risk, steady growth strategy mirroring global indices.', true, 1567, 52000.00, 74.3, 420, 2, ARRAY['etf', 'index', 'stocks'], 2000.00, 7.00, '1 month')
ON CONFLICT DO NOTHING;

-- SEED: 30 days of performance history per trader
INSERT INTO master_performance_history (master_id, date, profit, trades_count, win_rate)
SELECT
  mt.id,
  (CURRENT_DATE - (n || ' days')::interval)::DATE,
  (RANDOM() * 5000 - 500)::DECIMAL(15,2),
  (RANDOM() * 15 + 3)::INTEGER,
  (mt.win_rate - 10 + RANDOM() * 20)::DECIMAL(5,2)
FROM master_traders mt
CROSS JOIN generate_series(0, 29) AS n
ON CONFLICT DO NOTHING;
