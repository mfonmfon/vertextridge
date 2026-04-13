-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATIONS SYSTEM SCHEMA
-- ═══════════════════════════════════════════════════════════════

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trade', 'deposit', 'withdrawal', 'kyc', 'price_alert', 'system', 'copy_trade')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (
  auth.uid() = user_id
);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification on trade
CREATE OR REPLACE FUNCTION notify_on_trade() RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.user_id,
    'trade',
    'Trade Executed',
    format('Your %s order for %s %s has been executed at $%s', 
      NEW.type, NEW.quantity, NEW.symbol, NEW.price),
    jsonb_build_object('trade_id', NEW.id, 'symbol', NEW.symbol, 'type', NEW.type)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trade_notification_trigger
  AFTER INSERT ON trades
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_trade();

-- Trigger to create notification on transaction
CREATE OR REPLACE FUNCTION notify_on_transaction() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    PERFORM create_notification(
      NEW.user_id,
      NEW.type,
      format('%s Completed', initcap(NEW.type)),
      format('Your %s of $%s has been completed successfully', NEW.type, NEW.amount),
      jsonb_build_object('transaction_id', NEW.id, 'amount', NEW.amount, 'type', NEW.type)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_notification_trigger
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_transaction();
