-- Create invoices table for custom billing
-- Allows admin to create and send invoices to customers

CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Invoice identification
  invoice_number VARCHAR(50) UNIQUE NOT NULL,

  -- Recipient information
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_phone VARCHAR(50),
  recipient_address TEXT,
  recipient_company VARCHAR(255),

  -- Invoice details
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,

  -- Line items (stored as JSONB for flexibility)
  -- Format: [{ description: string, quantity: number, unit_price: number, amount: number }]
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,

  -- Payment information
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  payment_method VARCHAR(50) CHECK (payment_method IN ('stripe', 'cash', 'check', 'bank_transfer', 'other')),
  paid_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_intent_id VARCHAR(255),

  -- Email tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,

  -- Notes and terms
  notes TEXT,
  terms TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_recipient_email ON invoices(recipient_email);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- Updated at trigger
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE invoices IS 'Custom invoices created and sent by admin to customers';
COMMENT ON COLUMN invoices.invoice_number IS 'Unique invoice number (e.g., INV-2024-001)';
COMMENT ON COLUMN invoices.line_items IS 'Array of line items with description, quantity, unit_price, and amount';
COMMENT ON COLUMN invoices.payment_status IS 'Current payment status of the invoice';
COMMENT ON COLUMN invoices.stripe_payment_intent_id IS 'Stripe PaymentIntent ID if paid via Stripe';
COMMENT ON COLUMN invoices.email_sent IS 'Whether the invoice email has been sent to recipient';

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  invoice_num TEXT;
BEGIN
  current_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Get the highest invoice number for current year
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(invoice_number FROM 'INV-' || current_year || '-(\d+)')
        AS INTEGER
      )
    ), 0
  ) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || current_year || '-%';

  invoice_num := 'INV-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');

  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_invoice_number() IS 'Generates next sequential invoice number in format INV-YYYY-0001';
