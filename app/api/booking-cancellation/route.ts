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
      isAdminEnrollment,
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
              ${isAdminEnrollment
                ? 'No refund issued — admin-added enrollment (no payment was collected).'
                : refundAmount != null && refundAmount > 0
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

    // Payment section adapts per case so refund language stays accurate;
    // the surrounding copy uses the approved customer-facing wording.
    const paymentMessage = isAdminEnrollment
      ? 'This booking was added to the class by our team, so no payment was ever collected and no refund will be issued.'
      : refundAmount != null && refundAmount > 0
        ? isLateCancel
          ? `Per our late cancellation policy, a refund of <strong>$${Number(refundAmount).toFixed(2)}</strong> is on its way! You'll see it back on your card within 5–10 business days. If you have any questions about your refund, don't hesitate to reach out to us directly.`
          : `Your refund is on its way! You'll see it back on your card within 5–10 business days. If you have any questions about your refund, don't hesitate to reach out to us directly.`
        : refundAmount != null && refundAmount === 0
          ? 'Per our cancellation policy, no refund will be issued for this booking. If you have any questions, please reach out to us directly.'
          : "Your refund is on its way! You'll see it back on your card within 5–10 business days. If you have any questions about your refund, don't hesitate to reach out to us directly.";

    const userEmailContent = `
      <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
        <div style="background: #F0614F; color: white; padding: 35px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Class Cancelled</h1>
        </div>

        <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">Hi ${userName},</p>

          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            We're so sorry — we've had to cancel the upcoming class and we know that's frustrating. We never take this lightly!
          </p>

          <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 16px;"><strong style="color: #DC2626;">Class Cancelled:</strong> ${classTitle}</p>
            <p style="margin: 0; color: #374151; font-size: 16px;"><strong style="color: #DC2626;">Was scheduled for:</strong> ${formattedDate} at ${formattedTime}</p>
          </div>

          <div style="background: #F0F9FF; padding: 22px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E3A8A;">
            <h3 style="color: #1E3A8A; margin: 0 0 12px 0; font-size: 20px;">About Your Payment</h3>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              ${paymentMessage}
            </p>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 20px 0;">
            We hope this is just a small bump in the road and that we'll get to cook with ${studentName} very soon. There's always something delicious coming up — we'd love to have you back in the kitchen with us! 🍳
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.cocinartepdx.com" style="display: inline-block; background: #F0614F; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              👉 Browse Upcoming Classes
            </a>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 24px 0 4px 0;">With love from the kitchen,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;"><strong>The CocinArte Team</strong></p>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #F0F9FF; border-radius: 8px; border: 1px solid #BFDBFE;">
            <p style="color: #1E3A8A; margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">Questions? Reach us at</p>
            <p style="color: #374151; margin: 0; font-size: 15px;">
              📧 <a href="mailto:cocinarte@casitaazulpdx.org" style="color: #F0614F; text-decoration: none; font-weight: bold;">cocinarte@casitaazulpdx.org</a>
              <br>
              📞 <a href="tel:+15039169758" style="color: #F0614F; text-decoration: none; font-weight: bold;">(503) 916-9758</a>
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
