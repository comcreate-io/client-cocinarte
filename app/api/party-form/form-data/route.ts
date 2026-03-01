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
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing token parameter' },
        { status: 400 }
      )
    }

    // Fetch party guest by form token
    const { data: partyGuest, error: pgError } = await supabase
      .from('party_guests')
      .select('*')
      .eq('form_token', token)
      .single()

    if (pgError || !partyGuest) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired form link' },
        { status: 404 }
      )
    }

    // Check if already completed
    if (partyGuest.form_completed_at) {
      return NextResponse.json({
        success: true,
        already_completed: true,
        party_guest: {
          child_name: partyGuest.child_name,
          parent_name: partyGuest.parent_name,
          form_completed_at: partyGuest.form_completed_at,
        },
      })
    }

    // Fetch the parent party request for party details
    const { data: partyRequest, error: prError } = await supabase
      .from('party_requests')
      .select('id, preferred_date, package, parent_name, child_name_age, number_of_children')
      .eq('id', partyGuest.party_request_id)
      .single()

    if (prError || !partyRequest) {
      return NextResponse.json(
        { success: false, error: 'Associated party request not found' },
        { status: 404 }
      )
    }

    // Look up previous guest_children records for this parent email (for reuse)
    const { data: previousChildren } = await supabase
      .from('guest_children')
      .select('*')
      .eq('guest_parent_email', partyGuest.parent_email)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      already_completed: false,
      party_guest: {
        id: partyGuest.id,
        child_name: partyGuest.child_name,
        parent_name: partyGuest.parent_name,
        parent_email: partyGuest.parent_email,
      },
      party_details: {
        preferred_date: partyRequest.preferred_date,
        package: partyRequest.package,
        host_name: partyRequest.parent_name,
        birthday_child: partyRequest.child_name_age,
        number_of_children: partyRequest.number_of_children,
      },
      previous_children: previousChildren || [],
    })
  } catch (error) {
    console.error('Party form form-data error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
