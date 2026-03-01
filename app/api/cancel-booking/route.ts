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

    // Calculate hours until class
    const now = new Date()
    const classDateTime = new Date(`${clase.date}T${clase.time}`)
    const hoursUntil = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    const isLateCancel = hoursUntil < 48

    // Calculate refund amounts
    const stripePaymentAmount = booking.payment_amount - (booking.gift_card_amount_used || 0)
    const totalRefundRatio = booking.payment_amount > 0
      ? calculateRefund(booking.payment_amount, hoursUntil, clase.late_cancel_refund_type, clase.late_cancel_refund_value) / booking.payment_amount
      : (hoursUntil >= 48 ? 1 : 0)

    const stripeRefundAmount = Math.round(stripePaymentAmount * totalRefundRatio * 100) / 100
    const giftCardRefundAmount = Math.round((booking.gift_card_amount_used || 0) * totalRefundRatio * 100) / 100
    const totalRefundAmount = Math.round((stripeRefundAmount + giftCardRefundAmount) * 100) / 100

    // 1. Process Stripe refund
    if (stripeRefundAmount > 0 && booking.stripe_payment_intent_id) {
      try {
        // Check payment intent status
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)

        if (paymentIntent.status === 'requires_capture') {
          // Payment is held (not captured) — cancel the authorization
          if (stripeRefundAmount >= stripePaymentAmount) {
            // Full cancel
            await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id)
          } else {
            // Partial: capture only the non-refunded portion
            const captureAmount = Math.round((stripePaymentAmount - stripeRefundAmount) * 100)
            await stripe.paymentIntents.capture(booking.stripe_payment_intent_id, {
              amount_to_capture: captureAmount,
            })
          }
        } else if (paymentIntent.status === 'succeeded') {
          // Payment was captured — issue a refund
          const refundAmountCents = Math.round(stripeRefundAmount * 100)
          if (refundAmountCents > 0) {
            if (refundAmountCents >= (paymentIntent.amount_received || 0)) {
              // Full refund
              await stripe.refunds.create({
                payment_intent: booking.stripe_payment_intent_id,
              })
            } else {
              // Partial refund
              await stripe.refunds.create({
                payment_intent: booking.stripe_payment_intent_id,
                amount: refundAmountCents,
              })
            }
          }
        }
        // If status is 'canceled' already, nothing to do
      } catch (stripeError: any) {
        console.error('Stripe refund error:', stripeError.message)
        // Continue with cancellation even if Stripe fails — log the error
      }
    } else if (booking.stripe_payment_intent_id && stripeRefundAmount === 0) {
      // No refund, but if payment is held, capture it fully
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)
        if (paymentIntent.status === 'requires_capture') {
          await stripe.paymentIntents.capture(booking.stripe_payment_intent_id)
        }
      } catch (captureError: any) {
        console.error('Payment capture error:', captureError.message)
      }
    }

    // 2. Refund gift card balance proportionally
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
    await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        payment_status: paymentStatus,
        notes: isLateCancel
          ? `Late cancellation — refund: $${totalRefundAmount.toFixed(2)}`
          : `Cancelled 48+ hours before — full refund: $${totalRefundAmount.toFixed(2)}`,
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
