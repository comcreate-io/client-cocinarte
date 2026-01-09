import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('child_id')
    const parentId = searchParams.get('parent_id')

    if (!childId && !parentId) {
      return NextResponse.json(
        { success: false, error: 'Either child_id or parent_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // If childId is provided, get consent for specific child
    if (childId) {
      const { data: consent, error } = await supabase
        .from('consent_forms')
        .select('*')
        .eq('child_id', childId)
        .is('revoked_at', null)
        .order('signed_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch consent status' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        has_active_consent: !!consent,
        social_media_consent: consent?.social_media_consent ?? false,
        liability_consent: consent?.liability_consent ?? false,
        consent_form: consent || null,
      })
    }

    // If parentId is provided, get all children with consent status
    if (parentId) {
      // Get all children for the parent
      const { data: children, error: childrenError } = await supabase
        .from('children')
        .select('id, child_full_name, child_preferred_name, child_age')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })

      if (childrenError) {
        console.error('Database error:', childrenError)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch children' },
          { status: 500 }
        )
      }

      // Get consent forms for each child
      const childrenWithConsent = await Promise.all(
        (children || []).map(async (child) => {
          const { data: consent } = await supabase
            .from('consent_forms')
            .select('*')
            .eq('child_id', child.id)
            .is('revoked_at', null)
            .order('signed_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...child,
            consent_form: consent || null,
          }
        })
      )

      return NextResponse.json({
        success: true,
        children: childrenWithConsent,
      })
    }
  } catch (error) {
    console.error('Consent status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consent status' },
      { status: 500 }
    )
  }
}
