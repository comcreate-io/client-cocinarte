import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partyRequestId = searchParams.get('party_request_id')

    if (!partyRequestId) {
      return NextResponse.json(
        { success: false, error: 'Missing party_request_id' },
        { status: 400 }
      )
    }

    // Fetch guests
    const { data: guests, error: guestsError } = await supabase
      .from('party_guests')
      .select('id, child_name, parent_name, parent_email, form_completed_at, email_sent_at, guest_child_id')
      .eq('party_request_id', partyRequestId)
      .order('created_at', { ascending: true })

    if (guestsError) {
      console.error('Error fetching party guests:', guestsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch guests' },
        { status: 500 }
      )
    }

    // Fetch child details for completed guests
    const childIds = (guests || [])
      .filter(g => g.guest_child_id)
      .map(g => g.guest_child_id as string)

    let children: Record<string, any> = {}

    if (childIds.length > 0) {
      const { data: childData, error: childError } = await supabase
        .from('guest_children')
        .select('id, child_full_name, child_age, child_preferred_name, has_cooking_experience, cooking_experience_details, allergies, dietary_restrictions, medical_conditions, emergency_medications, additional_notes, authorized_pickup_persons, custody_restrictions, media_permission, guest_parent_name, guest_parent_phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, liability_consent, social_media_consent, parent_name_signed, child_name_signed, signed_at')
        .in('id', childIds)

      if (childError) {
        console.error('Error fetching guest children:', childError)
      } else if (childData) {
        for (const child of childData) {
          children[child.id] = child
        }
      }
    }

    return NextResponse.json({
      success: true,
      guests: guests || [],
      children,
    })
  } catch (error) {
    console.error('Admin party guests error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
