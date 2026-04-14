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

    const packageNames: { [key: string]: string } = {
      'art-canvas': 'Art: Canvas Painting',
      'diy-party': 'DIY Party',
      'mini-fiesta': 'Mini Fiesta',
      'deluxe-fiesta': 'Deluxe Fiesta',
      'premium-fiesta': 'Premium Fiesta',
      'vip-package': 'VIP Package'
    }

    const packageDisplayName = packageNames[partyRequest.package] || partyRequest.package

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

    // Email content for approval
    const approvalEmailContent = {
      subject: '🎉 Your Birthday Party Request Has Been Approved!',
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
              <h1 style="margin: 0; font-size: 30px; font-weight: bold;">🎉 Party Approved! 🎉</h1>
              <p style="margin: 12px 0 0 0; font-size: 16px; opacity: 0.95;">Your birthday party request has been confirmed</p>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 30px 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${parentFirstName},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! We're excited to let you know that your birthday party request has been approved!
              </p>

              <!-- Party Details -->
              <div style="background: #F0F9FF; padding: 22px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #00ADEE;">
                <h3 style="color: #00ADEE; margin: 0 0 15px 0; font-size: 18px;">🎂 Your Party Details</h3>
                <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Package:</strong> ${packageDisplayName}</p>
                <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Number of Children:</strong> ${partyRequest.number_of_children} kids</p>
              </div>

              <!-- Next Steps -->
              <div style="background: #FEF3C7; padding: 22px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FCB414;">
                <h3 style="color: #92400E; margin: 0 0 12px 0; font-size: 17px;">📋 Next Steps: Set Up Your Guest List</h3>
                <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 15px;">
                  Use your Party Dashboard to add your guest list and track enrollment forms. Each guest's parent will receive an email with a form to complete.
                </p>
                ${dashboardUrl ? `
                <div style="text-align: center;">
                  <a href="${dashboardUrl}" style="background: #F0614F; color: white; padding: 16px 36px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(240, 97, 79, 0.3);">
                    Open Your Party Dashboard
                  </a>
                </div>
                ` : ''}
              </div>

              <!-- Excitement message -->
              <div style="background: #FCB414; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="color: white; margin: 0 0 10px 0; font-size: 16px;">🎉 We Can't Wait!</h4>
                <p style="color: white; margin: 0; font-size: 15px; line-height: 1.6;">
                  We're going to make this birthday celebration extra special. Get ready for a cooking adventure your child and their friends will love!
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
🎉 PARTY REQUEST APPROVED! 🎉

Hi ${parentFirstName},

Great news! We're excited to let you know that your birthday party request has been approved!

YOUR PARTY DETAILS:

Date: ${formattedDate}
Package: ${packageDisplayName}
Number of Children: ${partyRequest.number_of_children} kids

NEXT STEPS: SET UP YOUR GUEST LIST
Use your Party Dashboard to add your guest list and track enrollment forms.
Each guest's parent will receive an email with a form to complete.
${dashboardUrl ? `\nOpen Your Party Dashboard: ${dashboardUrl}` : ''}

We can't wait to help make this birthday celebration extra special for your child!

👨‍🍳 The Cocinarte Team 👨‍🍳

Questions?
Email: cocinarte@casitaazulpdx.org
Phone: +1 (503) 916-9758
      `
    }

    // Email content for decline
    const declineEmailContent = {
      subject: 'Regarding Your Birthday Party Request at Cocinarte',
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
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Regarding Your Party Request</h1>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 30px 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${parentFirstName},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in hosting a birthday party at Cocinarte. Unfortunately, we're unable to accommodate your request for the following date:
              </p>

              <!-- Request Details -->
              <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FCB414;">
                <h3 style="color: #92400E; margin: 0 0 12px 0; font-size: 16px;">📅 Requested Details</h3>
                <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #78350f;">Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #78350f;">Package:</strong> ${packageDisplayName}</p>
              </div>

              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                This may be due to availability constraints or scheduling conflicts on the requested date.
              </p>

              <!-- Alternative Options -->
              <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #00ADEE;">
                <h3 style="color: #00ADEE; margin: 0 0 10px 0; font-size: 16px;">🍳 We'd Still Love to Have You!</h3>
                <p style="color: #374151; line-height: 1.6; margin: 0 0 15px 0; font-size: 15px;">
                  We'd love to help celebrate your child's special day! Please reach out to us to discuss alternative dates or party options that might work better.
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
REGARDING YOUR BIRTHDAY PARTY REQUEST

Hi ${parentFirstName},

Thank you for your interest in hosting a birthday party at Cocinarte. Unfortunately, we're unable to accommodate your request for the following date:

REQUESTED DETAILS:

Date: ${formattedDate}
Package: ${packageDisplayName}

This may be due to availability constraints or scheduling conflicts on the requested date.

WE'D STILL LOVE TO HAVE YOU!
We'd love to help celebrate your child's special day! Please reach out to us to discuss alternative dates or party options that might work better.

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
    console.log(`Party request ${action} email sent successfully to ${partyRequest.email}`)

    return NextResponse.json(
      { message: `Party request ${action} email sent successfully` },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error sending party request action email:', error)
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    )
  }
}
