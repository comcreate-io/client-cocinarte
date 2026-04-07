import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/resend'

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
      selectedMenu,
      dietaryRestrictions,
      eventDetails
    } = body

    // Menu options mapping
    const menuNames: Record<string, string> = {
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
      'custom': 'Custom Menu (to be discussed)'
    }

    const selectedMenuName = selectedMenu ? menuNames[selectedMenu] || selectedMenu : 'Not selected'

    // Validate required fields
    if (!eventType || !numberOfGuests || !preferredDate || !preferredTime || !contactName || !phone || !email || !selectedMenu) {
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
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Selected Menu:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${selectedMenuName}</td>
                </tr>
                ${dietaryRestrictions ? `
                <tr>
                  <td style="padding: 8px 0; color: #1e40af; font-weight: bold;">Dietary Restrictions:</td>
                  <td style="padding: 8px 0; color: #dc2626;">${dietaryRestrictions}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0; margin-bottom: 10px;">💰 Pricing Info</h3>
              <p style="color: #78350f; font-size: 16px; margin: 0;">
                Standard Rate: <strong>$350</strong> (up to 5 people, no decorations included)
              </p>
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
🎊 NEW PRIVATE CLASS REQUEST 🎊

EVENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Event Type: ${eventType}
Number of Guests: ${numberOfGuests} people
Preferred Date: ${formattedDate}
Preferred Time: ${preferredTime}
Selected Menu: ${selectedMenuName}
${dietaryRestrictions ? `Dietary Restrictions: ${dietaryRestrictions}` : ''}

PRICING INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Standard Rate: $350 (up to 5 people, no decorations included)

CONTACT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contact Name: ${contactName}
Email: ${email}
Phone: ${phone}

${eventDetails ? `ADDITIONAL DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${eventDetails}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ ACTION REQUIRED: Please contact the customer within 24 hours to confirm availability.
📧 Reply to: ${email}
📱 Call: ${phone}

This request was submitted from the Private Classes section on your website.
      `
    }

    // Send email to admin
    await sendEmail(mailOptions)
    console.log('Private event request email sent successfully')

    // Send confirmation email to customer
    const customerMailOptions = {
      to: email,
      subject: '🎊 We Received Your Private Class Request!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #CDECF9; padding: 20px;">
          <div style="background-color: #FEFEFE; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #00ADEE; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h2 style="color: #FEFEFE; text-align: center; margin: 0;">
                🎊 Thank You for Your Private Class Request!
              </h2>
            </div>

            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              Hi ${contactName.split(' ')[0]},
            </p>

            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              We're excited to help create a memorable cooking experience for your group! We've received your request for:
            </p>

            <div style="background: linear-gradient(135deg, #F0614F 0%, #F48E77 100%); padding: 20px; border-radius: 12px; margin: 25px 0; color: #FEFEFE;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Event Type:</td>
                  <td style="padding: 8px 0;">${eventType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Number of Guests:</td>
                  <td style="padding: 8px 0;">${numberOfGuests} people</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Time:</td>
                  <td style="padding: 8px 0;">${preferredTime}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Selected Dish:</td>
                  <td style="padding: 8px 0;">${selectedMenuName}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #FCB414; color: #000000; padding: 15px 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">Package Price: $350</p>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Up to 5 people • 2-hour class • All ingredients included</p>
            </div>

            <div style="background-color: #CDECF9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #00ADEE; margin-top: 0; margin-bottom: 10px;">What Happens Next?</h3>
              <ul style="color: #1e293b; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li>Our team will review your request</li>
                <li>We'll contact you within 24 hours to confirm availability</li>
                <li>Once confirmed, we'll send you detailed class information</li>
                <li>All participants will need to sign a waiver before the class</li>
              </ul>
            </div>

            <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FCB414;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Note:</strong> Decorations are not included in the package. You're welcome to bring simple decorations (command hooks only, no tape or nails).
              </p>
            </div>

            <p style="color: #1e293b; font-size: 16px; line-height: 1.6;">
              We can't wait to cook with you!
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #00ADEE; font-size: 18px; font-weight: bold; margin: 10px 0;">
                🎊 The Cocinarte Team 🎊
              </p>
            </div>

            <div style="background-color: #00ADEE; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="color: #FEFEFE; font-size: 14px; margin: 5px 0;">
                Questions? Email us at <a href="mailto:cocinarte@casitaazulpdx.org" style="color: #FCB414; text-decoration: none;">cocinarte@casitaazulpdx.org</a>
              </p>
              <p style="color: #FEFEFE; font-size: 14px; margin: 5px 0;">
                Or call us at <a href="tel:+15039169758" style="color: #FCB414; text-decoration: none;">+1 (503) 916-9758</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
🎊 THANK YOU FOR YOUR PRIVATE CLASS REQUEST! 🎊

Hi ${contactName.split(' ')[0]},

We're excited to help create a memorable cooking experience for your group! We've received your request for:

Event Type: ${eventType}
Number of Guests: ${numberOfGuests} people
Date: ${formattedDate}
Time: ${preferredTime}
Selected Dish: ${selectedMenuName}

PACKAGE PRICE: $350
• Up to 5 people
• 2-hour class
• All ingredients included
• Decorations NOT included

WHAT HAPPENS NEXT?
• Our team will review your request
• We'll contact you within 24 hours to confirm availability
• Once confirmed, we'll send you detailed class information
• All participants will need to sign a waiver before the class

We can't wait to cook with you!

🎊 The Cocinarte Team 🎊

Questions?
Email: cocinarte@casitaazulpdx.org
Phone: +1 (503) 916-9758
      `
    }

    await sendEmail(customerMailOptions)
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

