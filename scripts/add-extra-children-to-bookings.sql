-- Migration: Add extra_children column to bookings table
-- This column tracks the number of extra children for Mommy & Me (Chefcitos Together) classes
-- Each extra child costs $70, with a maximum of 2 extra children (3 total)

-- Add the extra_children column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS extra_children INTEGER DEFAULT 0;

-- Add a check constraint to ensure extra_children is between 0 and 2
ALTER TABLE bookings
ADD CONSTRAINT check_extra_children_range
CHECK (extra_children >= 0 AND extra_children <= 2);

-- Add a comment explaining the column
COMMENT ON COLUMN bookings.extra_children IS 'Number of extra children for Mommy & Me classes (0-2). Each extra child costs $70. Total children = 1 + extra_children.';
