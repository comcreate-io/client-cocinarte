-- Add age range columns to clases table
ALTER TABLE clases
ADD COLUMN IF NOT EXISTS min_age INTEGER,
ADD COLUMN IF NOT EXISTS max_age INTEGER;

-- Add a check constraint to ensure min_age is less than or equal to max_age
ALTER TABLE clases
ADD CONSTRAINT clases_age_range_check
CHECK (min_age IS NULL OR max_age IS NULL OR min_age <= max_age);

-- Add comments to describe the columns
COMMENT ON COLUMN clases.min_age IS 'Minimum age allowed for this class (in years)';
COMMENT ON COLUMN clases.max_age IS 'Maximum age allowed for this class (in years)';
