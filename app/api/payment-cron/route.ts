import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

// Force dynamic rendering for cron job
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Configure Supabase client
 */
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Configure Stripe client
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover',
});

/**
 * Configure email transporter
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Fetch classes that start in approximately 12 hours
 * We check classes between 11.5 and 12.5 hours from now to account for the cron schedule
 */
async function fetchClassesStartingSoon() {
    try {
        const now = new Date();
        const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);
        const elevenHalfHoursFromNow = new Date(now.getTime() + 11.5 * 60 * 60 * 1000);
        
        // Convert to ISO date strings (YYYY-MM-DD)
        const targetDate = twelveHoursFromNow.toISOString().split('T')[0];
        
        // Get target time in HH:MM:SS format
        const targetTimeStart = elevenHalfHoursFromNow.toTimeString().split(' ')[0];
        const targetTimeEnd = twelveHoursFromNow.toTimeString().split(' ')[0];

        const { data, error } = await supabase
            .from('clases')
            .select('*')
            .eq('date', targetDate)
            .gte('time', targetTimeStart)
            .lte('time', targetTimeEnd);

        if (error) {
            console.error('Error fetching classes:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchClassesStartingSoon:', error);
        return [];
    }
}

/**
 * Fetch classes that start in approximately 24 hours (1 day)
 * We check classes within ±30 minutes of exactly 24 hours from now (Los Angeles time)
 * This ensures each class is only found once per hour check
 */
async function fetchClassesStartingTomorrow() {
    try {
        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        // Check ±30 minutes around 24 hours
        const startWindow = new Date(now.getTime() + (24 * 60 - 30) * 60 * 1000); // 23:30 hours
        const endWindow = new Date(now.getTime() + (24 * 60 + 30) * 60 * 1000);   // 24:30 hours
        
        // Convert to Los Angeles timezone date string (YYYY-MM-DD)
        const dateParts = twentyFourHoursFromNow.toLocaleDateString('en-US', {
            timeZone: 'America/Los_Angeles',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split('/'); // Returns [MM, DD, YYYY]
        const targetDate = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`; // Convert to YYYY-MM-DD
        
        // Get target time in HH:MM:SS format (LA timezone)
        const targetTimeStart = startWindow.toLocaleTimeString('en-US', {
            timeZone: 'America/Los_Angeles',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const targetTimeEnd = endWindow.toLocaleTimeString('en-US', {
            timeZone: 'America/Los_Angeles',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        console.log(`   🔍 Looking for classes on ${targetDate} between ${targetTimeStart} and ${targetTimeEnd} (LA time)`);
        console.log(`   📅 Current LA time: ${now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);
        console.log(`   ⏰ Checking window: ±30 minutes around 24 hours from now`);

        const { data, error } = await supabase
            .from('clases')
            .select('*')
            .eq('date', targetDate)
            .gte('time', targetTimeStart)
            .lte('time', targetTimeEnd);

        if (error) {
            console.error('Error fetching classes starting tomorrow:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchClassesStartingTomorrow:', error);
        return [];
    }
}

/**
 * Fetch bookings for a specific class with payment status 'held'
 */
async function fetchHeldBookingsForClass(classId: string) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id,
                user_id,
                class_id,
                student_id,
                payment_status,
                payment_amount,
                stripe_payment_intent_id,
                students:student_id (
                    id,
                    parent_name,
                    child_name,
                    email
                )
            `)
            .eq('class_id', classId)
            .eq('payment_status', 'held')
            .not('stripe_payment_intent_id', 'is', null);

        if (error) {
            console.error('Error fetching held bookings:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in fetchHeldBookingsForClass:', error);
        return [];
    }
}

/**
 * Fetch ALL enrolled students for a specific class (any payment/booking status)
 */
async function fetchAllEnrolledStudents(classId: string) {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id,
                payment_status,
                booking_status,
                students:student_id (
                    id,
                    parent_name,
                    child_name,
                    email
                )
            `)
            .eq('class_id', classId)
            .in('booking_status', ['confirmed', 'pending']);

        if (error) {
            console.error('Error fetching enrolled students:', error);
            return [];
        }

        return (data || []).filter((booking: any) => booking.students);
    } catch (error) {
        console.error('Error in fetchAllEnrolledStudents:', error);
        return [];
    }
}

/**
 * Send class confirmation email (class will happen)
 */
