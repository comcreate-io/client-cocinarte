import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

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

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    const packageNames: { [key: string]: string } = {
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
      day: 'numeric'
    })

    const isApproved = action === 'approve'
    const parentFirstName = partyRequest.parent_name.split(' ')[0]

    // Email content for approval
    const approvalEmailContent = {
      subject: '<‰ Your Birthday Party Request Has Been Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #22c55e; text-align: center; margin-top: 0;">
              <‚ Party Request Approved! <‰
            </h2>

            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              Hi ${parentFirstName},
            </p>

            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              Great news! We're excited to let you know that your birthday party request has been approved!
            </p>

            <div style="background: linear-gradient(to right, #dcfce7, #bbf7d0); padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #15803d; margin-top: 0; margin-bottom: 15px;">Your Party Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #15803d; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #15803d; font-weight: bold;">Package:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${packageDisplayName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #15803d; font-weight: bold;">Number of Children:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${partyRequest.number_of_children} kids</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 10px;">Next Steps</h3>
              <ul style="color: #1e293b; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>We'll contact you within 24 hours to finalize details</li>
                <li>Discuss any special requests or dietary restrictions</li>
                <li>Go over payment and deposit information</li>
                <li>Answer any questions you may have</li>
              </ul>
            </div>

            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              We can't wait to help make this birthday celebration extra special for your child!
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Have questions? Reach out to us!
              </p>
              <p style="color: #f97316; font-size: 18px; font-weight: bold; margin: 10px 0;">
                <‰ The Cocinarte Team <‰
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Email: <a href="mailto:info@cocinartepdx.com" style="color: #f97316; text-decoration: none;">info@cocinartepdx.com</a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Phone: <a href="tel:+15039169758" style="color: #f97316; text-decoration: none;">+1 (503) 916-9758</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
<‰ PARTY REQUEST APPROVED! <‰

Hi ${parentFirstName},

Great news! We're excited to let you know that your birthday party request has been approved!

YOUR PARTY DETAILS:

Date: ${formattedDate}
Package: ${packageDisplayName}
Number of Children: ${partyRequest.number_of_children} kids

NEXT STEPS:
" We'll contact you within 24 hours to finalize details
" Discuss any special requests or dietary restrictions
" Go over payment and deposit information
" Answer any questions you may have

We can't wait to help make this birthday celebration extra special for your child!

<‰ The Cocinarte Team <‰

Questions?
Email: info@cocinartepdx.com
Phone: +1 (503) 916-9758
      `
    }

    // Email content for decline
    const declineEmailContent = {
      subject: 'Regarding Your Birthday Party Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #64748b; text-align: center; margin-top: 0;">
              Regarding Your Birthday Party Request
            </h2>

            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              Hi ${parentFirstName},
            </p>

            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              Thank you for your interest in hosting a birthday party at Cocinarte. Unfortunately, we're unable to accommodate your request for the following date:
            </p>

            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold;">Requested Date:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold;">Package:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${packageDisplayName}</td>
                </tr>
              </table>
            </div>

            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              This may be due to availability constraints or scheduling conflicts on the requested date.
            </p>

            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 10px;">Alternative Options</h3>
              <p style="color: #1e293b; line-height: 1.6; margin: 0;">
                We'd still love to help celebrate your child's special day! Please reach out to us to discuss alternative dates or party options that might work better.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Questions or want to explore other options?
              </p>
              <p style="color: #f97316; font-size: 18px; font-weight: bold; margin: 10px 0;">
                The Cocinarte Team
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Email: <a href="mailto:info@cocinartepdx.com" style="color: #f97316; text-decoration: none;">info@cocinartepdx.com</a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Phone: <a href="tel:+15039169758" style="color: #f97316; text-decoration: none;">+1 (503) 916-9758</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
REGARDING YOUR BIRTHDAY PARTY REQUEST

Hi ${parentFirstName},

Thank you for your interest in hosting a birthday party at Cocinarte. Unfortunately, we're unable to accommodate your request for the following date:

REQUESTED DETAILS:

Date: ${formattedDate}
Package: ${packageDisplayName}

This may be due to availability constraints or scheduling conflicts on the requested date.

ALTERNATIVE OPTIONS:
We'd still love to help celebrate your child's special day! Please reach out to us to discuss alternative dates or party options that might work better.

The Cocinarte Team

Questions?
Email: info@cocinartepdx.com
Phone: +1 (503) 916-9758
      `
    }

    const emailContent = isApproved ? approvalEmailContent : declineEmailContent

    // Send email to customer
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: partyRequest.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    }

    await transporter.sendMail(mailOptions)
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
