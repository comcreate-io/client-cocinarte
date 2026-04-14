import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendEmail } from '@/lib/resend'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

/**
 * Send class cancellation email to a student
 */
async function sendClassCancellationEmail(student: any, clase: any) {
  const parentName = student.students?.parent_name || 'Parent'
  const childName = student.students?.child_name || 'your child'
  const email = student.students?.email

  if (!email) {
    console.log(`  No email for ${childName}`)
    return false
  }

  const classDate = new Date(clase.date).toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const mailOptions = {
    to: email,
    subject: `Class Cancelled: ${clase.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Class Cancelled</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hello ${parentName},</p>
          <p>We regret to inform you that the following class has been cancelled:</p>
          <div style="background: #f3f4f6; padding: 15px; margin: 15px 0;">
            <h3>Cancelled Class:</h3>
            <p><strong>${clase.title}</strong></p>
            <p>Was scheduled for: ${classDate} at ${clase.time}</p>
          </div>
          <div style="background: #d4edda; padding: 15px; margin: 15px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">Payment Information</h3>
            <p style="color: #155724; margin: 10px 0;"><strong>Your card was NOT charged.</strong></p>
            <p style="color: #155724; margin: 10px 0;">Any payment authorization has been completely released, and you will not see any charge on your statement.</p>
          </div>
          <p>We apologize for any inconvenience and hope to see ${childName} in a future class!</p>
          <p>Browse other available classes at: <a href="https://www.cocinartepdx.com">cocinartepdx.com</a></p>
          <p style="margin-top: 20px;">Best regards,<br/>The Cocinarte Team</p>
          <p style="color: #666; font-size: 12px;">
            Questions? Contact us at cocinarte@casitaazulpdx.org or +1 (503) 916-9758
          </p>
        </div>
      </div>
    `,
  }

  try {
    await sendEmail(mailOptions)
    console.log(`  Cancellation email sent to ${email}`)
    return true
  } catch (error: any) {
    console.error(`  Error sending email to ${email}:`, error.message)
    return false
  }
}

/**
 * Cancel a held payment authorization (release the hold)
 */
async function cancelPaymentAuthorization(paymentIntentId: string, bookingId: string) {
  try {
    console.log(`  Cancelling payment authorization: ${paymentIntentId}`)

    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)

    if (paymentIntent.status === 'canceled') {
      await supabase
        .from('bookings')
        .update({
          payment_status: 'canceled',
          booking_status: 'cancelled',
          notes: 'Payment authorization released - class cancelled by admin',
        })
        .eq('id', bookingId)

      console.log(`  Payment authorization canceled successfully`)
      return true
    } else {
      console.log(`  Payment status: ${paymentIntent.status}`)
      return false
    }
  } catch (error: any) {
    console.error(`  Error canceling payment:`, error.message)
    return false
  }
}

/**
 * Refund gift card balance for a booking
 */
async function refundGiftCardBalance(parentId: string, amount: number, bookingId: string) {
  try {
    // Get the first active gift card for this parent to add the refund
    const { data: giftCards } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('redeemed_by_parent_id', parentId)
      .order('created_at', { ascending: false })

    if (!giftCards || giftCards.length === 0) {
      console.log(`  No gift cards found for parent ${parentId}`)
      return false
    }

    // Find a card to add the refund to
    const targetCard = giftCards.find((gc: any) => gc.is_active) || giftCards[0]
    const newBalance = targetCard.current_balance + amount

    // Update the card balance
    const { error } = await supabase
      .from('gift_cards')
      .update({
        current_balance: newBalance,
        is_active: true,
      })
      .eq('id', targetCard.id)

    if (error) {
      console.error('Error refunding gift card balance:', error)
      return false
    }

    // Record the refund transaction
    await supabase.from('gift_card_transactions').insert({
      gift_card_id: targetCard.id,
      amount: amount,
      transaction_type: 'refund',
      booking_id: bookingId,
      description: 'Refund for cancelled class',
    })

    console.log(`  Refunded $${amount} to gift card for parent ${parentId}`)
    return true
  } catch (error) {
    console.error('Error refunding gift card:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { classId } = await request.json()

    if (!classId) {
      return NextResponse.json({ error: 'Missing classId' }, { status: 400 })
    }

    console.log(`\nCancelling class: ${classId}`)

    // Fetch class details
    const { data: clase, error: claseError } = await supabase
      .from('clases')
      .select('*')
      .eq('id', classId)
      .single()

    if (claseError || !clase) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    console.log(`Class: ${clase.title}`)

    // Fetch all enrolled bookings for this class
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(
        `
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
        )
      `
      )
      .eq('class_id', classId)
      .in('booking_status', ['confirmed', 'pending'])

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }

    const enrolledBookings = bookings || []
    console.log(`Found ${enrolledBookings.length} enrolled bookings`)

    let paymentsCanceled = 0
    let paymentsFailed = 0
    let giftCardsRefunded = 0
    let emailsSent = 0
    let emailsFailed = 0

    // Process each booking
    for (const booking of enrolledBookings) {
      const studentName = (booking.students as any)?.child_name || 'Unknown'
      console.log(`\nProcessing booking for: ${studentName}`)

      // 1. Cancel Stripe payment if held
      if (booking.payment_status === 'held' && booking.stripe_payment_intent_id) {
        const success = await cancelPaymentAuthorization(
          booking.stripe_payment_intent_id,
          booking.id
        )
        if (success) {
          paymentsCanceled++
        } else {
          paymentsFailed++
        }
      } else {
        // Update booking status for non-held payments
        await supabase
          .from('bookings')
          .update({
            booking_status: 'cancelled',
            payment_status: 'canceled',
            notes: 'Class cancelled by admin',
          })
          .eq('id', booking.id)
      }

      // 2. Refund gift card if used
      if (booking.gift_card_amount_used && booking.gift_card_amount_used > 0 && booking.parent_id) {
        const refunded = await refundGiftCardBalance(
          booking.parent_id,
          booking.gift_card_amount_used,
          booking.id
        )
        if (refunded) {
          giftCardsRefunded++
        }
      }

      // 3. Send cancellation email
      const emailSent = await sendClassCancellationEmail(booking, clase)
      if (emailSent) {
        emailsSent++
      } else {
        emailsFailed++
      }
    }

    // Mark the class itself as cancelled
    const { error: updateClassError } = await supabase
      .from('clases')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('id', classId)

    if (updateClassError) {
      console.error('Error updating class cancelled_at:', updateClassError)
    } else {
      console.log('Class marked as cancelled')
    }

    const summary = {
      classTitle: clase.title,
      totalBookings: enrolledBookings.length,
      paymentsCanceled,
      paymentsFailed,
      giftCardsRefunded,
      emailsSent,
      emailsFailed,
    }

    console.log('\nCancellation Summary:', summary)

    return NextResponse.json({
      success: true,
      message: 'Class cancelled successfully',
      summary,
    })
  } catch (error) {
    console.error('Error cancelling class:', error)
    return NextResponse.json(
      { error: 'Failed to cancel class' },
      { status: 500 }
    )
  }
}
