-- Migration: Add class_id column to existing coupons table
-- Run this if you already created the coupons table without class_id

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS class_id UUID;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_coupons_class_id ON coupons(class_id);
