import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClasesService } from '@/lib/supabase/clases'
import { Clase } from '@/lib/types/clases'
import { ClassesClient } from '@/components/dashboard/classes-client'
import { isAdminUser } from '@/lib/supabase/admin'

export default async function ClassesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is an admin
  const isAdmin = await isAdminUser(supabase, user.email)

  if (!isAdmin) {
    redirect('/?error=admin_only')
  }

  // Fetch classes from the database
  const clasesService = new ClasesService()
  let clases: Clase[] = []

  try {
    clases = await clasesService.getAllClases()
    console.log('=== Classes fetched from database ===')
    console.log('Total classes:', clases.length)
    console.log('All classes data:', JSON.stringify(clases, null, 2))
    console.log('=====================================')
  } catch (error) {
    console.error('Error fetching classes:', error)
    // If table doesn't exist yet, show empty state
  }

  return (
    <div className="space-y-6">
      <ClassesClient initialClases={clases} />
    </div>
  )
}
