import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      preferredDate,
      numberOfChildren,
      package: partyPackage,
      parentName,
      phone,
      email,
      childNameAge,
      specialRequests
    } = body

    // Validate required fields
    if (!preferredDate || !numberOfChildren || !partyPackage || !parentName || !phone || !email) {
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

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: dbError } = await supabase
      .from('party_requests')
      .insert({
        preferred_date: preferredDate,
        number_of_children: numberOfChildren,
        package: partyPackage,
        parent_name: parentName,
        phone,
        email,
        child_name_age: childNameAge,
        special_requests: specialRequests,
        status: 'pending'
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue with email even if database fails
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

    // Map package value to display name
    const packageNames: { [key: string]: string } = {
      'mini-party': 'Mini Fiesta ($350 • 8 kids • 2 hours)',
      'deluxe-party': 'Deluxe Fiesta ($500 • 12 kids • 2.5 hours)',
      'premium-party': 'Premium Fiesta ($750 • 16 kids • 3 hours)'
    }

    const packageDisplayName = packageNames[partyPackage] || partyPackage

    // Format the date for better readability
    const formattedDate = new Date(preferredDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Email content
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
      subject: `🎉 New Birthday Party Request - ${formattedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #f97316; border-bottom: 3px solid #fbbf24; padding-bottom: 15px; margin-top: 0;">
              🎂 New Birthday Party Request
            </h2>
            
            <div style="background: linear-gradient(to right, #fef3c7, #fed7aa); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0; margin-bottom: 15px;">Party Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold; width: 40%;">Preferred Date:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold;">Package:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${packageDisplayName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold;">Number of Children:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${numberOfChildren} kids</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 15px;">Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold; width: 40%;">Parent/Guardian:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${parentName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #3b82f6; text-decoration: none;">${phone}</a></td>
                </tr>
                ${childNameAge ? `
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Birthday Child:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${childNameAge}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${specialRequests ? `
            <div style="background-color: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
              <h3 style="color: #6b21a8; margin-top: 0; margin-bottom: 10px;">Special Requests & Dietary Restrictions</h3>
              <p style="color: #1e293b; line-height: 1.6; white-space: pre-wrap; margin: 0;">${specialRequests}</p>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                <strong>⏰ Action Required:</strong> Please contact the customer within 24 hours to confirm availability.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                <strong>📧 Quick Reply:</strong> <a href="mailto:${email}" style="color: #f97316; text-decoration: none;">${email}</a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                <strong>📱 Quick Call:</strong> <a href="tel:${phone}" style="color: #f97316; text-decoration: none;">${phone}</a>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This request was submitted from the Birthday Party section on your website.</p>
          </div>
        </div>
      `,
      text: `
🎉 NEW BIRTHDAY PARTY REQUEST 🎉

PARTY DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Preferred Date: ${formattedDate}
Package: ${packageDisplayName}
Number of Children: ${numberOfChildren} kids

CONTACT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Parent/Guardian: ${parentName}
Email: ${email}
Phone: ${phone}
${childNameAge ? `Birthday Child: ${childNameAge}` : ''}

${specialRequests ? `SPECIAL REQUESTS & DIETARY RESTRICTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${specialRequests}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ ACTION REQUIRED: Please contact the customer within 24 hours to confirm availability.
📧 Reply to: ${email}
📱 Call: ${phone}

This request was submitted from the Birthday Party section on your website.
      `
    }

    // Send email to admin
    await transporter.sendMail(mailOptions)
    console.log('Birthday party request email sent successfully')

    // Send confirmation email to customer
    const customerMailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: '🎉 We Received Your Birthday Party Request!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #f97316; text-align: center; margin-top: 0;">
              🎂 Thank You for Your Birthday Party Request!
            </h2>
            
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              Hi ${parentName.split(' ')[0]},
            </p>
            
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              We're excited to help make your child's birthday celebration extra special! We've received your party request for:
            </p>
            
            <div style="background: linear-gradient(to right, #fef3c7, #fed7aa); padding: 20px; border-radius: 8px; margin: 25px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold;">Package:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${packageDisplayName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #78350f; font-weight: bold;">Number of Children:</td>
                  <td style="padding: 8px 0; color: #1e293b;">${numberOfChildren} kids</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #22c55e;">
              <h3 style="color: #15803d; margin-top: 0; margin-bottom: 10px;">What Happens Next?</h3>
              <ul style="color: #1e293b; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Our team will review your request and check availability</li>
                <li>We'll contact you within 24 hours to confirm the details</li>
                <li>Once confirmed, we'll send you a full party planning guide</li>
              </ul>
            </div>
            
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              If you have any questions in the meantime, feel free to reach out to us!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Looking forward to celebrating with you!
              </p>
              <p style="color: #f97316; font-size: 18px; font-weight: bold; margin: 10px 0;">
                🎉 The Cocinarte Team 🎉
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Questions? Email us at <a href="mailto:info@cocinartepdx.com" style="color: #f97316; text-decoration: none;">info@cocinartepdx.com</a>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Or call us at <a href="tel:+15039169758" style="color: #f97316; text-decoration: none;">+1 (503) 916-9758</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
🎉 THANK YOU FOR YOUR BIRTHDAY PARTY REQUEST! 🎉

Hi ${parentName.split(' ')[0]},

We're excited to help make your child's birthday celebration extra special! We've received your party request for:

Date: ${formattedDate}
Package: ${packageDisplayName}
Number of Children: ${numberOfChildren} kids

WHAT HAPPENS NEXT?
• Our team will review your request and check availability
• We'll contact you within 24 hours to confirm the details
• Once confirmed, we'll send you a full party planning guide

If you have any questions in the meantime, feel free to reach out to us!

Looking forward to celebrating with you!

🎉 The Cocinarte Team 🎉

Questions? 
Email: info@cocinartepdx.com
Phone: +1 (503) 916-9758
      `
    }

    await transporter.sendMail(customerMailOptions)
    console.log('Customer confirmation email sent successfully')

    return NextResponse.json(
      { message: 'Birthday party request sent successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error sending birthday party request email:', error)
    return NextResponse.json(
      { error: 'Failed to send birthday party request' },
      { status: 500 }
    )
  }
}

