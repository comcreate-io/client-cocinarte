import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { child_id } = body

    if (!child_id) {
      return NextResponse.json(
        { success: false, error: 'child_id is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Revoke any existing consent for this child
    const { error } = await supabase
      .from('consent_forms')
      .update({ revoked_at: new Date().toISOString() })
      .eq('child_id', child_id)
      .is('revoked_at', null)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to revoke consent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Consent revoked successfully',
    })
  } catch (error) {
    console.error('Consent revoke error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revoke consent' },
      { status: 500 }
    )
  }
}
