import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * DEPRECATED: This endpoint was used to cancel held payment authorizations.
 *
 * The payment system has been updated to charge immediately upon booking.
 * For refunds of completed payments, use /api/stripe/refund instead.
 *
 * This endpoint is kept for backward compatibility but should not be used for new bookings.
 */

export async function POST(request: NextRequest) {
  try {
    // Check for Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to .env.local' },
        { status: 500 }
      );
    }

    // Initialize Stripe client
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });

    const body = await request.json();
    const { paymentIntentId } = body;

    // Validate required fields
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing payment intent ID' },
        { status: 400 }
      );
    }

    // Try to retrieve the payment intent first
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // If payment was already captured (succeeded), we need to refund instead of cancel
    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json(
        {
          error: 'Payment already completed. Use /api/stripe/refund to refund this payment.',
          shouldUseRefund: true
        },
        { status: 400 }
      );
    }

    // Cancel the held payment authorization (for old bookings only)
    const canceledPayment = await stripe.paymentIntents.cancel(paymentIntentId);

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: canceledPayment.id,
        status: canceledPayment.status,
        canceled: canceledPayment.status === 'canceled',
      },
    });
  } catch (error: any) {
    console.error('Error canceling payment:', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel payment',
        details: error.message
      },
      { status: 500 }
    );
  }
}

