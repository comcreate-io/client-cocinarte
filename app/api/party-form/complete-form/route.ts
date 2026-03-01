import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { uploadToCloudinary } from '@/lib/cloudinary'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { form_token, form_data } = body

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

    // Fetch the party guest
    const { data: partyGuest, error: pgError } = await supabase
      .from('party_guests')
      .select('*')
      .eq('form_token', form_token)
      .single()

    if (pgError || !partyGuest) {
      return NextResponse.json(
        { success: false, error: 'Invalid form token' },
        { status: 404 }
      )
    }

    if (partyGuest.form_completed_at) {
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
      guest_parent_email: partyGuest.parent_email,
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

    // Update party guest with completion info
    const { error: updateError } = await supabase
      .from('party_guests')
      .update({
        form_completed_at: new Date().toISOString(),
        guest_child_id: guestChild.id,
      })
      .eq('id', partyGuest.id)

    if (updateError) {
      console.error('Error updating party guest:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update guest record' },
        { status: 500 }
      )
    }

    // Send confirmation emails
    try {
      // Fetch party request for details
      const { data: partyRequest } = await supabase
        .from('party_requests')
        .select('parent_name, email, preferred_date, package, child_name_age')
        .eq('id', partyGuest.party_request_id)
        .single()

      const packageNames: { [key: string]: string } = {
        'art-canvas': 'Art: Canvas Painting',
        'diy-party': 'DIY Party',
        'mini-fiesta': 'Mini Fiesta',
        'deluxe-fiesta': 'Deluxe Fiesta',
        'premium-fiesta': 'Premium Fiesta',
        'vip-package': 'VIP Package',
      }
      const packageDisplayName = partyRequest ? (packageNames[partyRequest.package] || partyRequest.package) : 'Birthday Party'

      const formattedDate = partyRequest?.preferred_date
        ? new Date(partyRequest.preferred_date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })
        : 'TBD'

      const childName = form_data.child_full_name

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      // Health summary
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

      // Build dashboard URL for host notification
      let dashboardUrl = ''
      if (partyRequest) {
        const { data: prDash } = await supabase
          .from('party_requests')
          .select('dashboard_token')
          .eq('id', partyGuest.party_request_id)
          .single()
        if (prDash?.dashboard_token) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cocinartepdx.com'
          dashboardUrl = `${baseUrl}/party-dashboard/${prDash.dashboard_token}`
        }
      }

      // 1. Email to guest parent — confirmation
      const guestParentEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #F9FAFB;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: #F0614F; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <img src="https://www.cocinartepdx.com/cocinarte/cocinarteLogo.png" alt="Cocinarte" style="height: 50px; margin: 0 auto 15px auto; display: block;" />
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">✅ Enrollment Complete!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">${childName} is all set for the party 🎉</p>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 30px 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${form_data.guest_parent_name},
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Thank you for completing the enrollment form for <strong>${childName}</strong>. Everything is ready for the birthday party!
              </p>

              <!-- Party Details -->
              <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00ADEE;">
                <h3 style="color: #00ADEE; margin: 0 0 12px 0; font-size: 17px;">🎂 Party Details</h3>
                <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Date:</strong> ${formattedDate}</p>
                <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Package:</strong> ${packageDisplayName}</p>
                ${partyRequest?.child_name_age ? `<p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Birthday Child:</strong> ${partyRequest.child_name_age}</p>` : ''}
                <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong style="color: #1E3A8A;">Hosted by:</strong> ${partyRequest?.parent_name || 'Party Host'}</p>
              </div>

              <!-- Child Info Submitted -->
              <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16A34A;">
                <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">👨‍🍳 Child Information Submitted</h3>
                <p style="margin: 6px 0; color: #374151; font-size: 14px;"><strong>Child:</strong> ${childName}${form_data.child_preferred_name ? ` (${form_data.child_preferred_name})` : ''}, Age ${form_data.child_age}</p>
                <p style="margin: 6px 0; color: #374151; font-size: 14px;"><strong>Liability Consent:</strong> ✅ Signed</p>
                <p style="margin: 6px 0; color: #374151; font-size: 14px;"><strong>Media Permission:</strong> ${form_data.media_permission ? '✅ Granted' : '❌ Not granted'}</p>
              </div>

              ${healthSection}

              <!-- Reminders -->
              <div style="background: #FCB414; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: white; margin: 0 0 12px 0; font-size: 16px;">📋 Reminders for Party Day</h4>
                <ul style="color: white; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                  <li>Please arrive 10 minutes before the party starts</li>
                  <li>Wear comfortable clothes that can get a little messy</li>
                  <li>Bring a water bottle for your little chef</li>
                </ul>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; padding: 20px; background: #F0F9FF; border-radius: 8px; border: 1px solid #BFDBFE;">
                <p style="color: #1E3A8A; margin: 0 0 8px 0; font-size: 15px; font-weight: bold;">Questions? We're here to help!</p>
                <p style="color: #374151; margin: 0; font-size: 14px;">
                  📧 <a href="mailto:info@cocinartepdx.com" style="color: #F0614F; text-decoration: none; font-weight: bold;">info@cocinartepdx.com</a>
                  <br>
                  📞 <a href="tel:+15039169758" style="color: #F0614F; text-decoration: none; font-weight: bold;">+1 (503) 916-9758</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      // 2. Email to party host — notification that a guest completed their form
      const hostEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; background-color: #F9FAFB;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: #00ADEE; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <img src="https://www.cocinartepdx.com/cocinarte/cocinarteLogo.png" alt="Cocinarte" style="height: 50px; margin: 0 auto 15px auto; display: block;" />
              <h1 style="margin: 0; font-size: 26px; font-weight: bold;">✅ Guest Enrollment Complete!</h1>
              <p style="margin: 10px 0 0 0; font-size: 15px; opacity: 0.95;">${childName} is ready for the party</p>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 30px 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${partyRequest?.parent_name || 'there'},
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Great news! <strong>${partyGuest.parent_name}</strong> has completed the enrollment form for <strong>${childName}</strong>. They're all set for the birthday party!
              </p>

              <!-- Success Box -->
              <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16A34A;">
                <p style="color: #166534; margin: 0; font-size: 15px;">
                  ✅ <strong>${partyGuest.parent_name}</strong> has submitted all required information and signed the consent forms for <strong>${childName}</strong>.
                </p>
              </div>

              <!-- Dashboard CTA -->
              ${dashboardUrl ? `
              <div style="background: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00ADEE;">
                <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0;">
                  Check the status of all guest enrollments on your party dashboard.
                </p>
                <div style="text-align: center;">
                  <a href="${dashboardUrl}" style="background: #F0614F; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: bold; display: inline-block;">
                    Open Party Dashboard
                  </a>
                </div>
              </div>
              ` : `
              <p style="color: #374151; font-size: 14px; margin-top: 20px;">
                You can check the status of all guest enrollments on your party dashboard.
              </p>
              `}

              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; padding: 20px; background: #F0F9FF; border-radius: 8px; border: 1px solid #BFDBFE;">
                <p style="color: #1E3A8A; margin: 0 0 8px 0; font-size: 15px; font-weight: bold;">Questions? We're here to help!</p>
                <p style="color: #374151; margin: 0; font-size: 14px;">
                  📧 <a href="mailto:info@cocinartepdx.com" style="color: #F0614F; text-decoration: none; font-weight: bold;">info@cocinartepdx.com</a>
                  <br>
                  📞 <a href="tel:+15039169758" style="color: #F0614F; text-decoration: none; font-weight: bold;">+1 (503) 916-9758</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `

      const emailPromises = [
        transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: partyGuest.parent_email,
          subject: `Enrollment Complete - ${childName} is ready for the party!`,
          html: guestParentEmailHtml,
        }),
      ]

      if (partyRequest?.email) {
        emailPromises.push(
          transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: partyRequest.email,
            subject: `Guest Enrollment Complete - ${childName} is ready for the party!`,
            html: hostEmailHtml,
          })
        )
      }

      await Promise.all(emailPromises)
      console.log('Party form completion emails sent')
    } catch (emailError) {
      console.error('Error sending party form completion emails:', emailError)
      // Don't fail the form submission if emails fail
    }

    return NextResponse.json({
      success: true,
      guest_child_id: guestChild.id,
    })
  } catch (error) {
    console.error('Party form complete-form error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
