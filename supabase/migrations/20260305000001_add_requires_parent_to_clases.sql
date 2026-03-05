-- Add requires_parent column to clases table
-- This indicates whether the class requires a parent/guardian to participate alongside the child

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clases' AND column_name = 'requires_parent'
  ) THEN
    ALTER TABLE clases ADD COLUMN requires_parent BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add comment to describe the column
COMMENT ON COLUMN clases.requires_parent IS 'Indicates if parent/guardian must participate in the class with the child (e.g., parent-child cooking classes)';
