-- Add discount type support (percentage or fixed amount)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_type VARCHAR(10) NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed'));

-- Add fixed discount amount column
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2);

-- Add expiration date
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add max uses (NULL means single-use, which preserves current behavior)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1 CHECK (max_uses >= 1);

-- Add use count to track how many times coupon has been used
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0 CHECK (use_count >= 0);

-- Make discount_percentage nullable (not needed for fixed amount coupons)
ALTER TABLE coupons ALTER COLUMN discount_percentage DROP NOT NULL;

-- Drop the old CHECK constraint on discount_percentage and add a conditional one
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_discount_percentage_check;

-- Add index on expires_at for efficient expiry checking
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON coupons(expires_at);

-- Migrate existing is_used data to use_count
UPDATE coupons SET use_count = 1 WHERE is_used = TRUE AND use_count = 0;
