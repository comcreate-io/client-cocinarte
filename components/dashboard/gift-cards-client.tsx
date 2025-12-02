"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Mail, Copy, CheckCircle2, Gift, User, DollarSign } from 'lucide-react'
import { GiftCardsClientService } from '@/lib/supabase/gift-cards-client'

interface GiftCard {
  id: string
  code: string
  initial_balance: number
  current_balance: number
  is_active: boolean
  purchaser_email: string
  purchaser_name: string
  recipient_email: string
  recipient_name: string
  message?: string
  redeemed_by_parent_id?: string
  redeemed_at?: string
  sent_at?: string
  expires_at?: string
  created_at: string
}

interface GiftCardsClientProps {
  initialGiftCards: GiftCard[]
  userEmail: string
}

export function GiftCardsClient({ initialGiftCards, userEmail }: GiftCardsClientProps) {
  const [giftCards, setGiftCards] = useState<GiftCard[]>(initialGiftCards)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false)
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all')

  // Create form state
  const [amount, setAmount] = useState<number>(50)
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [purchaserName, setPurchaserName] = useState('Cocinarte Admin')
  const [purchaserEmail, setPurchaserEmail] = useState(userEmail)
  const [message, setMessage] = useState('')
  const [sendEmail, setSendEmail] = useState(true)

  const giftCardsService = new GiftCardsClientService()

  const handleCreateGiftCard = async () => {
    if (amount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      // Create the gift card
      const newGiftCard = await giftCardsService.createGiftCard({
        initial_balance: amount,
        purchaser_email: purchaserEmail,
        purchaser_name: purchaserName,
        recipient_email: recipientEmail || purchaserEmail,
        recipient_name: recipientName || purchaserName,
        message: message || undefined
      })

      // Send email if requested and recipient email is provided
      if (sendEmail && recipientEmail) {
        try {
          const response = await fetch('/api/gift-cards/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              giftCardId: newGiftCard.id,
              recipientEmail,
              recipientName,
              purchaserName,
              message
            })
          })
          if (response.ok) {
            await giftCardsService.markGiftCardAsSent(newGiftCard.id)
            newGiftCard.sent_at = new Date().toISOString()
          }
        } catch (emailError) {
          console.error('Failed to send gift card email:', emailError)
        }
      }

      setGiftCards([newGiftCard, ...giftCards])
      setIsCreateDialogOpen(false)
      resetCreateForm()
      setSuccessMessage(`Gift card ${newGiftCard.code} created successfully!`)
    } catch (err: any) {
      setError(err.message || 'Failed to create gift card')
    } finally {
      setLoading(false)
    }
  }

  const resetCreateForm = () => {
    setAmount(50)
    setRecipientName('')
    setRecipientEmail('')
    setPurchaserName('Cocinarte Admin')
    setPurchaserEmail(userEmail)
    setMessage('')
    setSendEmail(true)
  }

  const handleResendEmail = async (giftCard: GiftCard) => {
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/gift-cards/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftCardId: giftCard.id,
          recipientEmail: giftCard.recipient_email,
          recipientName: giftCard.recipient_name,
          purchaserName: giftCard.purchaser_name,
          message: giftCard.message
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      await giftCardsService.markGiftCardAsSent(giftCard.id)

      setGiftCards(giftCards.map(gc =>
        gc.id === giftCard.id
          ? { ...gc, sent_at: new Date().toISOString() }
          : gc
      ))

      setSuccessMessage(`Gift card email sent to ${giftCard.recipient_email}!`)
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }


  const filteredGiftCards = giftCards.filter(gc => {
    switch (filter) {
      case 'active':
        return gc.is_active && gc.current_balance > 0
      case 'used':
        return gc.current_balance === 0 || !gc.is_active
      case 'expired':
        return gc.expires_at && new Date(gc.expires_at) < new Date()
      default:
        return true
    }
  })

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Gift Card
        </Button>

        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gift Cards</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="used">Used / Empty</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gift Cards Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Redeemed By</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGiftCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No gift cards found. Create your first gift card!
                </TableCell>
              </TableRow>
            ) : (
              filteredGiftCards.map((giftCard) => (
                <TableRow key={giftCard.id}>
                  <TableCell className="font-mono font-bold">
                    <div className="flex items-center gap-2">
                      {giftCard.code}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(giftCard.code)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedCode === giftCard.code ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <DollarSign className="h-3 w-3" />
                      {giftCard.initial_balance.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={giftCard.current_balance > 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                      ${giftCard.current_balance.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {giftCard.current_balance === 0 ? (
                      <Badge variant="secondary">Empty</Badge>
                    ) : giftCard.is_active ? (
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{giftCard.recipient_name}</div>
                      <div className="text-xs text-muted-foreground">{giftCard.recipient_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {giftCard.redeemed_by_parent_id ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <User className="h-3 w-3" />
                          Redeemed
                        </div>
                        {giftCard.redeemed_at && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(giftCard.redeemed_at).toLocaleDateString('en-US')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not redeemed</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(giftCard.created_at).toLocaleDateString('en-US')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendEmail(giftCard)}
                        disabled={loading || !giftCard.recipient_email}
                        title={giftCard.sent_at ? 'Resend email' : 'Send email'}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {giftCard.sent_at ? 'Resend' : 'Send'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Gift Card Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Create Gift Card
            </DialogTitle>
            <DialogDescription>
              Create a new gift card. Admin-created cards are free (no payment required).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="amount">Gift Card Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="50.00"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Recipient Information</h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enjoy your cooking classes!"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <Label htmlFor="sendEmail" className="text-sm font-normal cursor-pointer">
                Send gift card email to recipient
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetCreateForm()
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGiftCard}
              disabled={loading || amount <= 0}
            >
              {loading ? 'Creating...' : 'Create Gift Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
