import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { invoice_id, stripe_payment_intent_id } = await request.json()

    if (!invoice_id || !stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'Invoice ID and Payment Intent ID are required' },
        { status: 400 }
      )
    }

    // Update invoice in database
    const supabase = createClient()
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        payment_status: 'paid',
        payment_method: 'stripe',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: stripe_payment_intent_id
      })
      .eq('id', invoice_id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      )
    }

    // Send payment confirmation email
    try {
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount)
      }

      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }

      await transporter.sendMail({
        from: `"Cocinarte" <${process.env.SMTP_FROM}>`,
        to: invoice.recipient_email,
        subject: `Payment Confirmation - Invoice ${invoice.invoice_number}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Confirmation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

            <!-- Header -->
            <div style="background-color: #00ADEE; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <img src="https://www.cocinartepdx.com/cocinarte/cocinarteLogo.png" alt="Cocinarte Logo" style="height: 60px; margin: 0 auto 15px auto; display: block;" />
              <div style="width: 60px; height: 60px; background: white; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00ADEE" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Payment Received!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for your payment</p>
            </div>

            <!-- Content -->
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #1f2937;">
                Dear <strong>${invoice.recipient_name}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; color: #4b5563; line-height: 1.6;">
                We have successfully received your payment for invoice <strong style="color: #000638;">${invoice.invoice_number}</strong>. Your transaction has been completed and confirmed.
              </p>

              <!-- Payment Details -->
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #000638; font-weight: bold;">Payment Details</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 0; color: #6b7280;">Invoice Number:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #000638;">${invoice.invoice_number}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 0; color: #6b7280;">Amount Paid:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #10B981; font-size: 20px;">
                      ${formatCurrency(invoice.total_amount)}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 0; color: #6b7280;">Payment Date:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #000638;">${formatDate(invoice.paid_at)}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px 0; color: #6b7280;">Payment Method:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #000638;">Credit Card (Stripe)</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280;">Transaction ID:</td>
                    <td style="padding: 10px 0; text-align: right; font-weight: 500; font-size: 11px; color: #6b7280; word-break: break-all;">
                      ${stripe_payment_intent_id}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Confirmation Messages -->
              <div style="background-color: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #065F46; font-size: 14px; line-height: 1.8;">
                  <strong style="display: block; margin-bottom: 8px; color: #047857;">Payment Confirmed</strong>
                  ✓ Your payment has been processed successfully<br>
                  ✓ Invoice ${invoice.invoice_number} is now marked as <strong>PAID</strong><br>
                  ✓ A receipt has been generated for your records
                </p>
              </div>

              <p style="margin: 20px 0; color: #4b5563; line-height: 1.6;">
                If you have any questions about this payment or need a detailed receipt, please don't hesitate to contact us.
              </p>

              <p style="margin: 20px 0 0 0; color: #1f2937;">
                Thank you for your business!<br>
                <strong style="color: #000638; font-size: 16px;">The Cocinarte Team</strong>
              </p>

            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; background-color: transparent;">
              <p style="margin: 0 0 10px 0; font-weight: 600; font-size: 18px; color: #000638;">Cocinarte</p>
              <p style="margin: 5px 0; color: #6b7280;">
                Questions? Contact us at <a href="mailto:info@cocinartepdx.com" style="color: #00ADEE; text-decoration: underline;">info@cocinartepdx.com</a>
              </p>
              <p style="margin: 5px 0 0 0; color: #6b7280;">
                Phone: <a href="tel:5039169758" style="color: #00ADEE; text-decoration: none;">(503) 916-9758</a>
              </p>
            </div>

          </body>
          </html>
        `
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice marked as paid successfully'
    })

  } catch (error: any) {
    console.error('Error marking invoice as paid:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
