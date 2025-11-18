-- Add class_id column to existing coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS class_id UUID;

-- Create index for class_id
CREATE INDEX IF NOT EXISTS idx_coupons_class_id ON coupons(class_id);
