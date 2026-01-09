import { createClient } from './client'
import { ConsentForm, ConsentFormWithChild, CONSENT_FORM_VERSION } from '@/types/consent'

export class ConsentFormsClientService {
  private supabase = createClient()

  /**
   * Get the latest consent form for a child
   */
  async getConsentForChild(childId: string): Promise<ConsentForm | null> {
    const { data, error } = await this.supabase
      .from('consent_forms')
      .select('*')
      .eq('child_id', childId)
      .is('revoked_at', null)
      .order('signed_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No rows returned
      }
      throw error
    }

    return data
  }

  /**
   * Get all consent forms for a parent's children
   */
  async getConsentsForParent(parentId: string): Promise<ConsentFormWithChild[]> {
    const { data, error } = await this.supabase
      .from('consent_forms')
      .select(`
        *,
        child:children(id, child_full_name, child_preferred_name)
      `)
      .eq('parent_id', parentId)
      .is('revoked_at', null)
      .order('signed_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get children with their consent status for a parent
   */
  async getChildrenWithConsent(parentId: string): Promise<Array<{
    id: string
    child_full_name: string
    child_preferred_name?: string
    child_age: number
    consent_form: ConsentForm | null
  }>> {
    // Get all children for the parent
    const { data: children, error: childrenError } = await this.supabase
      .from('children')
      .select('id, child_full_name, child_preferred_name, child_age')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true })

    if (childrenError) throw childrenError

    // Get consent forms for each child
    const childrenWithConsent = await Promise.all(
      (children || []).map(async (child) => {
        const consent = await this.getConsentForChild(child.id)
        return {
          ...child,
          consent_form: consent
        }
      })
    )

    return childrenWithConsent
  }

  /**
   * Create a new consent form (signing)
   */
  async signConsent(data: {
    child_id: string
    parent_id: string
    social_media_consent: boolean
    liability_consent: boolean
    parent_name_signed: string
    child_name_signed: string
    signature_url: string
    signature_public_id: string
    ip_address?: string
    user_agent?: string
  }): Promise<ConsentForm> {
    // First, revoke any existing consent for this child
    await this.revokeConsent(data.child_id)

    // Create new consent form
    const { data: consent, error } = await this.supabase
      .from('consent_forms')
      .insert([{
        child_id: data.child_id,
        parent_id: data.parent_id,
        social_media_consent: data.social_media_consent,
        liability_consent: data.liability_consent,
        parent_name_signed: data.parent_name_signed,
        child_name_signed: data.child_name_signed,
        signature_url: data.signature_url,
        signature_public_id: data.signature_public_id,
        form_version: CONSENT_FORM_VERSION,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || null,
        signed_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return consent
  }

  /**
   * Revoke consent for a child (marks as revoked, doesn't delete)
   */
  async revokeConsent(childId: string): Promise<void> {
    const { error } = await this.supabase
      .from('consent_forms')
      .update({ revoked_at: new Date().toISOString() })
      .eq('child_id', childId)
      .is('revoked_at', null)

    if (error) throw error
  }

  /**
   * Update social media consent (revokes old, creates new with updated value)
   * This requires a new signature
   */
  async updateSocialMediaConsent(
    childId: string,
    parentId: string,
    enabled: boolean,
    signatureData: {
      parent_name_signed: string
      child_name_signed: string
      signature_url: string
      signature_public_id: string
      ip_address?: string
      user_agent?: string
    }
  ): Promise<ConsentForm> {
    // Get current consent to preserve liability consent status
    const currentConsent = await this.getConsentForChild(childId)

    return this.signConsent({
      child_id: childId,
      parent_id: parentId,
      social_media_consent: enabled,
      liability_consent: currentConsent?.liability_consent ?? true, // Preserve or default to true
      ...signatureData
    })
  }

  /**
   * Get consent forms for admin view (all children)
   */
  async getAllConsentsForAdmin(): Promise<Array<{
    child_id: string
    child_full_name: string
    parent_name: string
    parent_email: string
    social_media_consent: boolean
    liability_consent: boolean
    signed_at: string | null
    has_consent: boolean
  }>> {
    // Get all children with their parent info
    const { data: children, error: childrenError } = await this.supabase
      .from('children')
      .select(`
        id,
        child_full_name,
        parent:parents(id, parent_guardian_names, parent_email)
      `)
      .order('child_full_name', { ascending: true })

    if (childrenError) throw childrenError

    // Get latest consent for each child
    const results = await Promise.all(
      (children || []).map(async (child) => {
        const consent = await this.getConsentForChild(child.id)
        const parent = child.parent as { id: string; parent_guardian_names: string; parent_email: string }

        return {
          child_id: child.id,
          child_full_name: child.child_full_name,
          parent_name: parent?.parent_guardian_names || 'Unknown',
          parent_email: parent?.parent_email || 'Unknown',
          social_media_consent: consent?.social_media_consent ?? false,
          liability_consent: consent?.liability_consent ?? false,
          signed_at: consent?.signed_at || null,
          has_consent: !!consent
        }
      })
    )

    return results
  }

  /**
   * Get consent history for a child (including revoked)
   */
  async getConsentHistory(childId: string): Promise<ConsentForm[]> {
    const { data, error } = await this.supabase
      .from('consent_forms')
      .select('*')
      .eq('child_id', childId)
      .order('signed_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
