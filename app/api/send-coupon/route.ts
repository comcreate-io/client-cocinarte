import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      couponCode,
      discountType = 'percentage',
      discountPercentage,
      discountAmount,
      recipientEmail,
      recipientName,
      classDetails,
      expiresAt,
      maxUses,
    } = body;

    // Validate required fields
    if (!couponCode || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (discountType === 'percentage' && !discountPercentage) {
      return NextResponse.json(
        { error: 'Missing discount percentage' },
        { status: 400 }
      );
    }

    if (discountType === 'fixed' && !discountAmount) {
      return NextResponse.json(
        { error: 'Missing discount amount' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const greeting = recipientName ? `Hi ${recipientName}` : 'Hello';

    // Build discount display
    const discountDisplay = discountType === 'fixed'
      ? `$${discountAmount} OFF`
      : `${discountPercentage}% OFF`;

    const discountHeroDisplay = discountType === 'fixed'
      ? `$${discountAmount}`
      : `${discountPercentage}%`;

    // Build expiry info
    const expiryHtml = expiresAt
      ? `<p style="color: #F0614F; font-size: 14px; margin-top: 15px; font-weight: bold;">
           Expires: ${new Date(expiresAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
         </p>`
      : '';

    // Build usage info
    const usageNote = maxUses && maxUses > 1
      ? `This coupon can be used up to ${maxUses} times.`
      : 'This coupon is single-use only and cannot be combined with other offers.';

    // Calculate discounted price for class-specific coupons
    const getDiscountedPrice = (price: number) => {
      if (discountType === 'fixed') {
        return Math.max(0, price - discountAmount).toFixed(2);
      }
      return (price * (1 - discountPercentage / 100)).toFixed(2);
    };

    // Customer email content with Cocinarte brand colors
    const customerHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #00ADEE 0%, #0099D6 100%);
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .header {
              color: #FEFEFE;
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              color: #FCB414;
            }
            .coupon-box {
              background: #FEFEFE;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
              border: 3px dashed #F0614F;
            }
            .coupon-code {
              font-size: 36px;
              font-weight: bold;
              color: #F0614F;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
              margin: 20px 0;
            }
            .discount {
              font-size: 48px;
              font-weight: bold;
              color: #F0614F;
              margin: 10px 0;
            }
            .discount-text {
              font-size: 18px;
              color: #555;
              margin-bottom: 20px;
            }
            .instructions {
              background: #CDECF9;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
            }
            .instructions h3 {
              color: #00ADEE;
              margin-top: 0;
            }
            .instructions ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .instructions li {
              margin: 10px 0;
              color: #333;
            }
            .cta-button {
              display: inline-block;
              background: #F48E77;
              color: #FEFEFE !important;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              font-size: 16px;
            }
            .cta-button:hover {
              background: #F0614F;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #CDECF9;
              font-size: 14px;
            }
            .note {
              background: #CDECF9;
              border-left: 4px solid #FCB414;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You've Got a Special Gift!</h1>
              <p>A discount coupon just for you</p>
            </div>

            <div style="color: #FEFEFE; text-align: center; margin-bottom: 30px;">
              <p style="font-size: 18px; margin: 0;">${greeting},</p>
              <p style="font-size: 16px; margin: 10px 0 0 0;">
                We're excited to share this exclusive discount coupon for Cocinarte cooking classes!
              </p>
            </div>

            <div class="coupon-box">
              <div class="discount">${discountHeroDisplay} OFF</div>
              <div class="discount-text">Your Discount Code:</div>
              <div class="coupon-code">${couponCode}</div>
              ${expiryHtml}
              ${classDetails ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #CDECF9;">
                  <h4 style="color: #00ADEE; margin: 0 0 10px 0; font-size: 16px;">Valid for this class only:</h4>
                  <div style="background: #CDECF9; padding: 15px; border-radius: 8px; text-align: left;">
                    <p style="margin: 5px 0; color: #333;"><strong>Class:</strong> ${classDetails.title}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Date:</strong> ${new Date(classDetails.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Time:</strong> ${classDetails.time}</p>
                    <p style="margin: 5px 0; color: #333;"><strong>Original Price:</strong> $${classDetails.price}</p>
                    <p style="margin: 5px 0; color: #F0614F; font-weight: bold;"><strong>Your Price:</strong> $${getDiscountedPrice(classDetails.price)}</p>
                  </div>
                </div>
              ` : `
                <p style="color: #777; font-size: 14px; margin-top: 20px;">
                  This coupon can be used on any Cocinarte class
                </p>
              `}
            </div>

            <div class="instructions">
              <h3>How to Use Your Coupon:</h3>
              <ol>
                <li>Visit our website and browse available cooking classes</li>
                <li>Select the class you'd like to attend</li>
                <li>During checkout, enter the code <strong>${couponCode}</strong> in the coupon field</li>
                <li>Your ${discountDisplay} discount will be applied automatically!</li>
              </ol>
            </div>

            <div style="text-align: center;">
              <a href="https://www.casitaazuleducation.com/cocinarte" class="cta-button">
                Browse Classes Now
              </a>
            </div>

            <div class="note">
              <strong>Important:</strong> ${usageNote} Book your class soon!
            </div>

            <div class="footer">
              <p>Cocinarte - Cooking Classes for All Ages</p>
              <p>Questions? Reply to this email or contact us</p>
              <p style="margin-top: 20px; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Cocinarte. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to customer
    await transporter.sendMail({
      from: `"Cocinarte" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Your ${discountDisplay} Discount Coupon for Cocinarte - ${couponCode}`,
      html: customerHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Coupon email sent successfully'
    });

  } catch (error) {
    console.error('Error sending coupon email:', error);
    return NextResponse.json(
      { error: 'Failed to send coupon email' },
      { status: 500 }
    );
  }
}
