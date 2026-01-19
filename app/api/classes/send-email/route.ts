import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/admin'
import nodemailer from 'nodemailer'

// Cocinarte color palette
const COLORS = {
  navy: '#00ADEE',
  red: '#F0614F',
  orange: '#F48E77',
  yellow: '#FCB414',
  lightBlue: '#CDECF9'
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function generateEmailHtml(classTitle: string, classDate: string, classTime: string, subject: string, message: string, childName: string): string {
  // Format the message with line breaks
  const formattedMessage = message.replace(/\n/g, '<br>')

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
                <td style="background: linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.lightBlue} 100%); padding: 40px 40px 30px 40px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                    🍳 Cocinarte
                  </h1>
                  <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                    Cooking Classes for Kids
                  </p>
                </td>
              </tr>

              <!-- Class Info Banner -->
              <tr>
                <td style="background-color: ${COLORS.lightBlue}; padding: 20px 40px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: ${COLORS.navy}; font-weight: 600;">
                          📅 Class: ${classTitle}
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">
                          ${classDate} at ${classTime}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: ${COLORS.navy}; margin: 0 0 20px 0; font-size: 24px;">
                    ${subject}
                  </h2>

                  <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                    Dear Parent/Guardian of <strong>${childName}</strong>,
                  </p>

                  <div style="color: #333; font-size: 16px; line-height: 1.8; margin: 20px 0; padding: 20px; background-color: #fafafa; border-radius: 8px; border-left: 4px solid ${COLORS.navy};">
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
                    <a href="mailto:info@cocinartepdx.com" style="color: ${COLORS.navy}; text-decoration: none; font-weight: 600;">
                      info@cocinartepdx.com
                    </a>
                  </p>
                  <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                    © ${new Date().getFullYear()} Cocinarte PDX. All rights reserved.
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

    // Verify the user is authenticated and is an admin
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const isAdmin = await isAdminUser(supabase, user.email)

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { classId, subject, message } = await request.json()

    if (!classId || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: classId, subject, message' },
        { status: 400 }
      )
    }

    // Fetch class details
    const { data: classData, error: classError } = await supabase
      .from('clases')
      .select('id, title, date, time')
      .eq('id', classId)
      .single()

    if (classError || !classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    // Format date and time for the email
    const [year, month, day] = classData.date.split('-').map(Number)
    const classDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const [hours, minutes] = classData.time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    const classTime = `${displayHour}:${minutes} ${ampm}`

    // Fetch all enrolled students (confirmed or pending bookings)
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_status,
        student_id,
        students (
          id,
          parent_name,
          child_name,
          email
        )
      `)
      .eq('class_id', classId)
      .in('booking_status', ['confirmed', 'pending'])

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json({ error: 'Failed to fetch enrolled students' }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'No enrolled students found for this class' }, { status: 404 })
    }

    // Send emails to all enrolled students
    const emailPromises = bookings.map(async (booking: any) => {
      // Handle both single object and array cases for the join
      const student = Array.isArray(booking.students) ? booking.students[0] : booking.students

      if (!student?.email) {
        return { success: false, bookingId: booking.id, error: 'No email found' }
      }

      try {
        const html = generateEmailHtml(
          classData.title,
          classDate,
          classTime,
          subject,
          message,
          student.child_name || 'Student'
        )

        await transporter.sendMail({
          from: `"Cocinarte PDX" <${process.env.SMTP_FROM || 'info@cocinartepdx.com'}>`,
          to: student.email,
          subject: `[Cocinarte] ${subject}`,
          html: html,
        })

        return { success: true, email: student.email }
      } catch (error) {
        console.error(`Failed to send email to ${student.email}:`, error)
        return { success: false, email: student.email, error: String(error) }
      }
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Emails sent successfully`,
      stats: {
        total: bookings.length,
        sent: successCount,
        failed: failedCount
      },
      details: results
    })

  } catch (error) {
    console.error('Error sending class emails:', error)
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}
