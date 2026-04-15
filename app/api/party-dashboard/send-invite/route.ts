import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { party_guest_id, dashboard_token } = body

    if (!party_guest_id || !dashboard_token) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Validate dashboard token
    const { data: partyRequest, error: prError } = await supabase
      .from('party_requests')
      .select('id, request_type, parent_name, child_name_age, preferred_date, package, event_type, preferred_time, selected_menu')
      .eq('dashboard_token', dashboard_token)
      .single()

    if (prError || !partyRequest) {
      return NextResponse.json(
        { success: false, error: 'Invalid dashboard token' },
        { status: 404 }
      )
    }

    // Fetch the party guest
    const { data: guest, error: guestError } = await supabase
      .from('party_guests')
      .select('*')
      .eq('id', party_guest_id)
      .eq('party_request_id', partyRequest.id)
      .single()

    if (guestError || !guest) {
      return NextResponse.json(
        { success: false, error: 'Guest not found' },
        { status: 404 }
      )
    }

    const formUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cocinartepdx.com'}/party-form/${guest.form_token}`

    const isPrivateEvent = partyRequest.request_type === 'private_event'

    const packageNames: { [key: string]: string } = {
      'art-canvas': 'Art: Canvas Painting',
      'diy-party': 'DIY Party',
      'mini-fiesta': 'Mini Fiesta',
      'deluxe-fiesta': 'Deluxe Fiesta',
      'premium-fiesta': 'Premium Fiesta',
      'vip-package': 'VIP Package',
    }

    const menuNames: { [key: string]: string } = {
      'tostadas': 'Baked Tostadas with Shredded Chicken',
      'tamales': 'Mini Tamales Express Tricolor',
      'arepas': 'Turkey and Cheese Arepa Sliders',
      'empanadas': 'Mini Chicken Empanadas',
      'tacos': 'Crispy Sweet Potato and Black Bean Tacos',
      'quesadillas': 'Mini Quesadillas with Monster Guacamole',
      'birria': 'Turkey Birria with Bean Sopes',
      'chicken-rolls': 'Mini Spinach & Cheese Chicken Rolls',
      'wraps': 'Mini Chicken and Veggie Wraps',
      'mac-cheese': 'Mac & Cheese with Hidden Vegetables',
      'custom': 'Custom Menu (to be discussed)',
    }

    const displayName = isPrivateEvent
      ? menuNames[partyRequest.selected_menu || partyRequest.package] || partyRequest.selected_menu || partyRequest.package
      : packageNames[partyRequest.package] || partyRequest.package

    const formattedDate = new Date(partyRequest.preferred_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const headerTitle = isPrivateEvent ? '🎊 Cooking Event Invitation!' : '🎉 Birthday Party Invitation!'
    const headerSubtext = isPrivateEvent
      ? `${guest.child_name} is invited to a cooking event!`
      : `${guest.child_name} is invited to a cooking party!`
    const inviteText = isPrivateEvent
      ? `<strong>${partyRequest.parent_name}</strong> has invited <strong>${guest.child_name}</strong> to a private cooking event at Cocinarte!`
      : `<strong>${partyRequest.parent_name}</strong> has invited <strong>${guest.child_name}</strong> to a birthday cooking party at Cocinarte!`
    const detailsIcon = isPrivateEvent ? '🎊' : '🎂'
    const detailsTitle = isPrivateEvent ? 'Event Details' : 'Party Details'
    const detailLabel = isPrivateEvent ? 'Menu' : 'Package'
    const actionText = isPrivateEvent
      ? 'To attend, please complete the enrollment form. This includes important health, safety, and consent information we need before the event.'
      : 'To attend, please complete the enrollment form for your child. This includes important health, safety, and consent information we need before the party.'

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #F9FAFB;">
        <div style="max-width: 600px; margin: 0 auto; padding: 10px;">
          <!-- Header with Logo -->
          <div style="background: #F0614F; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://www.cocinartepdx.com/cocinarte/cocinarteLogo.png" alt="Cocinarte" style="height: 50px; margin: 0 auto 15px auto; display: block;" />
            <h1 style="margin: 0; font-size: 26px; font-weight: bold; line-height: 1.3;">${headerTitle}</h1>
            <p style="margin: 10px 0 0 0; font-size: 15px; line-height: 1.4; opacity: 0.95;">${headerSubtext}</p>
          </div>

          <!-- Main Content -->
          <div style="background: white; padding: 30px 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${guest.parent_name},
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Great news! ${inviteText}
            </p>

            <!-- Details Box -->
            <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00ADEE;">
              <h3 style="color: #00ADEE; margin: 0 0 12px 0; font-size: 17px;">${detailsIcon} ${detailsTitle}</h3>
              ${isPrivateEvent && partyRequest.event_type ? `<p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Event Type:</strong> ${partyRequest.event_type}</p>` : ''}
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Date:</strong> ${formattedDate}</p>
              ${isPrivateEvent && partyRequest.preferred_time ? `<p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Time:</strong> ${partyRequest.preferred_time}</p>` : ''}
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">${detailLabel}:</strong> ${displayName}</p>
              ${!isPrivateEvent && partyRequest.child_name_age ? `<p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Birthday Child:</strong> ${partyRequest.child_name_age}</p>` : ''}
            </div>

            <!-- Action Required Box -->
            <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FCB414;">
              <h3 style="color: #92400E; margin: 0 0 10px 0; font-size: 16px;">📋 Action Required</h3>
              <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                ${actionText}
              </p>
              <div style="text-align: center;">
                <a href="${formUrl}" style="background: #F0614F; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
                  Complete Enrollment Form
                </a>
              </div>
            </div>

            <p style="color: #6B7280; font-size: 12px; text-align: center; margin-top: 15px; word-break: break-all;">
              Or copy this link: ${formUrl}
            </p>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #F0F9FF; border-radius: 8px; border: 1px solid #BFDBFE;">
              <p style="color: #1E3A8A; margin: 0 0 8px 0; font-size: 15px; font-weight: bold;">Questions? We're here to help!</p>
              <p style="color: #374151; margin: 0; font-size: 14px;">
                📧 <a href="mailto:cocinarte@casitaazulpdx.org" style="color: #F0614F; text-decoration: none; font-weight: bold;">cocinarte@casitaazulpdx.org</a>
                <br>
                📞 <a href="tel:+15039169758" style="color: #F0614F; text-decoration: none; font-weight: bold;">+1 (503) 916-9758</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const emailSubject = isPrivateEvent
      ? `${guest.child_name} is invited to a cooking event at Cocinarte!`
      : `${guest.child_name} is invited to a birthday party at Cocinarte!`

    await sendEmail({
      to: guest.parent_email,
      subject: emailSubject,
      html: emailHtml,
    })

    // Update email_sent_at
    await supabase
      .from('party_guests')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', guest.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send party invite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send invitation email' },
      { status: 500 }
    )
  }
}
