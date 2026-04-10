-- Add reserved_spots column to clases table
-- Used by admins to reduce public availability without needing real bookings
ALTER TABLE clases ADD COLUMN IF NOT EXISTS reserved_spots INTEGER DEFAULT 0;
