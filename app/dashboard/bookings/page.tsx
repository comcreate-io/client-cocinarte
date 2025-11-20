import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookingsTable } from '@/components/dashboard/bookings-table'
import { BookingsStats } from '@/components/dashboard/bookings-stats'
import { Button } from '@/components/ui/button'
import { Plus, Download, Filter } from 'lucide-react'
import { isAdminUser } from '@/lib/supabase/admin'

export default async function BookingsPage() {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
          <p className="text-muted-foreground">
            Manage all your Cocinarte cooking class bookings and payments
          </p>
        </div>
      </div>

      {/* Dynamic Stats */}
      <BookingsStats userId={user.id} />

      {/* Bookings Table */}
      <BookingsTable userId={user.id} />
    </div>
  )
}
