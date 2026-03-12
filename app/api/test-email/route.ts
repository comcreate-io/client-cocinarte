import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/admin'

export async function GET() {
  // Require admin authentication to prevent unwanted test emails
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = await isAdminUser(supabase, user.email)
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured' },
      { status: 500 }
    )
  }

  const to = (process.env.CONTACT_EMAIL || 'test@example.com')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)

  try {
    const result = await sendEmail({
      to,
      subject: 'Cocinarte Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #00ADEE;">Cocinarte Email Test</h1>
          <p>If you're reading this, your Resend email integration is working correctly!</p>
          <p style="color: #6b7280; font-size: 14px;">
            Sent at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
      id: result?.id,
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
