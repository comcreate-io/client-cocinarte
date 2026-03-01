import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dashboard_token, child_name, parent_name, parent_email } = body

    if (!dashboard_token || !child_name || !parent_name || !parent_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(parent_email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Fetch party request by dashboard token
    const { data: partyRequest, error: prError } = await supabase
      .from('party_requests')
      .select('id, number_of_children, status')
      .eq('dashboard_token', dashboard_token)
      .single()

    if (prError || !partyRequest) {
      return NextResponse.json(
        { success: false, error: 'Invalid dashboard token' },
        { status: 404 }
      )
    }

    if (partyRequest.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: 'Party request is not approved' },
        { status: 403 }
      )
    }

    // Check guest count
    const { count, error: countError } = await supabase
      .from('party_guests')
      .select('*', { count: 'exact', head: true })
      .eq('party_request_id', partyRequest.id)

    if (countError) {
      return NextResponse.json(
        { success: false, error: 'Failed to check guest count' },
        { status: 500 }
      )
    }

    if ((count || 0) >= partyRequest.number_of_children) {
      return NextResponse.json(
        { success: false, error: `Guest limit reached (${partyRequest.number_of_children} children maximum)` },
        { status: 400 }
      )
    }

    // Insert new party guest
    const { data: guest, error: insertError } = await supabase
      .from('party_guests')
      .insert([{
        party_request_id: partyRequest.id,
        child_name,
        parent_name,
        parent_email,
      }])
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting party guest:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to add guest' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      guest,
    })
  } catch (error) {
    console.error('Add party guest error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
