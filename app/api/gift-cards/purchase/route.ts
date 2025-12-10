import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { GiftCardsClientService } from '@/lib/supabase/gift-cards-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      amount,
      purchaserEmail,
      purchaserName,
      recipientEmail,
      recipientName,
      message
    } = body

    if (!amount || !purchaserEmail || !purchaserName || !recipientEmail || !recipientName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (amount < 50 || amount > 500) {
      return NextResponse.json(
        { error: 'Gift card amount must be between $50 and $500' },
        { status: 400 }
      )
    }

    // Create Stripe payment intent for the gift card purchase
    // TODO: TESTING MODE - Force $1 charge (remove for production)
    const testAmount = 100 // $1 in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: testAmount, // Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        type: 'gift_card',
        purchaser_email: purchaserEmail,
        purchaser_name: purchaserName,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        message: message || '',
        gift_card_amount: amount.toString()
      },
      receipt_email: purchaserEmail
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    console.error('Error creating gift card payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
