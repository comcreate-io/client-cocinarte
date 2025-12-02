import { createClient } from './client'
import { GiftCard, GiftCardTransaction, CreateGiftCardData, ApplyGiftCardData } from '@/lib/types/gift-cards'

export class GiftCardsClientService {
  private supabase = createClient()

  generateGiftCardCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = 'GC-'
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  async createGiftCard(data: CreateGiftCardData): Promise<GiftCard> {
    const code = this.generateGiftCardCode()

    const { data: giftCard, error } = await this.supabase
      .from('gift_cards')
      .insert({
        code,
        initial_balance: data.initial_balance,
        current_balance: data.initial_balance,
        purchaser_email: data.purchaser_email,
        purchaser_name: data.purchaser_name,
        recipient_email: data.recipient_email,
        recipient_name: data.recipient_name,
        message: data.message || null,
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating gift card:', error)
      throw new Error('Failed to create gift card')
    }

    // Record the purchase transaction
    await this.recordTransaction({
      gift_card_id: giftCard.id,
      amount: data.initial_balance,
      transaction_type: 'purchase',
      description: `Gift card purchased by ${data.purchaser_name}`
    })

    return giftCard
  }

  async getGiftCardByCode(code: string): Promise<GiftCard | null> {
    const { data, error } = await this.supabase
      .from('gift_cards')
      .select('*')
      .ilike('code', code)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('Error fetching gift card:', error)
      throw new Error('Failed to fetch gift card')
    }

    return data
  }

  async getGiftCardById(id: string): Promise<GiftCard | null> {
    const { data, error } = await this.supabase
      .from('gift_cards')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      console.error('Error fetching gift card:', error)
      throw new Error('Failed to fetch gift card')
    }

