import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, action, request: partyRequest, adminNotes } = body

    if (!requestId || !action || !partyRequest) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const isPrivateEvent = partyRequest.request_type === 'private_event'

    const packageNames: { [key: string]: string } = {
      'art-canvas': 'Art: Canvas Painting',
      'diy-party': 'DIY Party',
      'mini-fiesta': 'Mini Fiesta',
      'deluxe-fiesta': 'Deluxe Fiesta',
      'premium-fiesta': 'Premium Fiesta',
      'vip-package': 'VIP Package'
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
      timeZone: 'UTC'
    })

    const isApproved = action === 'approve'
    const parentFirstName = partyRequest.parent_name.split(' ')[0]

    // Fetch dashboard token for approved requests
    let dashboardUrl = ''
    if (isApproved) {
      const { data: prData } = await supabase
        .from('party_requests')
        .select('dashboard_token')
        .eq('id', requestId)
        .single()

      if (prData?.dashboard_token) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cocinartepdx.com'
        dashboardUrl = `${baseUrl}/party-dashboard/${prData.dashboard_token}`
      }
    }

    // Contextual labels
    const eventLabel = isPrivateEvent ? 'Private Event' : 'Birthday Party'
    const detailLabel = isPrivateEvent ? 'Selected Menu' : 'Package'
    const guestLabel = isPrivateEvent ? `${partyRequest.number_of_children} guests` : `${partyRequest.number_of_children} kids`
    const dashboardLabel = isPrivateEvent ? 'Event Dashboard' : 'Party Dashboard'

    // Email content for approval
    const approvalEmailContent = {
      subject: isPrivateEvent
        ? `🎊 Your Private Event Request Has Been Approved!`
        : `🎉 Your Birthday Party Request Has Been Approved!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #F9FAFB;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: #F0614F; color: white; padding: 35px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <img src="https://www.cocinartepdx.com/cocinarte/cocinarteLogo.png" alt="Cocinarte" style="height: 50px; margin: 0 auto 15px auto; display: block;" />
              <h1 style="margin: 0; font-size: 30px; font-weight: bold;">${isPrivateEvent ? '🎊 Event Approved! 🎊' : '🎉 Party Approved! 🎉'}</h1>
              <p style="margin: 12px 0 0 0; font-size: 16px; opacity: 0.95;">Your ${eventLabel.toLowerCase()} request has been confirmed</p>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 30px 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${parentFirstName},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! We're excited to let you know that your ${eventLabel.toLowerCase()} request has been approved!
              </p>

              <!-- Event Details -->
              <div style="background: #F0F9FF; padding: 22px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #00ADEE;">
                <h3 style="color: #00ADEE; margin: 0 0 15px 0; font-size: 18px;">${isPrivateEvent ? '🎊' : '🎂'} Your ${eventLabel} Details</h3>
                ${isPrivateEvent && partyRequest.event_type ? `<p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Event Type:</strong> ${partyRequest.event_type}</p>` : ''}
                <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Date:</strong> ${formattedDate}</p>
                ${isPrivateEvent && partyRequest.preferred_time ? `<p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Time:</strong> ${partyRequest.preferred_time}</p>` : ''}
                <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">${detailLabel}:</strong> ${displayName}</p>
                <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">${isPrivateEvent ? 'Number of Guests' : 'Number of Children'}:</strong> ${guestLabel}</p>
              </div>

              <!-- Next Steps -->
              <div style="background: #FEF3C7; padding: 22px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FCB414;">
                <h3 style="color: #92400E; margin: 0 0 12px 0; font-size: 17px;">📋 Next Steps: Set Up Your Guest List</h3>
                <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 15px;">
                  Use your ${dashboardLabel} to add your guest list and track enrollment forms. Each guest will receive an email with a form to complete.
                </p>
                ${dashboardUrl ? `
                <div style="text-align: center;">
                  <a href="${dashboardUrl}" style="background: #F0614F; color: white; padding: 16px 36px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(240, 97, 79, 0.3);">
                    Open Your ${dashboardLabel}
                  </a>
                </div>
                ` : ''}
              </div>

              <!-- Excitement message -->
              <div style="background: #FCB414; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="color: white; margin: 0 0 10px 0; font-size: 16px;">${isPrivateEvent ? '🎊' : '🎉'} We Can't Wait!</h4>
                <p style="color: white; margin: 0; font-size: 15px; line-height: 1.6;">
                  ${isPrivateEvent
                    ? "We're going to make this a memorable cooking experience for your group. Get ready for an amazing culinary adventure!"
                    : "We're going to make this birthday celebration extra special. Get ready for a cooking adventure your child and their friends will love!"}
                </p>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; padding: 20px; background: #F0F9FF; border-radius: 8px; border: 1px solid #BFDBFE;">
                <p style="color: #1E3A8A; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">Questions? We're here to help!</p>
                <p style="color: #374151; margin: 0; font-size: 15px;">
                  📧 <a href="mailto:cocinarte@casitaazulpdx.org" style="color: #F0614F; text-decoration: none; font-weight: bold;">cocinarte@casitaazulpdx.org</a>
                  <br>
                  📞 <a href="tel:+15039169758" style="color: #F0614F; text-decoration: none; font-weight: bold;">+1 (503) 916-9758</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
${isPrivateEvent ? '🎊 EVENT REQUEST APPROVED! 🎊' : '🎉 PARTY REQUEST APPROVED! 🎉'}

Hi ${parentFirstName},

Great news! We're excited to let you know that your ${eventLabel.toLowerCase()} request has been approved!

YOUR ${eventLabel.toUpperCase()} DETAILS:
${isPrivateEvent && partyRequest.event_type ? `\nEvent Type: ${partyRequest.event_type}` : ''}
Date: ${formattedDate}${isPrivateEvent && partyRequest.preferred_time ? `\nTime: ${partyRequest.preferred_time}` : ''}
${detailLabel}: ${displayName}
${isPrivateEvent ? 'Number of Guests' : 'Number of Children'}: ${guestLabel}

NEXT STEPS: SET UP YOUR GUEST LIST
Use your ${dashboardLabel} to add your guest list and track enrollment forms.
Each guest will receive an email with a form to complete.
${dashboardUrl ? `\nOpen Your ${dashboardLabel}: ${dashboardUrl}` : ''}

We can't wait to make this ${isPrivateEvent ? 'event' : 'celebration'} special!

👨‍🍳 The Cocinarte Team 👨‍🍳

Questions?
Email: cocinarte@casitaazulpdx.org
Phone: +1 (503) 916-9758
      `
    }

    // Email content for decline
    const declineEmailContent = {
      subject: isPrivateEvent
        ? 'Regarding Your Private Event Request at Cocinarte'
        : 'Regarding Your Birthday Party Request at Cocinarte',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #F9FAFB;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: #1E3A8A; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <img src="https://www.cocinartepdx.com/cocinarte/cocinarteLogo.png" alt="Cocinarte" style="height: 50px; margin: 0 auto 15px auto; display: block;" />
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Regarding Your ${eventLabel} Request</h1>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 30px 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${parentFirstName},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in hosting ${isPrivateEvent ? 'a private event' : 'a birthday party'} at Cocinarte. Unfortunately, we're unable to accommodate your request for the following date:
              </p>

              <!-- Request Details -->
              <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FCB414;">
                <h3 style="color: #92400E; margin: 0 0 12px 0; font-size: 16px;">📅 Requested Details</h3>
                <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #78350f;">Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #78350f;">${detailLabel}:</strong> ${displayName}</p>
              </div>

              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                This may be due to availability constraints or scheduling conflicts on the requested date.
              </p>

              <!-- Alternative Options -->
              <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #00ADEE;">
                <h3 style="color: #00ADEE; margin: 0 0 10px 0; font-size: 16px;">🍳 We'd Still Love to Have You!</h3>
                <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 15px;">
                  ${isPrivateEvent
                    ? "We'd love to help create a memorable cooking experience for your group! Please reach out to us to discuss alternative dates or options."
                    : "We'd love to help celebrate your child's special day! Please reach out to us to discuss alternative dates or party options that might work better."}
                </p>
                <div style="text-align: center;">
                  <a href="mailto:cocinarte@casitaazulpdx.org" style="background: #F0614F; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: bold; display: inline-block;">
                    Contact Us
                  </a>
                </div>
              </div>

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
      `,
      text: `
REGARDING YOUR ${eventLabel.toUpperCase()} REQUEST

Hi ${parentFirstName},

Thank you for your interest in hosting ${isPrivateEvent ? 'a private event' : 'a birthday party'} at Cocinarte. Unfortunately, we're unable to accommodate your request for the following date:

REQUESTED DETAILS:

Date: ${formattedDate}
${detailLabel}: ${displayName}

This may be due to availability constraints or scheduling conflicts on the requested date.

WE'D STILL LOVE TO HAVE YOU!
${isPrivateEvent
  ? "We'd love to help create a memorable cooking experience for your group! Please reach out to discuss alternative dates."
  : "We'd love to help celebrate your child's special day! Please reach out to us to discuss alternative dates or party options that might work better."}

The Cocinarte Team

Questions?
Email: cocinarte@casitaazulpdx.org
Phone: +1 (503) 916-9758
      `
    }

    const emailContent = isApproved ? approvalEmailContent : declineEmailContent

    // Send email to customer
    await sendEmail({
      to: partyRequest.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })
    console.log(`${eventLabel} request ${action} email sent successfully to ${partyRequest.email}`)

    return NextResponse.json(
      { message: `${eventLabel} request ${action} email sent successfully` },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error sending request action email:', error)
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    )
  }
}
