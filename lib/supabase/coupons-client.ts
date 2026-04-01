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
  async createCoupon(data: Omit<CreateCouponData, 'code'> & { custom_code?: string }): Promise<Coupon> {
    const code = data.custom_code?.trim().toUpperCase() || this.generateCouponCode()

    const insertData: any = {
      code,
      discount_type: data.discount_type,
      class_id: data.class_id || null,
      created_by: data.created_by,
      max_uses: data.max_uses || 1,
      expires_at: data.expires_at || null,
      note: data.note || null,
    }

    if (data.discount_type === 'percentage') {
      insertData.discount_percentage = data.discount_percentage
      insertData.discount_amount = null
    } else {
      insertData.discount_amount = data.discount_amount
      insertData.discount_percentage = null
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert(insertData)
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

    // Check if coupon has reached max uses
    if (coupon.use_count >= coupon.max_uses) {
      return { valid: false, error: 'Coupon has reached its maximum number of uses' }
    }

    // Check if coupon has expired
    if (coupon.expires_at) {
      const expiryDate = new Date(coupon.expires_at)
      if (expiryDate < new Date()) {
        return { valid: false, error: 'This coupon has expired' }
      }
    }

    // If coupon is class-specific, validate the class ID matches
    if (coupon.class_id && classId && coupon.class_id !== classId) {
      return { valid: false, error: 'This coupon is not valid for this class' }
    }

    return { valid: true, coupon }
  }

  /**
   * Mark a coupon as used (increment use_count)
   */
  async markCouponAsUsed(couponId: string, userId: string): Promise<Coupon> {
    // First get current coupon to check use_count
    const { data: current, error: fetchError } = await supabase
      .from('coupons')
      .select('use_count, max_uses')
      .eq('id', couponId)
      .single()

    if (fetchError) throw fetchError

    const newUseCount = (current.use_count || 0) + 1

    const { data, error } = await supabase
      .from('coupons')
      .update({
        use_count: newUseCount,
        is_used: newUseCount >= current.max_uses,
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