    return data
  }

  async validateGiftCard(code: string): Promise<{ valid: boolean; giftCard?: GiftCard; error?: string }> {
    const giftCard = await this.getGiftCardByCode(code)

    if (!giftCard) {
      return { valid: false, error: 'Gift card not found' }
    }

    if (!giftCard.is_active) {
      return { valid: false, error: 'Gift card is no longer active' }
    }

    if (giftCard.expires_at && new Date(giftCard.expires_at) < new Date()) {
      return { valid: false, error: 'Gift card has expired' }
    }

    if (giftCard.current_balance <= 0) {
      return { valid: false, error: 'Gift card has no remaining balance' }
    }

    return { valid: true, giftCard }
  }

  async redeemGiftCard(code: string, parentId: string): Promise<GiftCard> {
    const validation = await this.validateGiftCard(code)

    if (!validation.valid || !validation.giftCard) {
      throw new Error(validation.error || 'Invalid gift card')
    }

    // Link the gift card to the parent account if not already linked
    if (!validation.giftCard.redeemed_by_parent_id) {
      const { data, error } = await this.supabase
        .from('gift_cards')
        .update({
          redeemed_by_parent_id: parentId,
          redeemed_at: new Date().toISOString()
        })
        .eq('id', validation.giftCard.id)
        .select()
        .single()

      if (error) {
        console.error('Error redeeming gift card:', error)
        throw new Error('Failed to redeem gift card')
      }

      return data
    }

    return validation.giftCard
  }

  async applyGiftCardBalance(data: ApplyGiftCardData): Promise<{ newBalance: number; amountApplied: number }> {
    const giftCard = await this.getGiftCardById(data.gift_card_id)

    if (!giftCard) {
      throw new Error('Gift card not found')
    }

    if (!giftCard.is_active) {
      throw new Error('Gift card is not active')
    }

    const amountToApply = Math.min(data.amount, giftCard.current_balance)
    const newBalance = giftCard.current_balance - amountToApply

    const { error } = await this.supabase
      .from('gift_cards')
      .update({
        current_balance: newBalance,
        is_active: newBalance > 0
      })
      .eq('id', data.gift_card_id)

    if (error) {
      console.error('Error applying gift card balance:', error)
      throw new Error('Failed to apply gift card balance')
    }

    // Record the transaction
    await this.recordTransaction({
      gift_card_id: data.gift_card_id,
      amount: -amountToApply,
      transaction_type: 'redemption',
      booking_id: data.booking_id,
      description: data.description
    })

    return { newBalance, amountApplied: amountToApply }
  }

  async recordTransaction(data: Omit<GiftCardTransaction, 'id' | 'created_at'> & { transaction_type: string }): Promise<void> {
    const { error } = await this.supabase
      .from('gift_card_transactions')
      .insert({
        gift_card_id: data.gift_card_id,
        amount: data.amount,
        transaction_type: data.transaction_type,
        booking_id: data.booking_id || null,
        description: data.description
      })

    if (error) {
      console.error('Error recording gift card transaction:', error)
    }
  }

  async getGiftCardsByParentId(parentId: string): Promise<GiftCard[]> {
    const { data, error } = await this.supabase
      .from('gift_cards')
      .select('*')
      .eq('redeemed_by_parent_id', parentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gift cards:', error)
      throw new Error('Failed to fetch gift cards')
    }

    return data || []
  }

  async getGiftCardsByRecipientEmail(email: string): Promise<GiftCard[]> {
    const { data, error } = await this.supabase
      .from('gift_cards')
      .select('*')
      .ilike('recipient_email', email)
      .is('redeemed_by_parent_id', null)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gift cards by email:', error)
      throw new Error('Failed to fetch gift cards')
    }

    return data || []
  }

  async getTotalBalanceByParentId(parentId: string): Promise<number> {
    const giftCards = await this.getGiftCardsByParentId(parentId)
    return giftCards
      .filter(gc => gc.is_active)
      .reduce((total, gc) => total + gc.current_balance, 0)
  }

  async getGiftCardTransactions(giftCardId: string): Promise<GiftCardTransaction[]> {
    const { data, error } = await this.supabase
      .from('gift_card_transactions')
      .select('*')
      .eq('gift_card_id', giftCardId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gift card transactions:', error)
      throw new Error('Failed to fetch gift card transactions')
    }

    return data || []
  }

  async markGiftCardAsSent(giftCardId: string): Promise<void> {
    const { error } = await this.supabase
      .from('gift_cards')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', giftCardId)

    if (error) {
      console.error('Error marking gift card as sent:', error)
      throw new Error('Failed to update gift card')
    }
  }

  // Apply gift card balance from parent's available cards for a booking
  async applyGiftCardBalanceForParent(
    parentId: string,
    amount: number,
    bookingId?: string,
    description?: string
  ): Promise<{ success: boolean; amountApplied: number; remainingBalance: number; error?: string }> {
    try {
      // Get all active gift cards for this parent
      const giftCards = await this.getGiftCardsByParentId(parentId)
      const activeCards = giftCards.filter(gc => gc.is_active && gc.current_balance > 0)

      if (activeCards.length === 0) {
        return { success: false, amountApplied: 0, remainingBalance: 0, error: 'No active gift cards found' }
      }

      let remainingAmount = amount
      let totalApplied = 0

      // Apply from each card until the amount is covered
      for (const card of activeCards) {
        if (remainingAmount <= 0) break

        const amountFromThisCard = Math.min(remainingAmount, card.current_balance)
        const newBalance = card.current_balance - amountFromThisCard

        // Update the card balance
        const { error } = await this.supabase
          .from('gift_cards')
          .update({
            current_balance: newBalance,
            is_active: newBalance > 0
          })
          .eq('id', card.id)

        if (error) {
          console.error('Error updating gift card balance:', error)
          continue
        }

        // Record the transaction
        await this.recordTransaction({
          gift_card_id: card.id,
          amount: -amountFromThisCard,
          transaction_type: 'redemption',
          booking_id: bookingId,
          description: description || `Payment applied from gift card ${card.code}`
        })

        totalApplied += amountFromThisCard
        remainingAmount -= amountFromThisCard
      }

      // Calculate remaining balance
      const newTotalBalance = await this.getTotalBalanceByParentId(parentId)

      return {
        success: totalApplied > 0,
        amountApplied: totalApplied,
        remainingBalance: newTotalBalance
      }
    } catch (error) {
      console.error('Error applying gift card balance:', error)
      return { success: false, amountApplied: 0, remainingBalance: 0, error: 'Failed to apply gift card balance' }
    }
  }

  // Refund gift card balance (for cancelled bookings)
  async refundGiftCardBalance(
    parentId: string,
    amount: number,
    bookingId?: string,
    description?: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    try {
      // Get the first active gift card for this parent to add the refund
      const giftCards = await this.getGiftCardsByParentId(parentId)

      if (giftCards.length === 0) {
        return { success: false, newBalance: 0, error: 'No gift cards found for this parent' }
      }

      // Find a card to add the refund to (prefer the most recently used one)
      let targetCard = giftCards.find(gc => gc.is_active) || giftCards[0]

      const newBalance = targetCard.current_balance + amount

      // Update the card balance
      const { error } = await this.supabase
        .from('gift_cards')
        .update({
          current_balance: newBalance,
          is_active: true
        })
        .eq('id', targetCard.id)

      if (error) {
        console.error('Error refunding gift card balance:', error)
        return { success: false, newBalance: 0, error: 'Failed to refund gift card balance' }
      }

      // Record the refund transaction
      await this.recordTransaction({
        gift_card_id: targetCard.id,
        amount: amount,
        transaction_type: 'refund',
        booking_id: bookingId,
        description: description || `Refund for cancelled booking`
      })

      const totalBalance = await this.getTotalBalanceByParentId(parentId)

      return { success: true, newBalance: totalBalance }
    } catch (error) {
      console.error('Error refunding gift card balance:', error)
      return { success: false, newBalance: 0, error: 'Failed to refund gift card balance' }
    }
  }

  async getAllGiftCards(): Promise<GiftCard[]> {
    const { data, error } = await this.supabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all gift cards:', error)
      throw new Error('Failed to fetch gift cards')
    }

    return data || []
  }

  async getGiftCardStats(): Promise<{
    totalIssued: number
    totalRedeemed: number
    totalBalance: number
    activeCards: number
  }> {
    const giftCards = await this.getAllGiftCards()

    return {
      totalIssued: giftCards.reduce((sum, gc) => sum + gc.initial_balance, 0),
      totalRedeemed: giftCards.reduce((sum, gc) => sum + (gc.initial_balance - gc.current_balance), 0),
      totalBalance: giftCards.filter(gc => gc.is_active).reduce((sum, gc) => sum + gc.current_balance, 0),
      activeCards: giftCards.filter(gc => gc.is_active && gc.current_balance > 0).length
    }
  }
}
