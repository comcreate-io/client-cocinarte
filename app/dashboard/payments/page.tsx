import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, CreditCard, TrendingUp, RefreshCw } from 'lucide-react'
import StripePaymentsClient from '@/components/dashboard/stripe-payments-client'
import { isAdminUser } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export default async function PaymentsPage() {
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

  // Fetch payments from Stripe
  let totalRevenue = 0
  let pendingAmount = 0
  let paidThisMonth = 0
  let averageFee = 0
  let paymentCount = 0

  try {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    })

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const succeeded = paymentIntents.data.filter(pi => pi.status === 'succeeded')
    const pending = paymentIntents.data.filter(pi => pi.status === 'processing' || pi.status === 'requires_payment_method')

    totalRevenue = succeeded.reduce((sum, pi) => sum + (pi.amount_received / 100), 0)
    pendingAmount = pending.reduce((sum, pi) => sum + (pi.amount / 100), 0)
    
    const thisMonth = succeeded.filter(pi => {
      const date = new Date(pi.created * 1000)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    
    paidThisMonth = thisMonth.reduce((sum, pi) => sum + (pi.amount_received / 100), 0)
    
    paymentCount = succeeded.length
    averageFee = paymentCount > 0 ? totalRevenue / paymentCount : 0
  } catch (error) {
    console.error('Error fetching Stripe stats:', error)
  }

  const currency = (value: number) => `$${value.toFixed(2)}`

  return (
    <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Stripe Payments</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage all payments, issue refunds, and track transactions from Stripe.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>Data from Stripe</span>
          </div>
        </div>

        {/* Payment Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{currency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                All successful payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{currency(pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Processing or incomplete
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{currency(paidThisMonth)}</div>
              <p className="text-xs text-muted-foreground">
                Revenue this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Average Transaction</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{currency(averageFee)}</div>
              <p className="text-xs text-muted-foreground">
                {paymentCount} total payments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stripe Payments List with Refund Capability */}
        <StripePaymentsClient />
      </div>
  )
}
