import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = await isAdminUser(supabase, user.email)

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { childId, classId, paymentAmount, notes } = body

    if (!childId || !classId) {
      return NextResponse.json(
        { error: 'Missing required fields: childId and classId are required' },
        { status: 400 }
      )
    }

    // Get child and parent information
    const { data: child, error: childError } = await supabase
      .from('children')
      .select(`
        *,
        parent:parents!inner (
          id,
          user_id,
          parent_guardian_names,
          parent_email
        )
      `)
      .eq('id', childId)
      .single()

    if (childError || !child) {
      console.error('Error fetching child:', childError)
      return NextResponse.json(
        { error: 'Child not found' },
        { status: 404 }
      )
    }

    // Get class information to determine payment amount if not provided
    const { data: clase, error: classError } = await supabase
      .from('clases')
      .select('*')
      .eq('id', classId)
      .single()

    if (classError || !clase) {
      console.error('Error fetching class:', classError)
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if class is full
    const { count: enrolledCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId)
      .in('booking_status', ['confirmed', 'pending'])

    if (enrolledCount !== null && clase.maxStudents && enrolledCount >= clase.maxStudents) {
      return NextResponse.json(
        { error: 'Class is full' },
        { status: 400 }
      )
    }

    // Get or create student record for this child
    const { data: existingStudent, error: studentFetchError } = await supabase
      .from('students')
      .select('id')
      .eq('parent_email', child.parent.parent_email)
      .eq('child_full_name', child.child_full_name)
      .single()

    let studentId: string

    if (existingStudent) {
      studentId = existingStudent.id
    } else {
      // Create a new student record (include both legacy and new columns)
      const { data: newStudent, error: studentCreateError } = await supabase
        .from('students')
        .insert({
          // Legacy columns (required for NOT NULL constraints)
          parent_name: child.parent.parent_guardian_names,
          child_name: child.child_full_name,
          email: child.parent.parent_email,
          phone: child.parent.parent_phone || '',
          // New comprehensive columns
          parent_guardian_names: child.parent.parent_guardian_names,
          child_full_name: child.child_full_name,
          parent_email: child.parent.parent_email,
          parent_phone: child.parent.parent_phone,
          child_age: child.child_age,
          allergies: child.allergies,
          dietary_restrictions: child.dietary_restrictions,
          medical_conditions: child.medical_conditions,
          media_permission: child.media_permission || false,
        })
        .select('id')
        .single()

      if (studentCreateError || !newStudent) {
        console.error('Error creating student:', studentCreateError)
        console.error('Student data attempted:', {
          parent_name: child.parent.parent_guardian_names,
          child_name: child.child_full_name,
          email: child.parent.parent_email,
          age: child.child_age,
        })
        return NextResponse.json(
          { error: `Failed to create student record: ${studentCreateError?.message || 'Unknown error'}` },
          { status: 500 }
        )
      }

      studentId = newStudent.id
    }

    // Create the booking
    const finalPaymentAmount = paymentAmount !== undefined ? paymentAmount : clase.price

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: child.parent.user_id || user.id, // Use parent's user_id if available, otherwise admin's
        class_id: classId,
        student_id: studentId,
        child_id: childId,
        parent_id: child.parent.id,
        payment_amount: finalPaymentAmount,
        payment_status: finalPaymentAmount === 0 ? 'completed' : 'pending',
        payment_method: 'stripe',
        booking_status: 'confirmed',
        booking_comments: `[Admin enrollment by ${user.email}]${notes ? ` - ${notes}` : ''}`,
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // Send confirmation emails
    try {
      const formattedDate = new Date(clase.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      const formattedTime = clase.time
        ? new Date(`2000-01-01T${clase.time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        : 'TBD'

      const parentName = child.parent.parent_guardian_names
      const parentEmail = child.parent.parent_email
      const studentName = child.child_full_name

      // Admin notification email
      const adminEmailContent = `
        <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
          <div style="background: #1E3A8A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Admin Enrollment</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">A child was manually added to a class by ${user.email}</p>
          </div>
          <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1E3A8A;">
              <h3 style="color: #1E3A8A; margin: 0 0 15px 0; font-size: 20px;">Class Information</h3>
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Class:</strong> ${clase.title}</p>
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Date:</strong> ${formattedDate}</p>
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Time:</strong> ${formattedTime}</p>
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Payment:</strong> $${finalPaymentAmount} (no payment processed - admin enrollment)</p>
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Booking ID:</strong> ${booking.id}</p>
            </div>
            <div style="background: #FEF3F2; padding: 20px; border-radius: 8px; border-left: 4px solid #F0614F;">
              <h3 style="color: #F0614F; margin: 0 0 15px 0; font-size: 20px;">Student Information</h3>
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #F0614F;">Student:</strong> ${studentName}</p>
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #F0614F;">Parent/Guardian:</strong> ${parentName}</p>
              <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #F0614F;">Email:</strong> ${parentEmail}</p>
            </div>
          </div>
        </div>
      `

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
              <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Class:</strong> ${clase.title}</p>
              <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Date:</strong> ${formattedDate}</p>
              <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Time:</strong> ${formattedTime}</p>
              <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #1E3A8A;">Booking ID:</strong> ${booking.id}</p>
            </div>
            <div style="background: #FEF3F2; padding: 22px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #F0614F;">
              <h3 style="color: #F0614F; margin: 0 0 15px 0; font-size: 20px;">👨‍🍳 Student Information</h3>
              <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #F0614F;">Student Name:</strong> ${studentName}</p>
              <p style="margin: 8px 0; color: #374151; font-size: 16px;"><strong style="color: #F0614F;">Parent/Guardian:</strong> ${parentName}</p>
            </div>
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
                📧 <a href="mailto:cocinarte@casitaazulpdx.org" style="color: #F0614F; text-decoration: none; font-weight: bold;">cocinarte@casitaazulpdx.org</a>
                <br>
                📞 <a href="tel:+15039169758" style="color: #F0614F; text-decoration: none; font-weight: bold;">+1 (503) 916-9758</a>
              </p>
            </div>
          </div>
        </div>
      `

      await sendEmail({
        to: 'diego@comcreate.org',
        subject: `Admin Enrollment: ${clase.title} - ${formattedDate}`,
        html: adminEmailContent,
      })
      console.log('Admin notification email sent for manual enrollment')

      if (parentEmail) {
        await sendEmail({
          to: parentEmail,
          subject: `Booking Confirmed - ${clase.title} on ${formattedDate}`,
          html: userEmailContent,
        })
        console.log('User confirmation email sent for manual enrollment')
      }
    } catch (emailError) {
      // Don't fail the booking if email fails
      console.error('Error sending confirmation emails:', emailError)
    }

    return NextResponse.json({
      success: true,
      booking,
      message: 'Child successfully added to class',
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/add-child-to-class:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
