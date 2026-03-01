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

    // Fetch party request by dashboard token
    const { data: partyRequest, error: prError } = await supabase
      .from('party_requests')
      .select('*')
      .eq('dashboard_token', token)
      .single()

    if (prError || !partyRequest) {
      return NextResponse.json(
        { success: false, error: 'Invalid dashboard link' },
        { status: 404 }
      )
    }

    if (partyRequest.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'This party request has not been approved yet' },
        { status: 403 }
      )
    }

    // Fetch all party guests for this request
    const { data: guests, error: guestsError } = await supabase
      .from('party_guests')
      .select('*')
      .eq('party_request_id', partyRequest.id)
      .order('created_at', { ascending: true })

    if (guestsError) {
      console.error('Error fetching party guests:', guestsError)
      return NextResponse.json(
        { success: false, error: 'Failed to load guest list' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      party_request: {
        id: partyRequest.id,
        preferred_date: partyRequest.preferred_date,
        number_of_children: partyRequest.number_of_children,
        package: partyRequest.package,
        parent_name: partyRequest.parent_name,
        child_name_age: partyRequest.child_name_age,
        status: partyRequest.status,
      },
      guests: guests || [],
    })
  } catch (error) {
    console.error('Party dashboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
