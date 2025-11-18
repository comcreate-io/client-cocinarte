export interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  class_id?: string;
  is_used: boolean;
  used_by_user_id?: string;
  used_at?: string;
  recipient_email?: string;
  sent_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCouponData {
  code: string;
  discount_percentage: number;
  class_id?: string;
  created_by?: string;
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
