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
      bookingId,
      refundAmount,
      isLateCancel,
    } = body;

    // Validate required fields
    if (!userEmail || !userName || !studentName || !classTitle || !classDate || !classTime || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
        <div style="background: #DC2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">⚠️ Booking Cancelled</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">A customer has cancelled their booking</p>
        </div>

        <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #DC2626; margin: 0 0 20px 0; font-size: 24px; border-bottom: 2px solid #F0614F; padding-bottom: 10px;">Cancellation Details</h2>

          <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #DC2626;">
            <h3 style="color: #DC2626; margin: 0 0 15px 0; font-size: 20px;">🍳 Class Information</h3>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #DC2626;">Class:</strong> ${classTitle}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #DC2626;">Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #DC2626;">Time:</strong> ${formattedTime}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #DC2626;">Price:</strong> $${classPrice}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #DC2626;">Booking ID:</strong> ${bookingId}</p>
          </div>

          <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1E3A8A;">
            <h3 style="color: #1E3A8A; margin: 0 0 15px 0; font-size: 20px;">👨‍👩‍👧 Customer Information</h3>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Parent/Guardian:</strong> ${userName}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Email:</strong> <a href="mailto:${userEmail}" style="color: #1E3A8A; text-decoration: none;">${userEmail}</a></p>
            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Student Name:</strong> ${studentName}</p>
          </div>

          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #92400E; margin: 0 0 10px 0; font-size: 18px;">📝 Refund Details</h4>
            <p style="color: #92400E; margin: 0; font-size: 15px;">
              ${refundAmount != null && refundAmount > 0
                ? `Refund of $${Number(refundAmount).toFixed(2)} has been automatically processed${isLateCancel ? ' (late cancellation policy)' : ''}.`
                : refundAmount != null && refundAmount === 0
                  ? 'No refund issued (late cancellation policy — $0 refund).'
                  : 'Please update class roster and process any necessary refunds.'
              }
            </p>
          </div>
        </div>
      </div>
    `;

    const adminMailOptions = {
      to: 'diego@comcreate.org',
      subject: `Booking Cancelled: ${classTitle} - ${formattedDate}`,
      html: adminEmailContent,
    };

    // User cancellation confirmation email
    const userEmailContent = `
      <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
        <div style="background: #F0614F; color: white; padding: 35px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 36px; font-weight: bold;">Booking Cancelled</h1>
          <p style="margin: 12px 0 0 0; font-size: 18px;">Your class reservation has been cancelled</p>
        </div>

        <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #DC2626; margin: 0 0 25px 0; font-size: 26px; border-bottom: 2px solid #FCB414; padding-bottom: 10px;">Cancellation Confirmation</h2>

          <div style="background: #FEF2F2; padding: 22px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #DC2626;">
            <h3 style="color: #DC2626; margin: 0 0 15px 0; font-size: 20px;">🍳 Cancelled Class Details</h3>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #DC2626;">Class:</strong> ${classTitle}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #DC2626;">Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #DC2626;">Time:</strong> ${formattedTime}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #DC2626;">Price:</strong> $${classPrice}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #DC2626;">Booking ID:</strong> ${bookingId}</p>
          </div>

          <div style="background: #F0F9FF; padding: 22px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1E3A8A;">
            <h3 style="color: #1E3A8A; margin: 0 0 15px 0; font-size: 20px;">👨‍🍳 Student Information</h3>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Student Name:</strong> ${studentName}</p>
            <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Parent/Guardian:</strong> ${userName}</p>
          </div>

          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #92400E; margin: 0 0 12px 0; font-size: 18px;">💳 Refund Information</h4>
            <p style="color: #92400E; margin: 0; font-size: 15px; line-height: 1.6;">
              ${refundAmount != null && refundAmount > 0
                ? isLateCancel
                  ? `A refund of <strong>$${Number(refundAmount).toFixed(2)}</strong> will be processed to your original payment method within 5-7 business days (late cancellation policy).`
                  : `A full refund of <strong>$${Number(refundAmount).toFixed(2)}</strong> will be processed to your original payment method within 5-7 business days.`
                : refundAmount != null && refundAmount === 0
                  ? 'Per our late cancellation policy, no refund will be issued for this booking.'
                  : 'If you paid for this class, a refund will be processed to your original payment method within 5-7 business days.'
              }
            </p>
          </div>

          <div style="background: #FCB414; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: white; margin: 0 0 12px 0; font-size: 18px;">🎉 We Hope to See You Again!</h4>
            <p style="color: white; margin: 0; font-size: 15px; line-height: 1.6;">
              We're sorry you had to cancel this time. We'd love to have ${studentName} join us for another cooking adventure soon!
              Check out our calendar for upcoming classes.
            </p>
          </div>

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
    `;

    const userMailOptions = {
      to: userEmail,
      subject: `Booking Cancelled - ${classTitle} on ${formattedDate}`,
      html: userEmailContent,
    };

    // Send both emails
    await sendEmail(adminMailOptions);
    console.log('Admin cancellation notification email sent');

    await sendEmail(userMailOptions);
    console.log('User cancellation confirmation email sent');

    return NextResponse.json({
      success: true,
      message: 'Cancellation emails sent successfully',
      adminEmailSent: true,
      userEmailSent: true
    });

  } catch (error) {
    console.error('Error sending booking cancellation emails:', error);
    return NextResponse.json(
      { error: 'Failed to send cancellation emails' },
      { status: 500 }
    );
  }
}
