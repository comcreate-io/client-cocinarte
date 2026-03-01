import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      booking_id,
      purchaser_name,
      purchaser_email,
      purchaser_user_id,
      guest_parent_name,
      guest_parent_email,
      guest_child_name,
    } = body

    if (!booking_id || !purchaser_name || !purchaser_email || !guest_parent_name || !guest_parent_email || !guest_child_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const form_token = uuidv4()

    const { data, error } = await supabase
      .from('guest_bookings')
      .insert([{
        booking_id,
        purchaser_user_id,
        purchaser_name,
        purchaser_email,
        guest_parent_name,
        guest_parent_email,
        guest_child_name,
        form_token,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating guest booking:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create guest booking record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      form_token,
      guest_booking_id: data.id,
    })
  } catch (error) {
    console.error('Guest booking create error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
