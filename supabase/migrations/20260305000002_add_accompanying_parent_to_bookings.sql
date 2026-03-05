-- Add accompanying_parent_name column to bookings table
-- This stores the name of the parent/guardian attending the class with the child

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'accompanying_parent_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN accompanying_parent_name VARCHAR(255);
  END IF;
END $$;

-- Add comment to describe the column
COMMENT ON COLUMN bookings.accompanying_parent_name IS 'Name of the parent/guardian who will attend and participate in the class with the child (for parent-child classes)';
