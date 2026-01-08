import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { createClient } from '@/lib/supabase/server'
import { CONSENT_FORM_VERSION } from '@/types/consent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      child_id,
      parent_id,
      social_media_consent,
      liability_consent,
      parent_name_signed,
      child_name_signed,
      signature_data_url,
    } = body

    // Validate required fields
    if (!child_id || !parent_id || !parent_name_signed || !child_name_signed || !signature_data_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Liability consent is required
    if (liability_consent !== true) {
      return NextResponse.json(
        { success: false, error: 'Liability consent is required' },
        { status: 400 }
      )
    }

    // Upload signature to Cloudinary
    let signatureResult
    try {
      signatureResult = await uploadToCloudinary(
        signature_data_url,
        'cocinarte-signatures'
      )
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError)
      return NextResponse.json(
        { success: false, error: 'Failed to upload signature to cloud storage' },
        { status: 500 }
      )
    }

    // Get client info for audit trail
    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const user_agent = request.headers.get('user-agent') || 'unknown'

    const supabase = await createClient()

    // Revoke any existing consent for this child
    await supabase
      .from('consent_forms')
      .update({ revoked_at: new Date().toISOString() })
      .eq('child_id', child_id)
      .is('revoked_at', null)

    // Create new consent form
    const { data: consent, error } = await supabase
      .from('consent_forms')
      .insert([{
        child_id,
        parent_id,
        social_media_consent: social_media_consent ?? false,
        liability_consent: true,
        parent_name_signed,
        child_name_signed,
        signature_url: signatureResult.secure_url,
        signature_public_id: signatureResult.public_id,
        form_version: CONSENT_FORM_VERSION,
        ip_address,
        user_agent,
        signed_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error inserting consent form:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save consent form' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      consent_form: consent,
    })
  } catch (error) {
    console.error('Consent sign error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process consent form' },
      { status: 500 }
    )
  }
}
