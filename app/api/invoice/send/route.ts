import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { invoice_id } = await request.json()

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

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Cocinarte <noreply@cocinarte.com>',
      to: invoice.recipient_email,
      subject: `Invoice ${invoice.invoice_number} from Cocinarte`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoice_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Cocinarte</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Invoice</p>
          </div>

          <!-- Content -->
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

            <!-- Invoice Details -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1e3a8a; margin: 0 0 10px 0; font-size: 24px;">Invoice ${invoice.invoice_number}</h2>
              <div style="display: flex; justify-content: space-between; margin-top: 15px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Invoice Date</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600;">${formatDate(invoice.invoice_date)}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Due Date</p>
                  <p style="margin: 5px 0 0 0; font-weight: 600; color: #dc2626;">${formatDate(invoice.due_date)}</p>
                </div>
              </div>
            </div>

            <!-- Recipient Info -->
            <div style="margin-bottom: 30px; padding: 15px; background: #f9fafb; border-radius: 8px;">
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">Bill To:</p>
              <p style="margin: 0; font-weight: 600; font-size: 16px;">${invoice.recipient_name}</p>
              ${invoice.recipient_company ? `<p style="margin: 5px 0 0 0; color: #6b7280;">${invoice.recipient_company}</p>` : ''}
              <p style="margin: 5px 0 0 0; color: #6b7280;">${invoice.recipient_email}</p>
              ${invoice.recipient_phone ? `<p style="margin: 5px 0 0 0; color: #6b7280;">${invoice.recipient_phone}</p>` : ''}
              ${invoice.recipient_address ? `<p style="margin: 5px 0 0 0; color: #6b7280;">${invoice.recipient_address}</p>` : ''}
            </div>

            <!-- Line Items -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f3f4f6; border-bottom: 2px solid #1e3a8a;">
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
            <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #6b7280;">Subtotal:</span>
                <span style="font-weight: 600;">${formatCurrency(invoice.subtotal)}</span>
              </div>
              ${invoice.tax_rate > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280;">Tax (${invoice.tax_rate}%):</span>
                  <span style="font-weight: 600;">${formatCurrency(invoice.tax_amount)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #e5e7eb; margin-top: 15px;">
                <span style="font-size: 18px; font-weight: 700;">Total:</span>
                <span style="font-size: 24px; font-weight: 700; color: #dc2626;">${formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>

            <!-- Payment Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Pay Invoice Now
              </a>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #6b7280;">
                Or copy this link: <a href="${paymentUrl}" style="color: #3b82f6;">${paymentUrl}</a>
              </p>
            </div>

            <!-- Notes -->
            ${invoice.notes ? `
              <div style="margin-top: 30px; padding: 15px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <p style="margin: 0; font-weight: 600; color: #1e3a8a;">Notes:</p>
                <p style="margin: 10px 0 0 0; color: #1e40af;">${invoice.notes}</p>
              </div>
            ` : ''}

            <!-- Terms -->
            ${invoice.terms ? `
              <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 4px;">
                <p style="margin: 0; font-weight: 600; font-size: 14px; color: #6b7280;">Payment Terms:</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">${invoice.terms}</p>
              </div>
            ` : ''}

          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">Thank you for your business!</p>
            <p style="margin: 10px 0 0 0;">Cocinarte</p>
            <p style="margin: 5px 0 0 0;">
              Questions? Contact us at <a href="mailto:support@cocinarte.com" style="color: #3b82f6;">support@cocinarte.com</a>
            </p>
          </div>

        </body>
        </html>
      `
    })

    if (emailError) {
      console.error('Email send error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email' },
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
