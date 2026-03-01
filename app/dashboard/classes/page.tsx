import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClasesService } from '@/lib/supabase/clases'
import { Clase } from '@/lib/types/clases'
import { ClassesClient } from '@/components/dashboard/classes-client'
import { isAdminUser } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

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

  // Fetch all classes from the database (upcoming + past for archive)
  const clasesService = new ClasesService()
  let clases: Clase[] = []

  try {
    clases = await clasesService.getAllClases()
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
