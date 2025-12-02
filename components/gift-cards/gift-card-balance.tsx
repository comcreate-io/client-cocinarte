'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Gift, Plus, CheckCircle, Loader2 } from 'lucide-react'

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
  initialBalance?: number
  onBalanceChange?: (balance: number) => void
}

export default function GiftCardBalance({ parentId, initialBalance, onBalanceChange }: GiftCardBalanceProps) {
  const [giftCards, setGiftCards] = useState<GiftCardData[]>([])
  const [totalBalance, setTotalBalance] = useState(initialBalance ?? 0)
  const [loading, setLoading] = useState(initialBalance === undefined)
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemError, setRedeemError] = useState('')
  const [redeemSuccess, setRedeemSuccess] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // Only fetch if no initial balance was provided
    if (initialBalance === undefined) {
      loadGiftCards()
    }
  }, [parentId, initialBalance])

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

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-sm text-blue-600">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-semibold text-blue-700">Gift Card Balance</span>
        <p className={`font-medium ${totalBalance > 0 ? 'text-green-600' : 'text-blue-900'}`}>
          ${totalBalance.toFixed(2)}
          {totalBalance > 0 && giftCards.length > 0 && (
            <span className="text-sm text-blue-600 ml-2">
              ({giftCards.filter(gc => gc.current_balance > 0).length} card{giftCards.filter(gc => gc.current_balance > 0).length !== 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-sm border-blue-300 hover:bg-blue-50">
            <Plus className="h-4 w-4 mr-1" />
            Add Code
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
  )
}
