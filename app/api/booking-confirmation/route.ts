import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userEmail,
      userName,
      studentName,
      classTitle,
      classDate,
      classTime,
      classPrice,
      basePrice,
      extraChildren,
      extraChildrenCost,
      selectedChildrenNames,
      guestChildren,
      bookingId
    } = body;

    // Validate required fields
    if (!userEmail || !userName || !studentName || !classTitle || !classDate || !classTime || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate display values
    const hasExtraChildren = extraChildren && extraChildren > 0;
    const totalChildren = hasExtraChildren ? extraChildren + 1 : 1;
    const childrenNamesList: string[] = selectedChildrenNames && selectedChildrenNames.length > 0
      ? selectedChildrenNames
      : [studentName];
    const guestList: Array<{ childName: string; parentName: string; parentEmail: string }> = guestChildren || [];
    const hasGuests = guestList.length > 0;

    // Format date and time
    const formattedDate = new Date(classDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formattedTime = new Date(`2000-01-01T${classTime}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Admin notification email
    const adminEmailContent = `
      <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
        <div style="background: #1E3A8A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎉 New Booking Received!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">A new cooking class has been booked</p>
        </div>

        <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1E3A8A; margin: 0 0 20px 0; font-size: 24px; border-bottom: 2px solid #F0614F; padding-bottom: 10px;">Booking Details</h2>

          <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1E3A8A;">
            <h3 style="color: #1E3A8A; margin: 0 0 15px 0; font-size: 20px;">🍳 Class Information</h3>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Class:</strong> ${classTitle}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Time:</strong> ${formattedTime}</p>
            ${hasExtraChildren ? `
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Children Attending (${totalChildren}):</strong></p>
            <ul style="margin: 4px 0 8px 20px; color: #374151; font-size: 14px;">
              ${childrenNamesList.map((name: string, i: number) => `<li>${name}${i === 0 ? ' (included)' : ' (+$70)'}</li>`).join('')}
            </ul>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Base Price:</strong> $${basePrice || classPrice}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Extra Children Cost:</strong> +$${extraChildrenCost}</p>
            ` : ''}
            ${hasGuests ? `
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Guest Children (${guestList.length}):</strong></p>
            <ul style="margin: 4px 0 8px 20px; color: #374151; font-size: 14px;">
              ${guestList.map((g: any) => `<li>${g.childName} (parent: ${g.parentName}, ${g.parentEmail})</li>`).join('')}
            </ul>
            ` : ''}
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Total Price:</strong> $${classPrice}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Booking ID:</strong> ${bookingId}</p>
          </div>

          <div style="background: #FEF3F2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #F0614F;">
            <h3 style="color: #F0614F; margin: 0 0 15px 0; font-size: 20px;">👨‍👩‍👧 Customer Information</h3>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #F0614F;">Parent/Guardian:</strong> ${userName}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #F0614F;">Email:</strong> <a href="mailto:${userEmail}" style="color: #F0614F; text-decoration: none;">${userEmail}</a></p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #F0614F;">Student Name:</strong> ${hasExtraChildren ? childrenNamesList.join(', ') : studentName}</p>
          </div>

          <div style="background: #FCB414; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: white; margin: 0 0 10px 0; font-size: 18px;">📝 Action Required</h4>
            <p style="color: white; margin: 0; font-size: 15px;">Please prepare materials and confirm class setup for this booking.</p>
          </div>
        </div>
      </div>
    `;

    const adminMailOptions = {
      to: 'diego@comcreate.org',
      subject: `New Booking: ${classTitle} - ${formattedDate}`,
      html: adminEmailContent,
    };

    // User confirmation email
    const userEmailContent = `
      <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
        <div style="background: #F0614F; color: white; padding: 35px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 36px; font-weight: bold;">¡Booking Confirmed!</h1>
          <p style="margin: 12px 0 0 0; font-size: 18px;">Your cooking class reservation is confirmed 🎉</p>
        </div>

        <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #F0614F; margin: 0 0 25px 0; font-size: 26px; border-bottom: 2px solid #FCB414; padding-bottom: 10px;">Your Booking Details</h2>

          <div style="background: #F0F9FF; padding: 22px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1E3A8A;">
            <h3 style="color: #1E3A8A; margin: 0 0 15px 0; font-size: 20px;">🍳 Class Information</h3>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Class:</strong> ${classTitle}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Time:</strong> ${formattedTime}</p>
            ${hasExtraChildren ? `
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Children Attending (${totalChildren}):</strong></p>
            <ul style="margin: 4px 0 8px 20px; color: #374151; font-size: 15px;">
              ${childrenNamesList.map((name: string, i: number) => `<li>${name}${i === 0 ? ' (included)' : ' (+$70)'}</li>`).join('')}
            </ul>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Base Price:</strong> $${basePrice || classPrice}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Extra Children (${extraChildren}):</strong> +$${extraChildrenCost}</p>
            ` : ''}
            ${hasGuests ? `
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Guest Children (${guestList.length}):</strong></p>
            <ul style="margin: 4px 0 8px 20px; color: #374151; font-size: 15px;">
              ${guestList.map((g: any) => `<li>${g.childName} (parent: ${g.parentName})</li>`).join('')}
            </ul>
            ` : ''}
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Total Price:</strong> $${classPrice}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Booking ID:</strong> ${bookingId}</p>
          </div>

          <div style="background: #FEF3F2; padding: 22px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #F0614F;">
            <h3 style="color: #F0614F; margin: 0 0 15px 0; font-size: 20px;">👨‍🍳 Student Information</h3>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #F0614F;">Student Name:</strong> ${studentName}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #F0614F;">Parent/Guardian:</strong> ${userName}</p>
          </div>

          ${hasGuests ? `
          <div style="background: #EFF6FF; padding: 22px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3B82F6;">
            <h3 style="color: #1E40AF; margin: 0 0 15px 0; font-size: 20px;">🎁 Guest Children</h3>
            <p style="margin: 0 0 10px 0; color: #374151; font-size: 15px;">
              Enrollment forms have been sent to the guest parents. They will need to complete their child's information and sign consent forms before the class.
            </p>
            ${guestList.map((g: any) => `
            <div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 8px;">
              <p style="margin: 0; color: #1E40AF; font-weight: bold; font-size: 15px;">${g.childName}</p>
              <p style="margin: 4px 0 0; color: #6B7280; font-size: 13px;">Parent: ${g.parentName} (${g.parentEmail})</p>
            </div>
            `).join('')}
          </div>
          ` : ''}

          <div style="background: #FCB414; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: white; margin: 0 0 12px 0; font-size: 18px;">📋 Important Reminders</h4>
            <ul style="color: white; margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Please arrive 10 minutes before the class starts</li>
              <li style="margin-bottom: 8px;">Wear comfortable clothes that can get a little messy</li>
              <li style="margin-bottom: 8px;">Bring a water bottle for your little chef</li>
              <li>All ingredients and equipment are provided</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #F0F9FF; border-radius: 8px; border: 1px solid #BFDBFE;">
            <p style="color: #1E3A8A; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">Questions? We're here to help!</p>
            <p style="color: #374151; margin: 0; font-size: 15px;">
              📧 <a href="mailto:info@cocinartepdx.com" style="color: #F0614F; text-decoration: none; font-weight: bold;">info@cocinartepdx.com</a>
              <br>
              📞 <a href="tel:+15039169758" style="color: #F0614F; text-decoration: none; font-weight: bold;">+1 (503) 916-9758</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const userMailOptions = {
      to: userEmail,
      subject: `Booking Confirmed - ${classTitle} on ${formattedDate}`,
      html: userEmailContent,
    };

    // Send both emails
    await sendEmail(adminMailOptions);
    console.log('Admin notification email sent');

    await sendEmail(userMailOptions);
    console.log('User confirmation email sent');

    return NextResponse.json({
      success: true,
      message: 'Confirmation emails sent successfully',
      adminEmailSent: true,
      userEmailSent: true
    });

  } catch (error) {
    console.error('Error sending booking confirmation emails:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation emails' },
      { status: 500 }
    );
  }
}
