import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CouponsClient } from '@/components/dashboard/coupons-client'
import { isAdminUser } from '@/lib/supabase/admin'
import { Ticket } from 'lucide-react'

export default async function CouponsPage() {
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

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: classes } = await supabase
    .from('clases')
    .select('id, title, date, time, price')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })

  const safeCoupons = coupons ?? []
  const safeClasses = classes ?? []
  const totalCoupons = safeCoupons.length
  const usedCoupons = safeCoupons.filter((c: any) => c.use_count >= (c.max_uses || 1)).length
  const expiredCoupons = safeCoupons.filter((c: any) => c.expires_at && new Date(c.expires_at) < new Date() && c.use_count < (c.max_uses || 1)).length
  const availableCoupons = totalCoupons - usedCoupons - expiredCoupons
  const sentCoupons = safeCoupons.filter((c: any) => c.sent_at !== null).length

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discount Coupons</h1>
            <p className="text-muted-foreground">
              Create and manage discount coupons for Cocinarte classes.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Used</CardTitle>
              <Ticket className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usedCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Ticket className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <Ticket className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiredCoupons}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent via Email</CardTitle>
              <Ticket className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sentCoupons}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coupon Management</CardTitle>
            <CardDescription>
              Create new coupons, send them via email, and track their usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CouponsClient
              initialCoupons={safeCoupons}
              userEmail={user.email || ''}
              availableClasses={safeClasses}
            />
          </CardContent>
        </Card>

      </div>
  )
}
