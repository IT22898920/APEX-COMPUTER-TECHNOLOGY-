-- ============================================================================
-- PAYMENT SYSTEM - Bank Accounts & Payment Receipts
-- ============================================================================

-- Bank Accounts table (Admin manages payment details)
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  branch TEXT,
  swift_code TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Receipts table (Customer uploads payment proof)
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receipt_url TEXT NOT NULL,
  amount DECIMAL(10,2),
  payment_date DATE,
  bank_reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add receipt_sent field to orders if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'receipt_sent_at') THEN
    ALTER TABLE orders ADD COLUMN receipt_sent_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_instructions_sent') THEN
    ALTER TABLE orders ADD COLUMN payment_instructions_sent BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_payment_receipts_order ON payment_receipts(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_customer ON payment_receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_status ON payment_receipts(status);

-- Enable RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- =====================
-- BANK ACCOUNTS POLICIES
-- =====================

-- Anyone can view active bank accounts (for payment info)
DROP POLICY IF EXISTS "Anyone can view active bank accounts" ON bank_accounts;
CREATE POLICY "Anyone can view active bank accounts"
  ON bank_accounts FOR SELECT
  USING (is_active = true);

-- Admin can manage bank accounts
DROP POLICY IF EXISTS "Admin manage bank accounts" ON bank_accounts;
CREATE POLICY "Admin manage bank accounts"
  ON bank_accounts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =====================
-- PAYMENT RECEIPTS POLICIES
-- =====================

-- Customers view own receipts
DROP POLICY IF EXISTS "Customers view own receipts" ON payment_receipts;
CREATE POLICY "Customers view own receipts"
  ON payment_receipts FOR SELECT
  USING (customer_id = auth.uid() OR is_staff());

-- Customers can upload receipts for own orders
DROP POLICY IF EXISTS "Customers upload receipts" ON payment_receipts;
CREATE POLICY "Customers upload receipts"
  ON payment_receipts FOR INSERT
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()
    )
  );

-- Customers can update own pending receipts
DROP POLICY IF EXISTS "Customers update own receipts" ON payment_receipts;
CREATE POLICY "Customers update own receipts"
  ON payment_receipts FOR UPDATE
  USING (customer_id = auth.uid() AND status = 'pending')
  WITH CHECK (customer_id = auth.uid());

-- Staff can view and manage all receipts
DROP POLICY IF EXISTS "Staff manage receipts" ON payment_receipts;
CREATE POLICY "Staff manage receipts"
  ON payment_receipts FOR ALL
  USING (is_staff());

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_bank_accounts_updated ON bank_accounts;
CREATE TRIGGER trigger_bank_accounts_updated
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_payment_receipts_updated ON payment_receipts;
CREATE TRIGGER trigger_payment_receipts_updated
  BEFORE UPDATE ON payment_receipts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to ensure only one primary bank account
CREATE OR REPLACE FUNCTION ensure_single_primary_bank()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE bank_accounts SET is_primary = false WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_primary_bank ON bank_accounts;
CREATE TRIGGER trigger_single_primary_bank
  AFTER INSERT OR UPDATE ON bank_accounts
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_bank();
