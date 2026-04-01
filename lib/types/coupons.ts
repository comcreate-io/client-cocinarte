export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_percentage: number | null;
  discount_amount: number | null;
  class_id?: string;
  is_used: boolean;
  used_by_user_id?: string;
  used_at?: string;
  recipient_email?: string;
  sent_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
  max_uses: number;
  use_count: number;
  note?: string | null;
}

export interface CreateCouponData {
  code: string;
  discount_type: DiscountType;
  discount_percentage?: number;
  discount_amount?: number;
  class_id?: string;
  created_by?: string;
  expires_at?: string | null;
  max_uses?: number;
  note?: string | null;
}

export interface UpdateCouponData extends Partial<CreateCouponData> {
  id: string;
  is_used?: boolean;
  used_by_user_id?: string;
  used_at?: string;
  recipient_email?: string;
  sent_at?: string;
}

export interface SendCouponEmailData {
  coupon_id: string;
  recipient_email: string;
  recipient_name?: string;
  class_details?: {
    title: string;
    date: string;
    time: string;
    price: number;
  };
}

export interface ValidateCouponResponse {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
}

export interface CouponWithClass extends Coupon {
  class?: {
    id: string;
    title: string;
    date: string;
    time: string;
    price: number;
  };
}
