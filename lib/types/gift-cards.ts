export interface GiftCard {
  id: string
  code: string
  initial_balance: number
  current_balance: number
  purchaser_email: string
  purchaser_name: string
  recipient_email: string
  recipient_name: string
  message?: string
  is_active: boolean
  created_at: string
  expires_at?: string
  sent_at?: string
  redeemed_by_parent_id?: string
  redeemed_at?: string
}

export interface GiftCardTransaction {
  id: string
  gift_card_id: string
  amount: number
  transaction_type: 'purchase' | 'redemption' | 'refund'
  booking_id?: string
  description: string
  created_at: string
}

export interface CreateGiftCardData {
  initial_balance: number
  purchaser_email: string
  purchaser_name: string
  recipient_email: string
  recipient_name: string
  message?: string
}

export interface RedeemGiftCardData {
  code: string
  parent_id: string
}

export interface ApplyGiftCardData {
  gift_card_id: string
  amount: number
  booking_id?: string
  description: string
}
