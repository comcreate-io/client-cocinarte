import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
    const { amount, classTitle, userName, studentName, classId, classDate, classTime, userEmail } = body;

    // Validate required fields
    if (!amount || !classTitle || !classId) {
      console.error('Missing required fields:', { amount, classTitle, classId, body });
      return NextResponse.json(
        { error: 'Missing required fields', details: { amount: !!amount, classTitle: !!classTitle, classId: !!classId } },
        { status: 400 }
      );
    }

    // Check if class is already full (prevent overbooking)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: classData, error: classError } = await supabase
      .from('clases')
      .select('enrolled, maxStudents')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      console.error('Error fetching class data:', classError);
      return NextResponse.json(
        { error: 'Class not found', details: classError?.message || 'Class data not found' },
        { status: 404 }
      );
    }

    const enrolled = classData.enrolled || 0;
    const maxStudents = classData.maxStudents || 0;

    if (enrolled >= maxStudents) {
      return NextResponse.json(
        { error: 'Sorry, this class is now full. Please choose another class.' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with MANUAL CAPTURE (holds funds, doesn't charge)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: 'usd',
      description: `${classTitle}${userName ? ` - ${userName}` : ''}`,
      capture_method: 'manual', // ← KEY: This holds the payment instead of charging immediately
      receipt_email: userEmail, // Send receipt to customer email
      metadata: {
        className: classTitle,
        customerName: userName || 'Guest',
        studentName: studentName || '',
        customerEmail: userEmail || '',
        classId: classId,
        classDate: classDate || '',
        classTime: classTime || '',
      },
      // Show only credit/debit card in PaymentElement
      payment_method_types: ['card'],
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

