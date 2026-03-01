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

    // Fetch guest booking by form token
    const { data: guestBooking, error: gbError } = await supabase
      .from('guest_bookings')
      .select('*')
      .eq('form_token', token)
      .single()

    if (gbError || !guestBooking) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired form link' },
        { status: 404 }
      )
    }

    // Check if already completed
    if (guestBooking.form_completed_at) {
      return NextResponse.json({
        success: true,
        already_completed: true,
        guest_booking: {
          guest_parent_name: guestBooking.guest_parent_name,
          guest_child_name: guestBooking.guest_child_name,
          purchaser_name: guestBooking.purchaser_name,
          form_completed_at: guestBooking.form_completed_at,
        },
      })
    }

    // Fetch the booking and class details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        payment_amount,
        booking_status,
        class_id,
        class:clases (
          id,
          title,
          date,
          time,
          price,
          classDuration,
          description
        )
      `)
      .eq('id', guestBooking.booking_id)
      .single()

    if (bookingError || !booking) {
      console.error('Booking query error:', bookingError)
      return NextResponse.json(
        { success: false, error: 'Associated booking not found' },
        { status: 404 }
      )
    }

    // Look up previous guest_children records for this guest parent email (for reuse)
    const { data: previousChildren } = await supabase
      .from('guest_children')
      .select('*')
      .eq('guest_parent_email', guestBooking.guest_parent_email)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      already_completed: false,
      guest_booking: {
        id: guestBooking.id,
        guest_parent_name: guestBooking.guest_parent_name,
        guest_parent_email: guestBooking.guest_parent_email,
        guest_child_name: guestBooking.guest_child_name,
        purchaser_name: guestBooking.purchaser_name,
      },
      class_details: (booking as any).class,
      previous_children: previousChildren || [],
    })
  } catch (error) {
    console.error('Guest booking form-data error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
