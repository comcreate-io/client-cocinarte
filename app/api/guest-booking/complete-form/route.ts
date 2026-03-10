import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { sendEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { form_token, form_data, reuse_child_id } = body

    if (!form_token || !form_data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate required form fields
    if (!form_data.child_full_name || !form_data.child_age || !form_data.guest_parent_name ||
        !form_data.guest_parent_phone || !form_data.liability_consent ||
        !form_data.parent_name_signed || !form_data.child_name_signed || !form_data.signature_data_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required form fields' },
        { status: 400 }
      )
    }

    // Fetch the guest booking
    const { data: guestBooking, error: gbError } = await supabase
      .from('guest_bookings')
      .select('*')
      .eq('form_token', form_token)
      .single()

    if (gbError || !guestBooking) {
      return NextResponse.json(
        { success: false, error: 'Invalid form token' },
        { status: 404 }
      )
    }

    if (guestBooking.form_completed_at) {
      return NextResponse.json(
        { success: false, error: 'This form has already been completed' },
        { status: 400 }
      )
    }

    // Upload signature to Cloudinary
    let signatureResult
    try {
      signatureResult = await uploadToCloudinary(
        form_data.signature_data_url,
        'cocinarte-signatures'
      )
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload signature' },
        { status: 500 }
      )
    }

    // Capture IP and user-agent for audit trail
    const ip_address = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') || 'unknown'
    const user_agent = request.headers.get('user-agent') || 'unknown'

    // Insert guest child record
    const guestChildData: Record<string, any> = {
      child_full_name: form_data.child_full_name,
      child_age: form_data.child_age,
      child_preferred_name: form_data.child_preferred_name || null,
      has_cooking_experience: form_data.has_cooking_experience || false,
      cooking_experience_details: form_data.cooking_experience_details || null,
      allergies: form_data.allergies || null,
      dietary_restrictions: form_data.dietary_restrictions || null,
      medical_conditions: form_data.medical_conditions || null,
      emergency_medications: form_data.emergency_medications || null,
      additional_notes: form_data.additional_notes || null,
      authorized_pickup_persons: form_data.authorized_pickup_persons || null,
      custody_restrictions: form_data.custody_restrictions || null,
      media_permission: form_data.media_permission || false,
      guest_parent_email: guestBooking.guest_parent_email,
      guest_parent_name: form_data.guest_parent_name,
      guest_parent_phone: form_data.guest_parent_phone,
      emergency_contact_name: form_data.emergency_contact_name || form_data.guest_parent_name,
      emergency_contact_phone: form_data.emergency_contact_phone || form_data.guest_parent_phone,
      emergency_contact_relationship: form_data.emergency_contact_relationship || 'Parent',
      liability_consent: form_data.liability_consent,
      social_media_consent: form_data.social_media_consent || false,
      parent_name_signed: form_data.parent_name_signed,
      child_name_signed: form_data.child_name_signed,
      signature_url: signatureResult.secure_url,
      signature_public_id: signatureResult.public_id,
      signed_at: new Date().toISOString(),
      ip_address,
      user_agent,
    }

    const { data: guestChild, error: childError } = await supabase
      .from('guest_children')
      .insert([guestChildData])
      .select()
      .single()

    if (childError) {
      console.error('Error creating guest child:', childError)
      return NextResponse.json(
        { success: false, error: 'Failed to save child information' },
        { status: 500 }
      )
    }

    // Update guest booking with completion info
    const { error: updateError } = await supabase
      .from('guest_bookings')
      .update({
        form_completed_at: new Date().toISOString(),
        guest_child_id: guestChild.id,
      })
      .eq('id', guestBooking.id)

    if (updateError) {
      console.error('Error updating guest booking:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update booking record' },
        { status: 500 }
      )
    }

    // Fetch class details for the confirmation emails
    try {
      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          id,
          payment_amount,
          class:clases (
            title,
            date,
            time,
            classDuration
          )
        `)
        .eq('id', guestBooking.booking_id)
        .single()

      const clase = (booking as any)?.class
      const formattedDate = clase?.date
        ? new Date(clase.date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })
        : 'TBD'
      const formattedTime = clase?.time
        ? new Date(`2000-01-01T${clase.time}`).toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true,
          })
        : 'TBD'

      const childName = form_data.child_full_name
      const classTitle = clase?.title || 'Cooking Class'

      // Health summary for emails
      const healthItems: string[] = []
      if (form_data.allergies) healthItems.push(`<strong>Allergies:</strong> ${form_data.allergies}`)
      if (form_data.dietary_restrictions) healthItems.push(`<strong>Dietary Restrictions:</strong> ${form_data.dietary_restrictions}`)
      if (form_data.medical_conditions) healthItems.push(`<strong>Medical Conditions:</strong> ${form_data.medical_conditions}`)
      if (form_data.emergency_medications) healthItems.push(`<strong>Emergency Medications:</strong> ${form_data.emergency_medications}`)

      const healthSection = healthItems.length > 0
        ? `<div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #F59E0B;">
            <h4 style="color: #92400E; margin: 0 0 8px 0;">Health & Safety Notes</h4>
            ${healthItems.map(h => `<p style="margin: 4px 0; color: #374151; font-size: 13px;">${h}</p>`).join('')}
          </div>`
        : ''

      // 1. Email to guest parent — confirmation that enrollment is complete
      const guestParentEmail = `
        <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
          <div style="background: #1E3A8A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Enrollment Complete!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">${childName} is all set for class</p>
          </div>
          <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${form_data.guest_parent_name},
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Thank you for completing the enrollment form for <strong>${childName}</strong>. Everything is ready for the class!
            </p>

            <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E3A8A;">
              <h3 style="color: #1E3A8A; margin: 0 0 15px 0;">Class Details</h3>
              <p style="margin: 8px 0; color: #374151;"><strong>Class:</strong> ${classTitle}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${formattedTime}</p>
              ${clase?.classDuration ? `<p style="margin: 8px 0; color: #374151;"><strong>Duration:</strong> ${clase.classDuration} minutes</p>` : ''}
            </div>

            <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16A34A;">
              <h3 style="color: #166534; margin: 0 0 10px 0;">Child Information Submitted</h3>
              <p style="margin: 6px 0; color: #374151; font-size: 14px;"><strong>Child:</strong> ${childName}${form_data.child_preferred_name ? ` (${form_data.child_preferred_name})` : ''}, Age ${form_data.child_age}</p>
              <p style="margin: 6px 0; color: #374151; font-size: 14px;"><strong>Parent Contact:</strong> ${form_data.guest_parent_name}, ${form_data.guest_parent_phone}</p>
              <p style="margin: 6px 0; color: #374151; font-size: 14px;"><strong>Liability Consent:</strong> Signed</p>
              <p style="margin: 6px 0; color: #374151; font-size: 14px;"><strong>Media Permission:</strong> ${form_data.media_permission ? 'Granted' : 'Not granted'}</p>
            </div>

            ${healthSection}

            <p style="color: #374151; font-size: 14px; margin-top: 20px;">
              This class was gifted by <strong>${guestBooking.purchaser_name}</strong>. No further action is needed on your part.
            </p>

            <p style="color: #6B7280; font-size: 13px; text-align: center; margin-top: 30px;">
              If you have any questions, please contact us at info@cocinarte.com
            </p>
          </div>
        </div>
      `

      // 2. Email to purchaser — notifying that the guest form is complete
      const purchaserEmail = `
        <div style="font-family: 'Arial', 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
          <div style="background: #1E3A8A; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Guest Enrollment Complete!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">${childName} is ready for class</p>
          </div>
          <div style="background: white; padding: 30px; border: 2px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${guestBooking.purchaser_name},
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              Great news! <strong>${guestBooking.guest_parent_name}</strong> has completed the enrollment form for <strong>${childName}</strong>. Everything is set for the class.
            </p>

            <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1E3A8A;">
              <h3 style="color: #1E3A8A; margin: 0 0 15px 0;">Class Details</h3>
              <p style="margin: 8px 0; color: #374151;"><strong>Class:</strong> ${classTitle}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${formattedTime}</p>
            </div>

            <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16A34A;">
              <p style="color: #166534; margin: 0; font-size: 14px;">
                <strong>${guestBooking.guest_parent_name}</strong> has submitted all required information and signed the consent forms for <strong>${childName}</strong>. No further action is needed.
              </p>
            </div>

            <p style="color: #6B7280; font-size: 13px; text-align: center; margin-top: 30px;">
              If you have any questions, please contact us at info@cocinarte.com
            </p>
          </div>
        </div>
      `

      await Promise.all([
        sendEmail({
          to: guestBooking.guest_parent_email,
          subject: `Enrollment Complete - ${childName} is ready for ${classTitle}!`,
          html: guestParentEmail,
        }),
        sendEmail({
          to: guestBooking.purchaser_email,
          subject: `Guest Enrollment Complete - ${childName} is ready for ${classTitle}!`,
          html: purchaserEmail,
        }),
      ])

      console.log('Form completion confirmation emails sent')
    } catch (emailError) {
      console.error('Error sending form completion emails:', emailError)
      // Don't fail the form submission if emails fail
    }

    return NextResponse.json({
      success: true,
      guest_child_id: guestChild.id,
    })
  } catch (error) {
    console.error('Guest booking complete-form error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
