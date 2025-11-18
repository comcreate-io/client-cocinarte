import { supabase } from '../supabase'
import { Coupon, CreateCouponData, UpdateCouponData, CouponWithClass } from '../types/coupons'

export class CouponsClientService {
  /**
   * Generate a random 6-character alphanumeric code
   */
  generateCouponCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Create a new coupon with a random code
   */
  async createCoupon(data: Omit<CreateCouponData, 'code'>): Promise<Coupon> {
    const code = this.generateCouponCode()

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code,
        discount_percentage: data.discount_percentage,
        class_id: data.class_id || null,
        created_by: data.created_by
      })
      .select()
      .single()

    if (error) throw error
    return coupon
  }

  /**
   * Get all coupons (for admin dashboard)
   */
  async getAllCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  /**
   * Validate a coupon code for a specific class
   */
  async validateCoupon(code: string, classId?: string): Promise<{
    valid: boolean
    coupon?: Coupon
    error?: string
  }> {
    const coupon = await this.getCouponByCode(code)

    if (!coupon) {
      return { valid: false, error: 'Coupon not found' }
    }

    if (coupon.is_used) {
      return { valid: false, error: 'Coupon has already been used' }
    }

    // If coupon is class-specific, validate the class ID matches
    if (coupon.class_id && classId && coupon.class_id !== classId) {
      return { valid: false, error: 'This coupon is not valid for this class' }
    }

    return { valid: true, coupon }
  }

  /**
   * Mark a coupon as used
   */
  async markCouponAsUsed(couponId: string, userId: string): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .update({
        is_used: true,
        used_by_user_id: userId,
        used_at: new Date().toISOString()
      })
      .eq('id', couponId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update coupon recipient email and sent timestamp
   */
  async markCouponAsSent(couponId: string, recipientEmail: string): Promise<Coupon> {
    const { data, error } = await supabase
      .from('coupons')
      .update({
        recipient_email: recipientEmail,
        sent_at: new Date().toISOString()
      })
      .eq('id', couponId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete a coupon
   */
  async deleteCoupon(id: string): Promise<void> {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Get coupon statistics
   */
  async getCouponStats(): Promise<{
    total: number
    used: number
    unused: number
    sent: number
  }> {
    const coupons = await this.getAllCoupons()

    return {
      total: coupons.length,
      used: coupons.filter(c => c.is_used).length,
      unused: coupons.filter(c => !c.is_used).length,
      sent: coupons.filter(c => c.sent_at !== null).length
    }
  }

  /**
   * Get coupon by ID with class details
   */
  async getCouponWithClassDetails(couponId: string): Promise<CouponWithClass | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        class:clases!class_id (
          id,
          title,
          date,
          time,
          price
        )
      `)
      .eq('id', couponId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data as CouponWithClass
  }
}
