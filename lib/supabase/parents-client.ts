import { createClient } from './client'
import { Parent, Child, ParentWithChildren, ChildData } from '@/types/student'

export class ParentsClientService {
  private supabase = createClient()

  /**
   * Get parent by email
   */
  async getParentByEmail(email: string): Promise<Parent | null> {
    const { data, error } = await this.supabase
      .from('parents')
      .select('*')
      .eq('parent_email', email)
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
   * Get parent by user ID
   */
  async getParentByUserId(userId: string): Promise<Parent | null> {
    const { data, error } = await this.supabase
      .from('parents')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // PGRST116 = no rows returned, 406 can also occur when no rows match
      if (error.code === 'PGRST116' || error.message?.includes('406')) {
        return null
      }
      // Also handle case where status is 406 (Not Acceptable - no matching rows)
      if ((error as any).status === 406) {
        return null
      }
      throw error
    }

    return data
  }

  /**
   * Get parent with all their children
   */
  async getParentWithChildren(parentId: string): Promise<ParentWithChildren | null> {
    const { data: parent, error: parentError } = await this.supabase
      .from('parents')
      .select('*')
      .eq('id', parentId)
      .single()

    if (parentError) {
      if (parentError.code === 'PGRST116') {
        return null
      }
      throw parentError
    }

    const { data: children, error: childrenError } = await this.supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true })

    if (childrenError) throw childrenError

    // Fetch consent forms for all children (gracefully handle if table doesn't exist)
    const childIds = (children || []).map(c => c.id)
    let consentForms: any[] = []
    if (childIds.length > 0) {
      try {
        const { data: consents, error: consentError } = await this.supabase
          .from('consent_forms')
          .select('*')
          .in('child_id', childIds)
          .is('revoked_at', null)
          .order('signed_at', { ascending: false })

        // Only use consents if no error (table might not exist yet)
        if (!consentError) {
          consentForms = consents || []
        }
      } catch (e) {
        // Consent forms table might not exist yet, continue without it
      }
    }

    // Create a map of child_id to latest consent form
    const consentMap = new Map<string, any>()
    for (const consent of consentForms) {
      if (!consentMap.has(consent.child_id)) {
        consentMap.set(consent.child_id, consent)
      }
    }

    // Attach consent forms to children
    const childrenWithConsent = (children || []).map(child => ({
      ...child,
      consent_form: consentMap.get(child.id) || null
    }))

    return {
      ...parent,
      children: childrenWithConsent
    }
  }

  /**
   * Get parent with children by email
   */
  async getParentWithChildrenByEmail(email: string): Promise<ParentWithChildren | null> {
    const parent = await this.getParentByEmail(email)
    if (!parent) return null

    return this.getParentWithChildren(parent.id)
  }

  /**
   * Get parent with children by user ID
   */
  async getParentWithChildrenByUserId(userId: string): Promise<ParentWithChildren | null> {
    const parent = await this.getParentByUserId(userId)
    if (!parent) return null

    return this.getParentWithChildren(parent.id)
  }

  /**
   * Update parent information
   */
  async updateParent(parentId: string, updates: Partial<Parent>): Promise<Parent> {
    const { data, error } = await this.supabase
      .from('parents')
      .update(updates)
      .eq('id', parentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get all children for a parent
   */
  async getChildren(parentId: string): Promise<Child[]> {
    const { data, error } = await this.supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Get a single child by ID
   */
  async getChild(childId: string): Promise<Child | null> {
    const { data, error } = await this.supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  }

  /**
   * Add a new child to a parent
   */
  async addChild(parentId: string, childData: Omit<ChildData, 'id'>): Promise<Child> {
    const { data, error } = await this.supabase
      .from('children')
      .insert([{
        parent_id: parentId,
        ...childData
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update child information
   */
  async updateChild(childId: string, updates: Partial<Child>): Promise<Child> {
    const { data, error } = await this.supabase
      .from('children')
      .update(updates)
      .eq('id', childId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete a child
   */
  async deleteChild(childId: string): Promise<void> {
    const { error } = await this.supabase
      .from('children')
      .delete()
      .eq('id', childId)

    if (error) throw error
  }

  /**
   * Get children available for booking (for selecting which child to book for)
   */
  async getChildrenForBooking(parentId: string): Promise<Child[]> {
    return this.getChildren(parentId)
  }
}
