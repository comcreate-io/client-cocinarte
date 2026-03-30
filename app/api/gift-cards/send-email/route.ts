import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { GiftCardsClientService } from '@/lib/supabase/gift-cards-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { giftCardId, recipientEmail, recipientName, purchaserName, message } = body

    if (!giftCardId || !recipientEmail) {
      return NextResponse.json(
        { error: 'Gift card ID and recipient email are required' },
        { status: 400 }
      )
    }

    const giftCardsService = new GiftCardsClientService()
    const giftCard = await giftCardsService.getGiftCardById(giftCardId)

    if (!giftCard) {
      return NextResponse.json(
        { error: 'Gift card not found' },
        { status: 404 }
      )
    }

    // Send the email
    await sendGiftCardEmail(giftCard, {
      recipient_name: recipientName || 'Friend',
      recipient_email: recipientEmail,
      purchaser_name: purchaserName || 'Cocinarte',
      message: message || ''
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending gift card email:', error)
    return NextResponse.json(
      { error: 'Failed to send gift card email' },
      { status: 500 }
    )
  }
}

async function sendGiftCardEmail(giftCard: any, metadata: any) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cocinartepdx.com'

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Poppins', 'Segoe UI', Arial, sans-serif; background-color: #CDECF9;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FEFEFE;">
        <!-- Header -->
        <div style="background-color: #00ADEE; padding: 40px 30px; text-align: center;">
          <h1 style="color: #FEFEFE; margin: 0; font-size: 28px; font-weight: 600;">
            You've Received a Gift Card!
          </h1>
          <p style="color: #FEFEFE; opacity: 0.9; margin: 10px 0 0 0; font-size: 16px;">
            From Cocinarte Cooking School
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #000000; margin: 0 0 20px 0;">
            Hi ${metadata.recipient_name}!
          </p>

          <p style="font-size: 16px; color: #333333; line-height: 1.6; margin: 0 0 30px 0;">
            <strong>${metadata.purchaser_name}</strong> has sent you a Cocinarte gift card!
            Use it to book cooking classes for you or your little chefs.
          </p>

          ${metadata.message ? `
          <div style="background-color: #FFF8E1; border-left: 4px solid #FCB414; padding: 15px 20px; margin: 0 0 30px 0; border-radius: 0 8px 8px 0;">
            <p style="font-size: 14px; color: #666666; margin: 0 0 5px 0; font-weight: 600;">Personal Message:</p>
            <p style="font-size: 16px; color: #333333; margin: 0; font-style: italic;">"${metadata.message}"</p>
          </div>
          ` : ''}

          <!-- Gift Card Display -->
          <div style="background: linear-gradient(135deg, #F0614F 0%, #F48E77 100%); border-radius: 16px; padding: 30px; text-align: center; margin: 0 0 30px 0; box-shadow: 0 4px 15px rgba(240, 97, 79, 0.3);">
            <p style="color: #FEFEFE; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
              Gift Card Value
            </p>
            <p style="color: #FEFEFE; font-size: 48px; font-weight: 700; margin: 0 0 20px 0;">
              $${giftCard.initial_balance.toFixed(2)}
            </p>
            <div style="background-color: rgba(255,255,255,0.95); border-radius: 8px; padding: 15px; display: inline-block;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">
                Your Gift Card Code
              </p>
              <p style="color: #F0614F; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Courier New', monospace; letter-spacing: 3px;">
                ${giftCard.code}
              </p>
            </div>
          </div>

          <!-- How to Use -->
          <div style="background-color: #CDECF9; border-radius: 12px; padding: 25px; margin: 0 0 30px 0;">
            <h3 style="color: #00ADEE; font-size: 18px; margin: 0 0 15px 0;">
              How to Redeem Your Gift Card
            </h3>
            <ol style="color: #333333; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Create an account or log in at Cocinarte</li>
              <li>Go to "My Account" and click "Add Gift Card"</li>
              <li>Enter your gift card code: <strong>${giftCard.code}</strong></li>
              <li>Your balance will be available for booking classes!</li>
            </ol>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}" style="display: inline-block; background-color: #FCB414; color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(252, 180, 20, 0.3);">
              Browse Classes
            </a>
          </div>

          <p style="font-size: 14px; color: #888888; text-align: center; margin: 30px 0 0 0;">
            This gift card is valid for 1 year from the date of purchase.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #00ADEE; padding: 30px; text-align: center;">
          <p style="color: #FEFEFE; font-size: 16px; font-weight: 600; margin: 0 0 10px 0;">
            Cocinarte Cooking School
          </p>
          <p style="color: #FEFEFE; opacity: 0.9; font-size: 14px; margin: 0 0 5px 0;">
            cocinarte@casitaazulpdx.org
          </p>
          <p style="color: #FEFEFE; opacity: 0.9; font-size: 14px; margin: 0;">
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
Email: cocinarte@casitaazulpdx.org
Phone: +1 (503) 916-9758
  `

  await sendEmail({
    to: metadata.recipient_email,
    subject: `${metadata.purchaser_name} sent you a $${giftCard.initial_balance} Cocinarte Gift Card!`,
    html: emailHtml,
    text: textContent
  })

  console.log(`Gift card email sent to ${metadata.recipient_email}`)
}
