import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if payment is on hold (requires_capture means authorization succeeded)
    const isHeldSuccessfully = paymentIntent.status === 'requires_capture';
    
    console.log(`Payment Intent ${paymentIntentId} status: ${paymentIntent.status}`);
    console.log(`Payment hold ${isHeldSuccessfully ? 'SUCCESSFUL' : 'FAILED'}`);

    return NextResponse.json({
      success: isHeldSuccessfully,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      paymentMethod: paymentIntent.payment_method,
    });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify payment', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