async function sendClassConfirmationEmail(student: any, clase: any) {
    const parentName = student.students.parent_name || 'Parent';
    const childName = student.students.child_name || 'your child';
    const email = student.students.email;

    if (!email) {
        console.log(`  ⚠️ No email for ${childName}`);
        return false;
    }

    const classDate = new Date(clase.date).toLocaleDateString('en-US', { 
        timeZone: 'America/Los_Angeles',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `✅ Class Confirmed: ${clase.title} - Tomorrow!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">✅ Class Confirmed!</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hello ${parentName},</p>
                    <p>Great news! <strong>${childName}'s</strong> cooking class is confirmed!</p>
                    <div style="background: #f3f4f6; padding: 15px; margin: 15px 0;">
                        <h3>Class Details:</h3>
                        <p><strong>${clase.title}</strong></p>
                        <p>📅 ${classDate} at ${clase.time}</p>
                        <p>⏱️ ${clase.classDuration} minutes</p>
                        <p>👥 ${clase.enrolled}/${clase.maxStudents} students</p>
                    </div>
                    <p>💳 Your payment will be processed since the class reached minimum enrollment.</p>
                    <p>See you tomorrow!</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`  ✅ Confirmation sent to ${email}`);
        return true;
    } catch (error: any) {
        console.error(`  ❌ Error sending to ${email}:`, error.message);
        return false;
    }
}

/**
 * Send payment failure email (class confirmed but payment failed)
 */
async function sendPaymentFailureEmail(student: any, clase: any) {
    const parentName = (student.students as any)?.parent_name || 'Parent';
    const childName = (student.students as any)?.child_name || 'your child';
    const email = (student.students as any)?.email;

    if (!email) {
        console.log(`  ⚠️ No email for ${childName}`);
        return false;
    }

    const classDate = new Date(clase.date).toLocaleDateString('en-US', { 
        timeZone: 'America/Los_Angeles',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `⚠️ Payment Issue: ${clase.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">⚠️ Payment Processing Issue</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hello ${parentName},</p>
                    <p>Good news: The class <strong>${childName}</strong> enrolled in has reached minimum capacity and will proceed!</p>
                    
                    <div style="background: #f3f4f6; padding: 15px; margin: 15px 0;">
                        <h3>Class Details:</h3>
                        <p><strong>${clase.title}</strong></p>
                        <p>📅 ${classDate} at ${clase.time}</p>
                        <p>⏱️ ${clase.classDuration} minutes</p>
                    </div>

                    <div style="background: #fef3c7; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b;">
                        <h3 style="margin-top: 0; color: #92400e;">⚠️ Payment Issue</h3>
                        <p style="color: #92400e; margin: 10px 0;">We were unable to capture the payment for this class. This may be due to:</p>
                        <ul style="color: #92400e; margin: 10px 0;">
                            <li>Insufficient funds</li>
                            <li>Expired card</li>
                            <li>Card declined by bank</li>
                        </ul>
                    </div>

                    <div style="background: #dcfce7; padding: 15px; margin: 15px 0; border-left: 4px solid #16a34a;">
                        <h3 style="margin-top: 0; color: #166534;">📞 Action Required</h3>
                        <p style="color: #166534; margin: 10px 0;">Please contact us immediately to update your payment method and secure ${childName}'s spot:</p>
                        <p style="color: #166534; margin: 10px 0;"><strong>Email:</strong> info@cocinartepdx.com</p>
                        <p style="color: #166534; margin: 10px 0;"><strong>Phone:</strong> Contact information</p>
                    </div>

                    <p>We want to ensure ${childName} can attend this class! Please reach out as soon as possible.</p>
                    <p>Thank you for your understanding!</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`  ✅ Payment failure notification sent to ${email}`);
        return true;
    } catch (error: any) {
        console.error(`  ❌ Error sending to ${email}:`, error.message);
        return false;
    }
}

/**
 * Send class cancellation email (didn't reach minimum)
 */
async function sendClassCancellationEmail(student: any, clase: any) {
    const parentName = student.students.parent_name || 'Parent';
    const childName = student.students.child_name || 'your child';
    const email = student.students.email;

    if (!email) {
        console.log(`  ⚠️ No email for ${childName}`);
        return false;
    }

    const classDate = new Date(clase.date).toLocaleDateString('en-US', {
        timeZone: 'America/Los_Angeles',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `❌ Class Cancelled: ${clase.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Class Cancelled</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hello ${parentName},</p>
                    <p>We regret to inform you that the following class has been cancelled due to insufficient enrollment:</p>
                    <div style="background: #f3f4f6; padding: 15px; margin: 15px 0;">
                        <h3>Cancelled Class:</h3>
                        <p><strong>${clase.title}</strong></p>
                        <p>📅 Was scheduled for: ${classDate} at ${clase.time}</p>
                        <p>👥 Enrollment: ${clase.enrolled}/${clase.maxStudents} (minimum not reached)</p>
                    </div>
                    <div style="background: #d4edda; padding: 15px; margin: 15px 0; border-left: 4px solid #28a745;">
                        <h3 style="margin-top: 0; color: #155724;">💚 Payment Information</h3>
                        <p style="color: #155724; margin: 10px 0;"><strong>Your card was NOT charged.</strong></p>
                        <p style="color: #155724; margin: 10px 0;">The payment authorization has been completely released, and you will not see any charge on your statement.</p>
                    </div>
                    <p>We apologize for any inconvenience and hope to see ${childName} in a future class!</p>
                    <p>Browse other available classes at: <a href="https://cocinartepdx.com">cocinartepdx.com</a></p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`  ✅ Cancellation sent to ${email}`);
        return true;
    } catch (error: any) {
        console.error(`  ❌ Error sending to ${email}:`, error.message);
        return false;
    }
}

/**
 * Send admin notification email when class is below minimum enrollment
 */
async function sendAdminNotificationEmail(clase: any, enrolled: number, minStudents: number) {
    const adminEmail = 'info@cocinartepdx.com';

    const classDate = new Date(clase.date).toLocaleDateString('en-US', {
        timeZone: 'America/Los_Angeles',
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: adminEmail,
        subject: `⚠️ Action Required: Class Below Minimum - ${clase.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">⚠️ Class Below Minimum Enrollment</h1>
                </div>
                <div style="padding: 20px;">
                    <p>The following class has not reached minimum enrollment and requires your attention:</p>

                    <div style="background: #fef3c7; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b;">
                        <h3 style="margin-top: 0;">${clase.title}</h3>
                        <p>📅 <strong>Date:</strong> ${classDate} at ${clase.time}</p>
                        <p>👥 <strong>Current Enrollment:</strong> ${enrolled} students</p>
                        <p>📊 <strong>Minimum Required:</strong> ${minStudents} students</p>
                        <p>🎯 <strong>Maximum Capacity:</strong> ${clase.maxStudents} students</p>
                    </div>

                    <div style="background: #fee2e2; padding: 15px; margin: 15px 0; border-left: 4px solid #ef4444;">
                        <h3 style="margin-top: 0; color: #dc2626;">⏰ Action Required</h3>
                        <p style="color: #dc2626; margin: 10px 0;">This class starts in approximately 24 hours.</p>
                        <p style="color: #dc2626; margin: 10px 0;">Please review and decide whether to:</p>
                        <ul style="color: #dc2626;">
                            <li>Cancel the class (will release held payments and notify students)</li>
                            <li>Proceed with the class anyway</li>
                        </ul>
                    </div>

                    <p style="margin-top: 20px;">
                        <a href="https://cocinartepdx.com/dashboard/classes"
                           style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Go to Dashboard
                        </a>
                    </p>

                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        This is an automated notification from the Cocinarte booking system.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`  ✅ Admin notification sent to ${adminEmail}`);
        return true;
    } catch (error: any) {
        console.error(`  ❌ Error sending admin notification:`, error.message);
        return false;
    }
}

/**
 * Capture a held payment (charge the customer)
 */
async function capturePayment(paymentIntentId: string, bookingId: string) {
    try {
        console.log(`  📤 Attempting to capture payment: ${paymentIntentId}`);
        
        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            // Update booking status in database
            await supabase
                .from('bookings')
                .update({ 
                    payment_status: 'completed',
                    booking_status: 'confirmed'
                })
                .eq('id', bookingId);
            
            console.log(`  ✅ Payment captured successfully`);
            return true;
        } else {
            console.log(`  ⚠️ Payment status: ${paymentIntent.status}`);
            return false;
        }
    } catch (error: any) {
        console.error(`  ❌ Error capturing payment:`, error.message);
        return false;
    }
}

/**
 * Cancel a held payment authorization (release the hold)
 */
async function cancelPaymentAuthorization(paymentIntentId: string, bookingId: string) {
    try {
        console.log(`  🚫 Attempting to cancel payment authorization: ${paymentIntentId}`);
        
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
        
        if (paymentIntent.status === 'canceled') {
            // Update booking status in database
            await supabase
                .from('bookings')
                .update({ 
                    payment_status: 'canceled',
                    booking_status: 'cancelled',
                    notes: 'Payment authorization released - class did not reach minimum capacity'
                })
                .eq('id', bookingId);
            
            console.log(`  ✅ Payment authorization canceled successfully`);
            return true;
        } else {
            console.log(`  ⚠️ Payment status: ${paymentIntent.status}`);
            return false;
        }
    } catch (error: any) {
        console.error(`  ❌ Error canceling payment:`, error.message);
        return false;
    }
}

/**
 * Update ALL booking statuses for a class
 */
async function updateAllBookingStatuses(classId: string, paymentStatus: string, bookingStatus: string, notes: string | null = null) {
    try {
        const updateData: any = {
            payment_status: paymentStatus,
            booking_status: bookingStatus
        };
        
        if (notes) {
            updateData.notes = notes;
        }

        const { data, error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('class_id', classId)
            .in('booking_status', ['confirmed', 'pending'])
            .select();

        if (error) {
            console.error('Error updating booking statuses:', error);
            return false;
        }

        console.log(`   ✅ Updated ${data?.length || 0} bookings to status: ${bookingStatus}`);
        return true;
    } catch (error) {
        console.error('Error in updateAllBookingStatuses:', error);
        return false;
    }
}

/**
 * Process a class completely - send emails AND process payments
 */
async function processClassComplete(clase: any) {
    const classTitle = clase.title || 'Unknown Class';
    const minStudents = clase.minStudents || 0;
    const maxStudents = clase.maxStudents || 0;

    // Fetch all enrolled students to get actual count
    const allStudents = await fetchAllEnrolledStudents(clase.id);
    const enrolled = allStudents.length; // Use actual enrolled count from bookings
    const hasMinimum = enrolled >= minStudents;

    console.log(`\n📚 Processing class: ${classTitle}`);
    console.log(`   Enrollment: ${enrolled}/${maxStudents} (minimum: ${minStudents})`);
    console.log(`   Status: ${hasMinimum ? '✅ WILL PROCEED (Has minimum)' : '⚠️ BELOW MINIMUM (Admin notification)'}`);
    console.log(`   Found ${allStudents.length} enrolled students`);

    let emailsConfirmed = 0;
    let emailsPaymentFailed = 0;
    let paymentsCaptured = 0;
    let paymentsFailed = 0;
    let adminNotified = false;

    // If class doesn't have minimum enrollment, notify admin and skip processing
    if (!hasMinimum) {
        console.log(`\n   ⚠️ Class below minimum - sending admin notification...`);
        adminNotified = await sendAdminNotificationEmail(clase, enrolled, minStudents);
        console.log(`   📧 Admin notification: ${adminNotified ? 'Sent' : 'Failed'}`);
        console.log(`   ⏸️ Skipping payment processing - awaiting admin decision`);

        return {
            classTitle,
            hasMinimum,
            emailsConfirmed: 0,
            emailsCancelled: 0,
            emailsPaymentFailed: 0,
            paymentsCaptured: 0,
            paymentsCanceled: 0,
            paymentsFailed: 0,
            adminNotified
        };
    }

    // Class has minimum - proceed with payment capture and confirmations
    // Fetch held bookings for payment processing
    const heldBookings = await fetchHeldBookingsForClass(clase.id);
    console.log(`   Found ${heldBookings.length} held payments to process`);

    // STEP 1: Process payments FIRST for held bookings
    console.log(`\n   💳 Processing payments...`);
    const successfulBookingIds = new Set<string>();
    const failedBookingIds = new Set<string>();

    for (const heldBooking of heldBookings) {
        const studentName = (heldBooking.students as any)?.child_name || 'Unknown Student';
        const parentEmail = (heldBooking.students as any)?.email || 'No email';

        console.log(`\n   💳 Processing payment for: ${studentName} (${parentEmail})`);

        // Capture payment
        const success = await capturePayment(
            heldBooking.stripe_payment_intent_id,
            heldBooking.id
        );
        if (success) {
            paymentsCaptured++;
            successfulBookingIds.add(heldBooking.id);
        } else {
            paymentsFailed++;
            failedBookingIds.add(heldBooking.id);
        }
    }

    // STEP 2: Update booking statuses for those without held payments
    console.log(`\n   📝 Updating booking statuses for non-held payments...`);
    console.log(`   ✅ Class HAS minimum → Setting non-held bookings to CONFIRMED`);
    const { error } = await supabase
        .from('bookings')
        .update({
            payment_status: 'completed',
            booking_status: 'confirmed'
        })
        .eq('class_id', clase.id)
        .neq('payment_status', 'held')
        .in('booking_status', ['confirmed', 'pending']);

    if (error) {
        console.error('Error updating non-held bookings:', error);
    }

    // STEP 3: Send emails to students (ONLY send confirmation if payment succeeded)
    for (const student of allStudents) {
        const childName = (student.students as any)?.child_name || 'Student';
        const email = (student.students as any)?.email;
        const bookingId = student.id;

        console.log(`\n   👤 Student: ${childName} (${email})`);

        // Check if this booking had a payment that failed
        if (failedBookingIds.has(bookingId)) {
            console.log(`   ⚠️ Payment failed - sending payment failure email`);
            // Send payment failure notification
            const success = await sendPaymentFailureEmail(student, clase);
            if (success) emailsPaymentFailed++;
        } else {
            // Send confirmation email (payment succeeded or no held payment required)
            const success = await sendClassConfirmationEmail(student, clase);
            if (success) emailsConfirmed++;
        }
    }

    return {
        classTitle,
        hasMinimum,
        emailsConfirmed,
        emailsCancelled: 0,
        emailsPaymentFailed,
        paymentsCaptured,
        paymentsCanceled: 0,
        paymentsFailed,
        adminNotified: false
    };
}

/**
 * Main task - checks classes starting in 24 hours and processes everything (from payment-capture-handler.js)
 */
async function performPaymentProcessingTask() {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { 
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    console.log(`\n[${timestamp}] 🕐 Hourly Booking Check - Cron Job Executed!`);
    console.log('='.repeat(80));
    console.log('⏰ Running scheduled hourly check for bookings 24 hours before class');
    
    try {
        // Check for classes starting in 24 hours (tomorrow)
        console.log('\n🔍 Checking for classes starting in 24 hours...');
        const classes = await fetchClassesStartingTomorrow();
        console.log(`📋 Found ${classes.length} classes starting tomorrow that need processing`);
        
        if (classes.length === 0) {
            console.log('✅ No classes to process at this time - all clear!');
            console.log('📌 Next check will run in 1 hour');
            console.log('='.repeat(80));
            return { message: 'No classes to process', classesProcessed: 0 };
        }

        const results = [];

        // Process each class (emails + payments together)
        for (const clase of classes) {
            const result = await processClassComplete(clase);
            results.push(result);
        }

        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('📊 PROCESSING SUMMARY (24 Hours Before Class)');
        console.log('='.repeat(80));

        const totalEmailsConfirmed = results.reduce((sum, r) => sum + r.emailsConfirmed, 0);
        const totalEmailsPaymentFailed = results.reduce((sum, r) => sum + (r.emailsPaymentFailed || 0), 0);
        const totalPaymentsCaptured = results.reduce((sum, r) => sum + r.paymentsCaptured, 0);
        const totalPaymentsFailed = results.reduce((sum, r) => sum + r.paymentsFailed, 0);
        const totalAdminNotifications = results.filter(r => r.adminNotified).length;

        console.log('\n📧 EMAILS SENT:');
        console.log(`   ✅ Confirmation emails: ${totalEmailsConfirmed}`);
        console.log(`   ⚠️ Payment failure alerts: ${totalEmailsPaymentFailed}`);
        console.log(`   📬 Admin notifications (below minimum): ${totalAdminNotifications}`);

        console.log('\n💳 PAYMENTS PROCESSED:');
        console.log(`   ✅ Payments captured (charged): ${totalPaymentsCaptured}`);
        console.log(`   ❌ Failed operations: ${totalPaymentsFailed}`);

        console.log('\n📋 DETAILS BY CLASS:');
        results.forEach(result => {
            console.log(`\n   ${result.classTitle}:`);
            if (result.hasMinimum) {
                console.log(`      Status: ✅ Proceeding (met minimum)`);
                console.log(`      Emails: ${result.emailsConfirmed} confirmed | ${result.emailsPaymentFailed || 0} payment failed`);
                console.log(`      Payments: ${result.paymentsCaptured} captured | ${result.paymentsFailed} failed`);
            } else {
                console.log(`      Status: ⚠️ Below minimum - Admin notified`);
                console.log(`      Admin notification: ${result.adminNotified ? 'Sent' : 'Failed'}`);
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log('✅ Booking check completed successfully');
        console.log('📌 Next check will run in 1 hour');
        console.log('='.repeat(80));

        return {
            message: 'Payment processing completed',
            classesProcessed: classes.length,
            results
        };
        
    } catch (error) {
        console.error('❌ Error in class processing cron job:', error);
        throw error;
    }
}

export async function GET(request: NextRequest) {
  try {
    console.log("Payment processing cron job started...");
    
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    console.log(`Cron executed at (LA time): ${timestamp}`);
    
    // Execute payment processing task
    const result = await performPaymentProcessingTask();
    
    return NextResponse.json({
      message: "Payment processing cron job executed successfully", 
      timestamp,
      status: "success",
      result
    }, {status: 200});
    
  } catch (error) {
    console.error("Payment processing cron job error:", error);
    return NextResponse.json({
      error: "Cron job failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }, {status: 500});
  }
}
