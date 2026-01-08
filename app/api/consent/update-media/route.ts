import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { child_id, social_media_consent } = body

    if (!child_id) {
      return NextResponse.json(
        { success: false, error: 'Child ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update the existing consent form's social_media_consent field
    const { data: consent, error } = await supabase
      .from('consent_forms')
      .update({ social_media_consent: social_media_consent ?? false })
      .eq('child_id', child_id)
      .is('revoked_at', null)
      .select()
      .single()

    if (error) {
      console.error('Database error updating media consent:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update media consent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      consent_form: consent,
    })
  } catch (error) {
    console.error('Update media consent error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update media consent' },
      { status: 500 }
    )
  }
}
