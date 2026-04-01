-- Add admin note field to coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS note TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN coupons.note IS 'Internal admin note to track coupon purpose';
