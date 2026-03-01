export interface Booking {
  id: string;
  user_id: string;
  class_id: string;
  student_id: string;
  child_id?: string; // Reference to specific child from children table
  booking_date: string; // ISO date string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'held' | 'canceled';
  payment_amount: number;
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'stripe';
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  stripe_payment_intent_id?: string;
  gift_card_amount_used?: number; // Amount paid using gift card balance
  parent_id?: string; // Reference to parent for gift card refunds
  extra_children?: number; // Number of extra children for Mommy & Me classes (0-2, max 3 total)
  is_guest_booking?: boolean; // Whether this booking is a gift for a guest child
  notes?: string;
  booking_comments?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingData {
  user_id: string;
  class_id: string;
  student_id: string;
  child_id?: string; // Reference to specific child from children table
  payment_amount: number;
  payment_method?: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'stripe' | 'coupon';
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'held' | 'canceled' | 'paid';
  booking_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  stripe_payment_intent_id?: string;
  gift_card_amount_used?: number; // Amount paid using gift card balance
  parent_id?: string; // Reference to parent for gift card refunds
  extra_children?: number; // Number of extra children for Mommy & Me classes (0-2, max 3 total)
  is_guest_booking?: boolean; // Whether this booking is a gift for a guest child
  notes?: string;
  booking_comments?: string;
}

export interface UpdateBookingData extends Partial<CreateBookingData> {
  id: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'held' | 'canceled';
  booking_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface BookingWithDetails extends Booking {
  class: {
    id: string;
    title: string;
    date: string;
    time: string;
    price: number;
    classDuration: number;
    class_type?: string;
    late_cancel_refund_type?: 'percentage' | 'fixed' | null;
    late_cancel_refund_value?: number | null;
  };
  student: {
    id: string;
    parent_name: string;
    child_name: string;
    email: string;
  };
}
