import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      eventType,
      numberOfGuests,
      preferredDate,
      preferredTime,
      contactName,
      phone,
      email,
      eventDetails
    } = body

    // Validate required fields
    if (!eventType || !numberOfGuests || !preferredDate || !preferredTime || !contactName || !phone || !email) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Format the date for better readability
    const formattedDate = new Date(preferredDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Email content for admin
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim())
      .filter(Boolean)
    
    if (adminEmails.length === 0) {
      console.error('No admin emails configured')
      return NextResponse.json(
        { error: 'Email configuration error' },
        { status: 500 }
      )
    }
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: adminEmails,
      replyTo: email,
      subject: `🎊 New Private Event Request - ${eventType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #3b82f6; border-bottom: 3px solid #fbbf24; padding-bottom: 15px; margin-top: 0;">
              🎊 New Private Event Request
            </h2>
            
            <div style="background: linear-gradient(to right, #dbeafe, #e0e7ff); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e3a8a; margin-top: 0; margin-bottom: 15px;">Event Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold; width: 40%;">Event Type:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${eventType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Number of Guests:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${numberOfGuests} people</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Preferred Date:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Preferred Time:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${preferredTime}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0; margin-bottom: 15px;">Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold; width: 40%;">Contact Name:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${contactName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #f97316; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #f97316; text-decoration: none;">${phone}</a></td>
                </tr>
              </table>
            </div>
            
            ${eventDetails ? `
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #15803d; margin-top: 0; margin-bottom: 10px;">Event Details & Special Requirements</h3>
              <p style="color: #1e293b; line-height: 1.6; white-space: pre-wrap; margin: 0;">${eventDetails}</p>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                <strong>⏰ Action Required:</strong> Please contact the customer within 24 hours with custom pricing and availability.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                <strong>📧 Quick Reply:</strong> <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                <strong>📱 Quick Call:</strong> <a href="tel:${phone}" style="color: #3b82f6; text-decoration: none;">${phone}</a>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This request was submitted from the Private Events section on your website.</p>
          </div>
        </div>
      `,
      text: `
🎊 NEW PRIVATE EVENT REQUEST 🎊

EVENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Event Type: ${eventType}
Number of Guests: ${numberOfGuests} people
Preferred Date: ${formattedDate}
Preferred Time: ${preferredTime}

CONTACT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contact Name: ${contactName}
Email: ${email}
Phone: ${phone}

${eventDetails ? `EVENT DETAILS & SPECIAL REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${eventDetails}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ ACTION REQUIRED: Please contact the customer within 24 hours with custom pricing and availability.
📧 Reply to: ${email}
📱 Call: ${phone}

This request was submitted from the Private Events section on your website.
      `
    }

    // Send email to admin
    await transporter.sendMail(mailOptions)
    console.log('Private event request email sent successfully')

    // Send confirmation email to customer
    const customerMailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: '🎊 We Received Your Private Event Request!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #3b82f6; text-align: center; margin-top: 0;">
              🎊 Thank You for Your Event Request!
            </h2>
            
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              Hi ${contactName.split(' ')[0]},
            </p>
            
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              We're excited to help create a memorable cooking experience for your event! We've received your request for:
            </p>
            
            <div style="background: linear-gradient(to right, #dbeafe, #e0e7ff); padding: 20px; border-radius: 8px; margin: 25px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Event Type:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${eventType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Number of Guests:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${numberOfGuests} people</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Time:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${preferredTime}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #15803d; margin-top: 0; margin-bottom: 10px;">What Happens Next?</h3>
              <ul style="color: #1e293b; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Our event coordinator will review your request</li>
                <li>We'll contact you within 24 hours with custom pricing and menu options</li>
                <li>We'll work with you to customize the perfect cooking experience for your group</li>
                <li>Once confirmed, we'll send you detailed event information and planning materials</li>
              </ul>
            </div>
            
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              We can't wait to create an unforgettable culinary experience for your event!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Looking forward to cooking with you!
              </p>
              <p style="color: #3b82f6; font-size: 18px; font-weight: bold; margin: 10px 0;">
                🎊 The Cocinarte Team 🎊
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Questions? Email us at <a href="mailto:info@cocinartepdx.com" style="color: #3b82f6; text-decoration: none;">info@cocinartepdx.com</a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Or call us at <a href="tel:+15039169758" style="color: #3b82f6; text-decoration: none;">+1 (503) 916-9758</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
🎊 THANK YOU FOR YOUR PRIVATE EVENT REQUEST! 🎊

Hi ${contactName.split(' ')[0]},

We're excited to help create a memorable cooking experience for your event! We've received your request for:

Event Type: ${eventType}
Number of Guests: ${numberOfGuests} people
Date: ${formattedDate}
Time: ${preferredTime}

WHAT HAPPENS NEXT?
• Our event coordinator will review your request
• We'll contact you within 24 hours with custom pricing and menu options
• We'll work with you to customize the perfect cooking experience for your group
• Once confirmed, we'll send you detailed event information and planning materials

We can't wait to create an unforgettable culinary experience for your event!

Looking forward to cooking with you!

🎊 The Cocinarte Team 🎊

Questions? 
Email: info@cocinartepdx.com
Phone: +1 (503) 916-9758
      `
    }

    await transporter.sendMail(customerMailOptions)
    console.log('Customer confirmation email sent successfully')

    return NextResponse.json(
      { message: 'Private event request sent successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error sending private event request email:', error)
    return NextResponse.json(
      { error: 'Failed to send private event request' },
      { status: 500 }
    )
  }
}

