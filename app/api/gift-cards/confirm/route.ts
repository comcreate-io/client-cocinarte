import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { GiftCardsClientService } from '@/lib/supabase/gift-cards-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the payment intent to get metadata
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const { metadata } = paymentIntent

    if (metadata.type !== 'gift_card') {
      return NextResponse.json(
        { error: 'Invalid payment type' },
        { status: 400 }
      )
    }

    // Create the gift card in the database
    const giftCardsService = new GiftCardsClientService()
    const giftCard = await giftCardsService.createGiftCard({
      initial_balance: parseFloat(metadata.gift_card_amount),
      purchaser_email: metadata.purchaser_email,
      purchaser_name: metadata.purchaser_name,
      recipient_email: metadata.recipient_email,
      recipient_name: metadata.recipient_name,
      message: metadata.message || undefined
    })

    // Send gift card email to recipient
    await sendGiftCardEmail(giftCard, metadata)

    // Mark gift card as sent
    await giftCardsService.markGiftCardAsSent(giftCard.id)

    return NextResponse.json({
      success: true,
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        amount: giftCard.initial_balance
      }
    })
  } catch (error) {
    console.error('Error confirming gift card purchase:', error)
    return NextResponse.json(
      { error: 'Failed to confirm gift card purchase' },
      { status: 500 }
    )
  }
}

async function sendGiftCardEmail(giftCard: any, metadata: any) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cocinartepdx.com'

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
            You've Received a Gift Card!
          </h1>
          <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 16px;">
            From Cocinarte Cooking School
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">
            Hi ${metadata.recipient_name}!
          </p>

          <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 30px 0;">
            <strong>${metadata.purchaser_name}</strong> has sent you a Cocinarte gift card!
            Use it to book cooking classes for you or your little chefs.
          </p>

          ${metadata.message ? `
          <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 0 0 30px 0; border-radius: 0 8px 8px 0;">
            <p style="font-size: 14px; color: #666; margin: 0 0 5px 0; font-weight: 600;">Personal Message:</p>
            <p style="font-size: 16px; color: #333; margin: 0; font-style: italic;">"${metadata.message}"</p>
          </div>
          ` : ''}

          <!-- Gift Card Display -->
          <div style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); border-radius: 16px; padding: 30px; text-align: center; margin: 0 0 30px 0; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);">
            <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
              Gift Card Value
            </p>
            <p style="color: #ffffff; font-size: 48px; font-weight: 700; margin: 0 0 20px 0;">
              $${giftCard.initial_balance.toFixed(2)}
            </p>
            <div style="background-color: rgba(255,255,255,0.95); border-radius: 8px; padding: 15px; display: inline-block;">
              <p style="color: #666; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">
                Your Gift Card Code
              </p>
              <p style="color: #1e3a5f; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 3px;">
                ${giftCard.code}
              </p>
            </div>
          </div>

          <!-- How to Use -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
            <h3 style="color: #1e3a5f; font-size: 18px; margin: 0 0 15px 0;">
              How to Redeem Your Gift Card
            </h3>
            <ol style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Create an account or log in at Cocinarte</li>
              <li>Go to "My Account" and click "Add Gift Card"</li>
              <li>Enter your gift card code: <strong>${giftCard.code}</strong></li>
              <li>Your balance will be available for booking classes!</li>
            </ol>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(30, 58, 95, 0.3);">
              Browse Classes
            </a>
          </div>

          <p style="font-size: 14px; color: #888; text-align: center; margin: 30px 0 0 0;">
            This gift card is valid for 1 year from the date of purchase.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #1e3a5f; padding: 30px; text-align: center;">
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
            Cocinarte Cooking School
          </p>
          <p style="color: #a0aec0; font-size: 14px; margin: 0 0 5px 0;">
            info@cocinartepdx.com
          </p>
          <p style="color: #a0aec0; font-size: 14px; margin: 0;">
            +1 (503) 916-9758
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
You've Received a Gift Card from Cocinarte!

Hi ${metadata.recipient_name}!

${metadata.purchaser_name} has sent you a Cocinarte gift card!

${metadata.message ? `Personal Message: "${metadata.message}"` : ''}

GIFT CARD DETAILS:
Value: $${giftCard.initial_balance.toFixed(2)}
Code: ${giftCard.code}

HOW TO REDEEM:
1. Create an account or log in at Cocinarte
2. Go to "My Account" and click "Add Gift Card"
3. Enter your gift card code: ${giftCard.code}
4. Your balance will be available for booking classes!

Visit us at: ${appUrl}

This gift card is valid for 1 year from the date of purchase.

---
Cocinarte Cooking School
Email: info@cocinartepdx.com
Phone: +1 (503) 916-9758
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: metadata.recipient_email,
    subject: `${metadata.purchaser_name} sent you a $${giftCard.initial_balance} Cocinarte Gift Card!`,
    html: emailHtml,
    text: textContent
  })

  // Also send confirmation to purchaser
  const purchaserEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
            Gift Card Sent Successfully!
          </h1>
        </div>

        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">
            Hi ${metadata.purchaser_name}!
          </p>

          <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 30px 0;">
            Your gift card has been sent to <strong>${metadata.recipient_name}</strong> at ${metadata.recipient_email}.
          </p>

          <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
            <h3 style="color: #166534; font-size: 16px; margin: 0 0 15px 0;">Gift Card Details</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600;">$${giftCard.initial_balance.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Code:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; font-family: monospace;">${giftCard.code}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Recipient:</td>
                <td style="padding: 8px 0; color: #333;">${metadata.recipient_name}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #666; margin: 0;">
            Thank you for sharing the joy of cooking!
          </p>
        </div>

        <div style="background-color: #1e3a5f; padding: 30px; text-align: center;">
          <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
            Cocinarte Cooking School
          </p>
          <p style="color: #a0aec0; font-size: 14px; margin: 0;">
            info@cocinartepdx.com | +1 (503) 916-9758
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: metadata.purchaser_email,
    subject: `Your Cocinarte Gift Card has been sent to ${metadata.recipient_name}!`,
    html: purchaserEmailHtml,
    text: `Gift Card Sent Successfully!\n\nYour $${giftCard.initial_balance} gift card has been sent to ${metadata.recipient_name} (${metadata.recipient_email}).\n\nCode: ${giftCard.code}\n\nThank you for sharing the joy of cooking!\n\nCocinarte Cooking School`
  })

  console.log(`Gift card email sent to ${metadata.recipient_email}`)
}
