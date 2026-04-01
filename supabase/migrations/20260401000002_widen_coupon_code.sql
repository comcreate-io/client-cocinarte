-- Widen coupon code column to support custom codes (e.g. REVIEW10, JACKSONPTO)
ALTER TABLE coupons ALTER COLUMN code TYPE VARCHAR(20);
