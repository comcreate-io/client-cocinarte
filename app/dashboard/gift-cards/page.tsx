import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GiftCardsClient } from '@/components/dashboard/gift-cards-client'
import { isAdminUser } from '@/lib/supabase/admin'
import { Gift, DollarSign, CreditCard, CheckCircle } from 'lucide-react'

export default async function GiftCardsPage() {
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

  const { data: giftCards, error } = await supabase
    .from('gift_cards')
    .select('*')
    .order('created_at', { ascending: false })

  const safeGiftCards = giftCards ?? []

  // Calculate stats
  const totalIssued = safeGiftCards.reduce((sum, gc) => sum + (gc.initial_balance || 0), 0)
  const totalRedeemed = safeGiftCards.reduce((sum, gc) => sum + ((gc.initial_balance || 0) - (gc.current_balance || 0)), 0)
  const totalRemaining = safeGiftCards.filter(gc => gc.is_active).reduce((sum, gc) => sum + (gc.current_balance || 0), 0)
  const activeCards = safeGiftCards.filter(gc => gc.is_active && gc.current_balance > 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
          <p className="text-muted-foreground">
            Create, manage, and track gift cards for Cocinarte.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalIssued.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {safeGiftCards.length} gift cards created
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRedeemed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Used for bookings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRemaining.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Available to use
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCards}</div>
            <p className="text-xs text-muted-foreground">
              With remaining balance
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gift Card Management</CardTitle>
          <CardDescription>
            Create new gift cards, send them via email, and track their usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GiftCardsClient
            initialGiftCards={safeGiftCards}
            userEmail={user.email || ''}
          />
        </CardContent>
      </Card>
    </div>
  )
}
