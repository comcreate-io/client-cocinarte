import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookingsClient } from '@/components/dashboard/bookings-client'
import { DashboardStatsFallback } from '@/components/dashboard/dashboard-stats-fallback'
import { RecentActivityFallback } from '@/components/dashboard/recent-activity-fallback'
import { NavigationCardsFallback } from '@/components/dashboard/navigation-cards-fallback'
import { isAdminUser } from '@/lib/supabase/admin'

export default async function DashboardPage() {
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
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Cocinarte Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back! Here's a summary of your Cocinarte cooking programs.
          </p>
        </div>
      </div>

      {/* Dynamic Summary Stats */}
      <DashboardStatsFallback userId={user.id} />

      {/* Quick Navigation */}
      <NavigationCardsFallback userId={user.id} />

      {/* Recent Bookings */}
      <BookingsClient userId={user.id} />

      {/* Recent Activity */}
      <RecentActivityFallback userId={user.id} />
    </div>
  )
}
