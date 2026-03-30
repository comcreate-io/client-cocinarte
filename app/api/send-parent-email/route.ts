import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { isAdminUser } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is an admin
    const isAdmin = await isAdminUser(supabase, user.email)

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { to, subject, message } = await request.json()

    // Validate input
    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const mailOptions = {
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #D97706; margin: 0; font-size: 24px;">Cocinarte PDX</h1>
            </div>
            <div style="color: #333; line-height: 1.6; white-space: pre-wrap;">
              ${message}
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p style="margin: 0;">Cocinarte PDX - Cooking Classes for Kids</p>
              <p style="margin: 5px 0;">📧 cocinarte@casitaazulpdx.org | 📞 (503) 555-0123</p>
              <p style="margin: 5px 0;">Portland, Oregon</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: message,
    }

    await sendEmail(mailOptions)

    console.log(`[Parent Email] Sent to: ${to}`)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    })
  } catch (error) {
    console.error('[Parent Email] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    )
  }
}
