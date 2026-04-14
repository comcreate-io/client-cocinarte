import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      purchaser_name,
      purchaser_email,
      guest_parent_name,
      guest_parent_email,
      guest_child_name,
      class_title,
      class_date,
      class_time,
      class_price,
      form_token,
      booking_id,
    } = body

    if (!purchaser_email || !guest_parent_email || !form_token || !class_title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const formattedDate = new Date(class_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const formattedTime = new Date(`2000-01-01T${class_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.cocinartepdx.com'
    const formUrl = `${baseUrl}/guest-form/${form_token}`

    // 1. Purchaser confirmation email
    const purchaserEmailContent = `
      <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
        <div style="background: #1E3A8A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎁 Gift Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">You've gifted a cooking class experience</p>
        </div>

        <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${purchaser_name},
          </p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Thank you for gifting a Cocinarte cooking class! Here are the details:
          </p>

          <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E3A8A;">
            <h3 style="color: #1E3A8A; margin: 0 0 15px 0;">🍳 Class Details</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Class:</strong> ${class_title}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${formattedTime}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Amount:</strong> $${class_price}</p>
          </div>

          <div style="background: #FFF7ED; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F0614F;">
            <h3 style="color: #9A3412; margin: 0 0 10px 0;">👤 Guest Information</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Child's Name:</strong> ${guest_child_name}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Parent:</strong> ${guest_parent_name}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> ${guest_parent_email}</p>
          </div>

          <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16A34A;">
            <p style="color: #166534; margin: 0 0 10px 0; font-size: 14px;">
              ✅ An enrollment form has been sent to <strong>${guest_parent_name}</strong> at <strong>${guest_parent_email}</strong>.
              They will need to complete the child's information and sign the consent forms before the class.
            </p>
            <p style="color: #166534; margin: 0; font-size: 13px;">
              You can also share this enrollment link directly:
            </p>
            <p style="margin: 8px 0 0 0;">
              <a href="${formUrl}" style="color: #1E3A8A; word-break: break-all; font-size: 13px;">${formUrl}</a>
            </p>
          </div>

          <p style="color: #6B7280; font-size: 13px; text-align: center; margin-top: 30px;">
            If you have any questions, please contact us at cocinarte@casitaazulpdx.org
          </p>
        </div>
      </div>
    `

    // 2. Guest parent email with form link
    const guestParentEmailContent = `
      <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
        <div style="background: #1E3A8A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 A Cooking Class Gift for ${guest_child_name}!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">From ${purchaser_name}</p>
        </div>

        <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${guest_parent_name},
          </p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Great news! <strong>${purchaser_name}</strong> has gifted a Cocinarte cooking class for <strong>${guest_child_name}</strong>.
            Here are the class details:
          </p>

          <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E3A8A;">
            <h3 style="color: #1E3A8A; margin: 0 0 15px 0;">🍳 Class Details</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Class:</strong> ${class_title}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${formattedTime}</p>
          </div>

          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <h3 style="color: #92400E; margin: 0 0 10px 0;">📋 Action Required</h3>
            <p style="color: #374151; margin: 0 0 15px 0; font-size: 14px;">
              To complete the enrollment, please fill out the form with your child's information and sign the required consent forms.
            </p>
            <div style="text-align: center;">
              <a href="${formUrl}" style="display: inline-block; background: #F0614F; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Complete Enrollment Form
              </a>
            </div>
          </div>

          <p style="color: #6B7280; font-size: 13px; margin-top: 20px;">
            If the button doesn't work, copy and paste this link: <br/>
            <a href="${formUrl}" style="color: #1E3A8A; word-break: break-all;">${formUrl}</a>
          </p>

          <p style="color: #6B7280; font-size: 13px; text-align: center; margin-top: 30px;">
            If you have any questions, please contact us at cocinarte@casitaazulpdx.org
          </p>
        </div>
      </div>
    `

    // 3. Admin notification email
    const adminEmailContent = `
      <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
        <div style="background: #1E3A8A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎁 New Guest Booking</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">A gift booking has been made</p>
        </div>

        <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1E3A8A;">
            <h3 style="color: #1E3A8A; margin: 0 0 15px 0;">🍳 Class Information</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Class:</strong> ${class_title}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${formattedTime}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Amount:</strong> $${class_price}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Booking ID:</strong> ${booking_id}</p>
          </div>

          <div style="background: #EDE9FE; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #7C3AED;">
            <h3 style="color: #5B21B6; margin: 0 0 15px 0;">💳 Purchaser</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Name:</strong> ${purchaser_name}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> ${purchaser_email}</p>
          </div>

          <div style="background: #FFF7ED; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #F0614F;">
            <h3 style="color: #9A3412; margin: 0 0 15px 0;">👤 Guest Information</h3>
            <p style="margin: 8px 0; color: #374151;"><strong>Child's Name:</strong> ${guest_child_name}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Parent Name:</strong> ${guest_parent_name}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Parent Email:</strong> ${guest_parent_email}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Form Status:</strong> Pending</p>
          </div>
        </div>
      </div>
    `

    // Send all three emails
    const emailPromises = [
      sendEmail({
        to: purchaser_email,
        subject: `🎁 Gift Booking Confirmed - ${class_title}`,
        html: purchaserEmailContent,
      }),
      sendEmail({
        to: guest_parent_email,
        subject: `🎉 A Cooking Class Gift for ${guest_child_name} - Complete Enrollment`,
        html: guestParentEmailContent,
      }),
      sendEmail({
        to: process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || 'cocinarte@casitaazulpdx.org',
        subject: `🎁 New Guest Booking - ${class_title} (${guest_child_name})`,
        html: adminEmailContent,
      }),
    ]

    await Promise.all(emailPromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Guest booking email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}
