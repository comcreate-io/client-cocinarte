-- Gift Cards Table
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  initial_balance DECIMAL(10, 2) NOT NULL CHECK (initial_balance > 0),
  current_balance DECIMAL(10, 2) NOT NULL CHECK (current_balance >= 0),
  purchaser_email VARCHAR(255) NOT NULL,
  purchaser_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  redeemed_by_parent_id UUID REFERENCES parents(id),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

-- Gift Card Transactions Table
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'redemption', 'refund')),
  booking_id UUID REFERENCES bookings(id),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient_email ON gift_cards(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gift_cards_redeemed_by ON gift_cards(redeemed_by_parent_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_gift_card ON gift_card_transactions(gift_card_id);

-- RLS Policies
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create gift cards (for purchase)
CREATE POLICY "Allow insert for all" ON gift_cards
  FOR INSERT WITH CHECK (true);

-- Allow users to view their own gift cards
CREATE POLICY "Users can view own gift cards" ON gift_cards
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      redeemed_by_parent_id IN (
        SELECT id FROM parents WHERE user_id = auth.uid()
      )
      OR recipient_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Allow service role full access
CREATE POLICY "Service role full access to gift_cards" ON gift_cards
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to transactions" ON gift_card_transactions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow updates for redemption
CREATE POLICY "Allow update for redemption" ON gift_cards
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Transaction policies
CREATE POLICY "Allow insert transactions" ON gift_card_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own transactions" ON gift_card_transactions
  FOR SELECT USING (
    gift_card_id IN (
      SELECT id FROM gift_cards
      WHERE redeemed_by_parent_id IN (
        SELECT id FROM parents WHERE user_id = auth.uid()
      )
    )
  );
