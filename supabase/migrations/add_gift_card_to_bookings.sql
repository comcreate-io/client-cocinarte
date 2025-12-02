-- Add gift card columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS gift_card_amount_used DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES parents(id);

-- Create index for parent_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_bookings_parent_id ON bookings(parent_id);
