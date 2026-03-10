import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { invoice_id, custom_email } = await request.json()

    if (!invoice_id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Get invoice from database
    const supabase = createClient()
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Format amounts
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

    // Generate line items HTML
    const lineItemsHtml = invoice.line_items.map((item: any) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">${item.description}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">${formatCurrency(item.unit_price)}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600;">${formatCurrency(item.amount)}</td>
      </tr>
    `).join('')

    // Create payment link
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}/pay`

    // Use custom email if provided, otherwise use invoice recipient email
    const emailTo = custom_email || invoice.recipient_email

    // Send email using Resend
    try {
      await sendEmail({
        to: emailTo,
        subject: `Invoice ${invoice.invoice_number} from Cocinarte`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoice_number}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">

          <!-- Header -->
          <div style="background-color: #00ADEE; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <img src="https://www.cocinartepdx.com/cocinarte/cocinarteLogo.png" alt="Cocinarte Logo" style="height: 60px; margin: 0 auto 15px auto; display: block;" />
            <p style="margin: 10px 0 0 0; font-size: 18px;">Invoice</p>
          </div>

          <!-- Content -->
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

            <!-- Invoice Details -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #000638; margin: 0 0 15px 0; font-size: 24px; font-weight: bold;">Invoice ${invoice.invoice_number}</h2>
              <table style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 15px; width: 50%;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Invoice Date</p>
                    <p style="margin: 5px 0 0 0; font-weight: 600; color: #000638;">${formatDate(invoice.invoice_date)}</p>
                  </td>
                  <td style="padding: 15px; width: 50%;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Due Date</p>
                    <p style="margin: 5px 0 0 0; font-weight: 600; color: #EF4444;">${formatDate(invoice.due_date)}</p>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Recipient Info -->
            <div style="margin-bottom: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #00ADEE;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Bill To:</p>
              <p style="margin: 0; font-weight: 600; font-size: 16px; color: #000638;">${invoice.recipient_name}</p>
              ${invoice.recipient_company ? `<p style="margin: 5px 0 0 0; color: #4b5563;">${invoice.recipient_company}</p>` : ''}
              <p style="margin: 5px 0 0 0; color: #4b5563;">${invoice.recipient_email}</p>
              ${invoice.recipient_phone ? `<p style="margin: 5px 0 0 0; color: #4b5563;">${invoice.recipient_phone}</p>` : ''}
              ${invoice.recipient_address ? `<p style="margin: 5px 0 0 0; color: #4b5563;">${invoice.recipient_address}</p>` : ''}
            </div>

            <!-- Line Items -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #000638; color: white;">
                  <th style="padding: 12px; text-align: left; font-weight: 600;">Description</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemsHtml}
              </tbody>
            </table>

            <!-- Totals -->
            <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px;">
                <span style="color: #6b7280;">Subtotal:</span>
                <span style="font-weight: 600; color: #000638;">${formatCurrency(invoice.subtotal)}</span>
              </div>
              ${invoice.tax_rate > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px;">
                  <span style="color: #6b7280;">Tax (${invoice.tax_rate}%):</span>
                  <span style="font-weight: 600; color: #000638;">${formatCurrency(invoice.tax_amount)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #000638;">
                <span style="font-size: 18px; font-weight: 700; color: #000638;">Total:</span>
                <span style="font-size: 24px; font-weight: 700; color: #EF4444;">${formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>

            <!-- Payment Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" style="display: inline-block; background-color: #F97316; color: white; padding: 16px 48px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                Pay Invoice Now
              </a>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">
                Or copy this link: <a href="${paymentUrl}" style="color: #00ADEE; text-decoration: underline;">${paymentUrl}</a>
              </p>
            </div>

            <!-- Notes -->
            ${invoice.notes ? `
              <div style="margin-top: 30px; padding: 15px; background-color: #DBEAFE; border-left: 4px solid #00ADEE; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #000638;">Notes:</p>
                <p style="margin: 0; color: #1f2937; line-height: 1.5;">${invoice.notes}</p>
              </div>
            ` : ''}

            <!-- Terms -->
            ${invoice.terms ? `
              <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; font-weight: 600; font-size: 14px; color: #000638;">Payment Terms:</p>
                <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">${invoice.terms}</p>
              </div>
            ` : ''}

          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; background-color: transparent;">
            <p style="margin: 0; font-size: 16px; color: #1f2937;">Thank you for your business!</p>
            <p style="margin: 10px 0 0 0; font-weight: 600; font-size: 18px; color: #000638;">Cocinarte</p>
            <p style="margin: 5px 0 0 0; color: #6b7280;">
              Questions? Contact us at <a href="mailto:info@cocinartepdx.com" style="color: #00ADEE; text-decoration: underline;">info@cocinartepdx.com</a>
            </p>
            <p style="margin: 5px 0 0 0; color: #6b7280;">
              Phone: <a href="tel:5039169758" style="color: #00ADEE; text-decoration: none;">(503) 916-9758</a>
            </p>
          </div>

        </body>
        </html>
      `,
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email', details: emailError instanceof Error ? emailError.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // Update invoice to mark as sent
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', invoice_id)

    if (updateError) {
      console.error('Failed to update invoice:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully'
    })

  } catch (error) {
    console.error('Error sending invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
