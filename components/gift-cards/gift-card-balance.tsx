'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Gift, Plus, CreditCard, CheckCircle, Loader2, Clock, DollarSign } from 'lucide-react'

interface GiftCardData {
  id: string
  code: string
  initial_balance: number
  current_balance: number
  is_active: boolean
  created_at: string
  expires_at?: string
  purchaser_name: string
}

interface GiftCardBalanceProps {
  parentId: string
  onBalanceChange?: (balance: number) => void
}

export default function GiftCardBalance({ parentId, onBalanceChange }: GiftCardBalanceProps) {
  const [giftCards, setGiftCards] = useState<GiftCardData[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemError, setRedeemError] = useState('')
  const [redeemSuccess, setRedeemSuccess] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadGiftCards()
  }, [parentId])

  const loadGiftCards = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gift-cards/balance?parentId=${parentId}`)
      const data = await response.json()

      if (response.ok) {
        setGiftCards(data.giftCards)
        setTotalBalance(data.totalBalance)
        onBalanceChange?.(data.totalBalance)
      }
    } catch (error) {
      console.error('Error loading gift cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      setRedeemError('Please enter a gift card code')
      return
    }

    setRedeemLoading(true)
    setRedeemError('')
    setRedeemSuccess('')

    try {
      const response = await fetch('/api/gift-cards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: redeemCode.trim().toUpperCase(),
          parentId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to redeem gift card')
      }

      setRedeemSuccess(`Gift card added! Balance: $${data.giftCard.current_balance.toFixed(2)}`)
      setRedeemCode('')
      await loadGiftCards()

      setTimeout(() => {
        setIsDialogOpen(false)
        setRedeemSuccess('')
      }, 2000)
    } catch (err: any) {
      setRedeemError(err.message || 'Failed to redeem gift card')
    } finally {
      setRedeemLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const activeCards = giftCards.filter(gc => gc.is_active && gc.current_balance > 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Gift className="h-5 w-5 text-cocinarte-orange" />
              Gift Card Balance
            </CardTitle>
            <CardDescription className="text-sm">
              Manage your gift cards and view your balance
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cocinarte-orange hover:bg-cocinarte-orange/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Gift Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Redeem Gift Card</DialogTitle>
                <DialogDescription>
                  Enter your gift card code to add it to your account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {redeemError && (
                  <Alert variant="destructive">
                    <AlertDescription>{redeemError}</AlertDescription>
                  </Alert>
                )}
                {redeemSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">{redeemSuccess}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="giftCardCode">Gift Card Code</Label>
                  <Input
                    id="giftCardCode"
                    placeholder="GC-XXXXXXXX"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    className="font-mono text-center text-lg"
                  />
                </div>
                <Button
                  className="w-full bg-cocinarte-orange hover:bg-cocinarte-orange/90"
                  onClick={handleRedeem}
                  disabled={redeemLoading}
                >
                  {redeemLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redeeming...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Redeem Gift Card
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-cocinarte-orange" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Total Balance Display */}
            <div className="bg-gradient-to-r from-cocinarte-orange/10 to-cocinarte-yellow/10 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600 mb-1">Available Balance</p>
              <p className="text-4xl font-bold text-cocinarte-orange">
                ${totalBalance.toFixed(2)}
              </p>
              {activeCards.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  From {activeCards.length} gift card{activeCards.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Gift Cards List */}
            {giftCards.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Your Gift Cards</h4>
                <div className="space-y-3">
                  {giftCards.map((card) => (
                    <div
                      key={card.id}
                      className={`border rounded-lg p-4 ${
                        card.is_active && card.current_balance > 0
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-semibold">{card.code}</span>
                            {card.is_active && card.current_balance > 0 ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Used</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            From: {card.purchaser_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Added: {formatDate(card.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            card.current_balance > 0 ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            ${card.current_balance.toFixed(2)}
                          </p>
                          {card.initial_balance !== card.current_balance && (
                            <p className="text-xs text-gray-400">
                              of ${card.initial_balance.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      {card.expires_at && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          Expires: {formatDate(card.expires_at)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No gift cards added yet</p>
                <p className="text-xs mt-1">Click "Add Gift Card" to redeem a code</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
