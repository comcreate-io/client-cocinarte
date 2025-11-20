import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { PartyRequestsClient } from '@/components/dashboard/party-requests-client'
import { isAdminUser } from '@/lib/supabase/admin'

export default async function PartyRequestsPage() {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Party Requests</h1>
          <p className="text-muted-foreground">
            Manage birthday party requests and send approval/decline emails to customers.
          </p>
        </div>

        <PartyRequestsClient />
      </div>
    </DashboardLayout>
  )
}
