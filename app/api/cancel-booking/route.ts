import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

function calculateRefund(
  paymentAmount: number,
  hoursUntil: number,
  refundType: string | null | undefined,
  refundValue: number | null | undefined
): number {
  // 48+ hours before class → full refund
  if (hoursUntil >= 48) {
    return paymentAmount
  }

  // < 48 hours: use class policy
  if (!refundType || refundValue == null) {
    return 0 // no late refund policy set
  }

  if (refundType === 'percentage') {
    return Math.round(paymentAmount * (refundValue / 100) * 100) / 100
  }

  if (refundType === 'fixed') {
    return Math.min(refundValue, paymentAmount)
  }

  return 0
}

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    // Fetch booking with class data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        class_id,
        student_id,
        payment_status,
        payment_amount,
        stripe_payment_intent_id,
        gift_card_amount_used,
        parent_id,
        booking_status,
        booking_comments,
        students:student_id (
          id,
          parent_name,
          child_name,
          email
        ),
        clases:class_id (
          id,
          title,
          date,
          time,
          price,
          enrolled,
          late_cancel_refund_type,
          late_cancel_refund_value
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.booking_status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 })
    }

    const clase = booking.clases as any
    const student = booking.students as any

    if (!clase) {
      return NextResponse.json({ error: 'Class data not found' }, { status: 404 })
    }

    // Check if this was an admin enrollment — no refund allowed
    const isAdminEnrollment = booking.booking_comments?.startsWith('[Admin enrollment by')

    if (isAdminEnrollment) {
      // Cancel booking without any refund
      await supabase
        .from('bookings')
        .update({
          booking_status: 'cancelled',
          payment_status: 'canceled',
          notes: 'Admin enrollment — no refund',
        })
        .eq('id', bookingId)

      if (clase.enrolled > 0) {
        await supabase
          .from('clases')
          .update({ enrolled: clase.enrolled - 1 })
          .eq('id', clase.id)
      }

      // Send cancellation email (with $0 refund)
      if (student?.email) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/booking-cancellation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: student.email,
              userName: student.parent_name,
              studentName: student.child_name,
              classTitle: clase.title,
              classDate: clase.date,
              classTime: clase.time,
              classPrice: booking.payment_amount,
              bookingId: booking.id,
              refundAmount: 0,
              isLateCancel: false,
              isAdminEnrollment: true,
            }),
          })
        } catch (emailError) {
          console.error('Error sending cancellation email:', emailError)
        }
      }

      return NextResponse.json({
        success: true,
        refundAmount: 0,
        stripeRefundAmount: 0,
        giftCardRefundAmount: 0,
        isLateCancel: false,
        isAdminEnrollment: true,
      })
    }

    // Calculate hours until class
    const now = new Date()
    const classDateTime = new Date(`${clase.date}T${clase.time}`)
    const hoursUntil = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    const isLateCancel = hoursUntil < 48

    // Determine ACTUAL amounts paid (excluding coupon discounts)
    // Use Stripe payment intent as source of truth for the real charge
    const giftCardUsed = booking.gift_card_amount_used || 0
    let actualStripeCharge = 0

    if (booking.stripe_payment_intent_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)
        // amount_received is in cents — convert to dollars
        actualStripeCharge = (paymentIntent.amount_received || 0) / 100
      } catch (err: any) {
        console.error('Error retrieving payment intent:', err.message)
        // Fallback: estimate from payment_amount minus gift card
        actualStripeCharge = Math.max(0, booking.payment_amount - giftCardUsed)
      }
    }

    // For bookings with multiple children sharing the same payment intent,
    // calculate this booking's proportional share of the Stripe charge
    let thisBookingStripeShare = actualStripeCharge
    if (booking.stripe_payment_intent_id) {
      const { data: siblingBookings } = await supabase
        .from('bookings')
        .select('id, payment_amount')
        .eq('stripe_payment_intent_id', booking.stripe_payment_intent_id)
        .neq('booking_status', 'cancelled')

      if (siblingBookings && siblingBookings.length > 1) {
        const totalPaymentAmount = siblingBookings.reduce((sum: number, b: any) => sum + b.payment_amount, 0)
        thisBookingStripeShare = totalPaymentAmount > 0
          ? (booking.payment_amount / totalPaymentAmount) * actualStripeCharge
          : actualStripeCharge / siblingBookings.length
      }
    }

    // The actual refundable amount is only what was really paid (Stripe + gift card)
    // Coupon discounts are NOT refundable
    const actualPaid = Math.round((thisBookingStripeShare + giftCardUsed) * 100) / 100

    // Apply refund policy based on timing
    const refundRatio = actualPaid > 0
      ? calculateRefund(actualPaid, hoursUntil, clase.late_cancel_refund_type, clase.late_cancel_refund_value) / actualPaid
      : (hoursUntil >= 48 ? 1 : 0)

    const stripeRefundAmount = Math.round(thisBookingStripeShare * refundRatio * 100) / 100
    const giftCardRefundAmount = Math.round(giftCardUsed * refundRatio * 100) / 100
    const totalRefundAmount = Math.round((stripeRefundAmount + giftCardRefundAmount) * 100) / 100

    console.log(`[Cancel Booking] payment_amount: $${booking.payment_amount}, actualStripeCharge: $${actualStripeCharge}, thisBookingStripeShare: $${thisBookingStripeShare}, giftCardUsed: $${giftCardUsed}, refundRatio: ${refundRatio}, stripeRefund: $${stripeRefundAmount}, giftCardRefund: $${giftCardRefundAmount}`)

    // 1. Process Stripe refund (only refund actual money charged, never coupon amounts)
    if (stripeRefundAmount > 0 && booking.stripe_payment_intent_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)

        if (paymentIntent.status === 'requires_capture') {
          // Payment is held (not captured) — cancel the authorization
          if (stripeRefundAmount >= thisBookingStripeShare) {
            await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id)
          } else {
            const captureAmount = Math.round((thisBookingStripeShare - stripeRefundAmount) * 100)
            await stripe.paymentIntents.capture(booking.stripe_payment_intent_id, {
              amount_to_capture: captureAmount,
            })
          }
        } else if (paymentIntent.status === 'succeeded') {
          const refundAmountCents = Math.round(stripeRefundAmount * 100)
          const amountReceived = paymentIntent.amount_received || 0
          if (refundAmountCents > 0) {
            // Never refund more than what Stripe actually received
            const safeRefundCents = Math.min(refundAmountCents, amountReceived)
            if (safeRefundCents >= amountReceived) {
              await stripe.refunds.create({
                payment_intent: booking.stripe_payment_intent_id,
              })
            } else if (safeRefundCents > 0) {
              await stripe.refunds.create({
                payment_intent: booking.stripe_payment_intent_id,
                amount: safeRefundCents,
              })
            }
          }
        }
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError.message)
      }
    } else if (booking.stripe_payment_intent_id && stripeRefundAmount === 0) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)
        if (paymentIntent.status === 'requires_capture') {
          await stripe.paymentIntents.capture(booking.stripe_payment_intent_id)
        }
      } catch (captureError: any) {
        console.error('Payment capture error:', captureError.message)
      }
    }

    // 2. Refund gift card balance (gift card money goes back to gift card, not Stripe)
    if (giftCardRefundAmount > 0 && booking.parent_id) {
      try {
        const { data: giftCards } = await supabase
          .from('gift_cards')
          .select('*')
          .eq('redeemed_by_parent_id', booking.parent_id)
          .order('created_at', { ascending: false })

        if (giftCards && giftCards.length > 0) {
          const targetCard = giftCards.find((gc: any) => gc.is_active) || giftCards[0]
          const newBalance = targetCard.current_balance + giftCardRefundAmount

          await supabase
            .from('gift_cards')
            .update({ current_balance: newBalance, is_active: true })
            .eq('id', targetCard.id)

          await supabase.from('gift_card_transactions').insert({
            gift_card_id: targetCard.id,
            amount: giftCardRefundAmount,
            transaction_type: 'refund',
            booking_id: booking.id,
            description: `Refund for cancelled booking: ${clase.title}`,
          })
        }
      } catch (gcError) {
        console.error('Gift card refund error:', gcError)
      }
    }

    // 3. Update booking status
    const paymentStatus = totalRefundAmount > 0 ? 'refunded' : 'canceled'
    const refundBreakdown = []
    if (stripeRefundAmount > 0) refundBreakdown.push(`$${stripeRefundAmount.toFixed(2)} to card`)
    if (giftCardRefundAmount > 0) refundBreakdown.push(`$${giftCardRefundAmount.toFixed(2)} to gift card`)
    const refundDetails = refundBreakdown.length > 0 ? refundBreakdown.join(', ') : 'no refund'

    await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        payment_status: paymentStatus,
        notes: isLateCancel
          ? `Late cancellation — ${refundDetails}`
          : `Cancelled 48+ hours before — ${refundDetails}`,
      })
      .eq('id', bookingId)

    // 4. Decrement class enrolled count
    if (clase.enrolled > 0) {
      await supabase
        .from('clases')
        .update({ enrolled: clase.enrolled - 1 })
        .eq('id', clase.id)
    }

    // 5. Send cancellation email
    if (student?.email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/booking-cancellation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: student.email,
            userName: student.parent_name,
            studentName: student.child_name,
            classTitle: clase.title,
            classDate: clase.date,
            classTime: clase.time,
            classPrice: booking.payment_amount,
            bookingId: booking.id,
            refundAmount: totalRefundAmount,
            isLateCancel,
          }),
        })
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      refundAmount: totalRefundAmount,
      stripeRefundAmount,
      giftCardRefundAmount,
      isLateCancel,
    })
  } catch (error: any) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking', details: error.message },
      { status: 500 }
    )
  }
}
