-- Add child_id to bookings table to link each booking to a specific child
-- This allows parents with multiple children to book classes for specific children

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_child_id ON bookings(child_id);

-- Add comment for documentation
COMMENT ON COLUMN bookings.child_id IS 'Reference to the specific child this booking is for (from children table)';

-- Note: We're using ON DELETE SET NULL instead of CASCADE to preserve booking history
-- even if a child record is deleted. The student_id field still provides fallback information.
