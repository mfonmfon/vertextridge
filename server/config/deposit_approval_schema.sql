-- ═══════════════════════════════════════════════════════════════
-- DEPOSIT APPROVAL SYSTEM
-- ═══════════════════════════════════════════════════════════════
-- This adds manual verification for bank transfer deposits

-- Add status tracking to transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled'));

-- Add proof of payment
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- Add reference code for matching bank transfers
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS reference_code TEXT;

-- Add rejection reason
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add admin approval tracking
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES admin_users(id);

ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add notes field for admin comments
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create index for faster pending deposit queries
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_pending ON transactions(status, timestamp DESC) 
WHERE status = 'pending';

-- ═══════════════════════════════════════════════════════════════
-- UPDATE EXISTING TRANSACTIONS
-- ═══════════════════════════════════════════════════════════════
-- Mark all existing transactions as completed (they were auto-approved)
UPDATE transactions 
SET status = 'completed' 
WHERE status IS NULL OR status = 'pending';

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTION: Approve Deposit
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION approve_deposit(
  p_transaction_id UUID,
  p_admin_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_transaction RECORD;
  v_new_balance NUMERIC;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  -- Update user balance
  UPDATE profiles
  SET balance = balance + v_transaction.amount,
      updated_at = NOW()
  WHERE id = v_transaction.user_id
  RETURNING balance INTO v_new_balance;

  -- Mark transaction as completed
  UPDATE transactions
  SET status = 'completed',
      approved_by = p_admin_id,
      approved_at = NOW()
  WHERE id = p_transaction_id;

  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', p_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- HELPER FUNCTION: Reject Deposit
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION reject_deposit(
  p_transaction_id UUID,
  p_admin_id UUID,
  p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_transaction RECORD;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction
  FROM transactions
  WHERE id = p_transaction_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;

  -- Mark transaction as rejected
  UPDATE transactions
  SET status = 'rejected',
      rejection_reason = p_reason,
      approved_by = p_admin_id,
      approved_at = NOW()
  WHERE id = p_transaction_id;

  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', p_transaction_id,
    'status', 'rejected'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════
COMMENT ON COLUMN transactions.status IS 'pending: awaiting approval, completed: approved and balance updated, rejected: denied by admin, cancelled: cancelled by user';
COMMENT ON COLUMN transactions.proof_url IS 'URL to uploaded proof of payment (screenshot, receipt, etc)';
COMMENT ON COLUMN transactions.reference_code IS 'Unique reference code for matching bank transfers';
COMMENT ON COLUMN transactions.rejection_reason IS 'Reason provided by admin for rejection';
COMMENT ON COLUMN transactions.approved_by IS 'Admin user who approved/rejected the transaction';
COMMENT ON COLUMN transactions.approved_at IS 'Timestamp when transaction was approved/rejected';
COMMENT ON COLUMN transactions.admin_notes IS 'Internal notes from admin about this transaction';

