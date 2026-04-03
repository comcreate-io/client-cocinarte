import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/resend'

const COLORS = {
  navy: '#00ADEE',
  red: '#F0614F',
  orange: '#F48E77',
  yellow: '#FCB414',
  lightBlue: '#CDECF9'
}

function generatePartyEmailHtml(
  partyPackage: string,
  partyDate: string,
  birthdayChild: string,
  subject: string,
  message: string,
  guestChildName: string
): string {
  const formattedMessage = message.replace(/\n/g, '<br>')

  const packageNames: Record<string, string> = {
    'art-canvas': 'Art: Canvas Painting',
    'diy-party': 'DIY Party',
    'mini-fiesta': 'Mini Fiesta',
    'deluxe-fiesta': 'Deluxe Fiesta',
    'premium-fiesta': 'Premium Fiesta',
    'dance-music': 'Dance & Music Party',
    'vip-package': 'VIP Package',
  }

  const packageDisplay = packageNames[partyPackage] || partyPackage

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, ${COLORS.red} 0%, ${COLORS.orange} 100%); padding: 40px 40px 30px 40px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                    🎉 Cocinarte
                  </h1>
                  <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                    Birthday Party
                  </p>
                </td>
              </tr>

              <!-- Party Info Banner -->
              <tr>
                <td style="background-color: #FFF3F1; padding: 20px 40px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: ${COLORS.red}; font-weight: 600;">
                          🎂 ${birthdayChild}'s Birthday Party
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">
                          ${partyDate} &bull; ${packageDisplay}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: ${COLORS.red}; margin: 0 0 20px 0; font-size: 24px;">
                    ${subject}
                  </h2>

                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                    Dear Parent/Guardian of <strong>${guestChildName}</strong>,
                  </p>

                  <div style="color: #333; font-size: 16px; line-height: 1.8; margin: 20px 0; padding: 20px; background-color: #fafafa; border-radius: 8px; border-left: 4px solid ${COLORS.red};">
                    ${formattedMessage}
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
                    Questions? Reply to this email or contact us at
                  </p>
                  <p style="margin: 0;">
                    <a href="mailto:cocinarte@casitaazulpdx.org" style="color: ${COLORS.red}; text-decoration: none; font-weight: 600;">
                      cocinarte@casitaazulpdx.org
                    </a>
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                    &copy; ${new Date().getFullYear()} Cocinarte PDX. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await isAdminUser(supabase, user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { partyRequestId, subject, message } = await request.json()

    if (!partyRequestId || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: partyRequestId, subject, message' },
        { status: 400 }
      )
    }

    // Fetch party request details
    const { data: partyRequest, error: partyError } = await supabase
      .from('party_requests')
      .select('id, preferred_date, package, child_name_age, parent_name')
      .eq('id', partyRequestId)
      .single()

    if (partyError || !partyRequest) {
      return NextResponse.json({ error: 'Party request not found' }, { status: 404 })
    }

    // Format date
    const partyDate = new Date(partyRequest.preferred_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const birthdayChild = partyRequest.child_name_age || 'Birthday Child'

    // Fetch all guests for this party
    const { data: guests, error: guestsError } = await supabase
      .from('party_guests')
      .select('id, child_name, parent_name, parent_email')
      .eq('party_request_id', partyRequestId)

    if (guestsError) {
      return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
    }

    if (!guests || guests.length === 0) {
      return NextResponse.json({ error: 'No guests found for this party' }, { status: 404 })
    }

    // Deduplicate by email
    const seen = new Set<string>()
    const uniqueGuests = guests.filter(g => {
      const email = g.parent_email?.toLowerCase().trim()
      if (!email || seen.has(email)) return false
      seen.add(email)
      return true
    })

    // Send emails to all unique guest parents
    const emailPromises = uniqueGuests.map(async (guest) => {
      try {
        const html = generatePartyEmailHtml(
          partyRequest.package,
          partyDate,
          birthdayChild,
          subject,
          message,
          guest.child_name || 'Guest'
        )

        await sendEmail({
          to: guest.parent_email,
          subject: `[Cocinarte] ${subject}`,
          html,
        })

        return { success: true, email: guest.parent_email }
      } catch (error) {
        console.error(`Failed to send email to ${guest.parent_email}:`, error)
        return { success: false, email: guest.parent_email, error: String(error) }
      }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: 'Emails sent successfully',
      stats: {
        total: uniqueGuests.length,
        sent: successCount,
        failed: failedCount,
      },
      details: results,
    })
  } catch (error) {
    console.error('Error sending party emails:', error)
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
  }
}
