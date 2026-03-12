import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/admin'

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
        booking_comments: notes || `Manually added by admin (${user.email})`,
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
