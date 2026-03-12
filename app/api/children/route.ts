import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/supabase/admin'

export async function GET() {
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

    // Fetch all children with parent information
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select(`
        *,
        parent:parents!inner (
          id,
          parent_guardian_names,
          parent_email,
          parent_phone
        )
      `)
      .order('child_full_name', { ascending: true })

    if (childrenError) {
      console.error('Error fetching children:', childrenError)
      return NextResponse.json(
        { error: 'Failed to fetch children' },
        { status: 500 }
      )
    }

    return NextResponse.json({ children })
  } catch (error) {
    console.error('Unexpected error in GET /api/children:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
