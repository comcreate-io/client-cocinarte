"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Plus, Mail, Trash2, Copy, CheckCircle2, Percent, BookOpen, DollarSign, Calendar, Hash, StickyNote } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CouponsClientService } from '@/lib/supabase/coupons-client'
import { Coupon, DiscountType } from '@/lib/types/coupons'

interface ClassOption {
  id: string
  title: string
  date: string
  time: string
  price: number
}

interface CouponsClientProps {
  initialCoupons: Coupon[]
  userEmail: string
  availableClasses: ClassOption[]
}

export function CouponsClient({ initialCoupons, userEmail, availableClasses }: CouponsClientProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Create form state
  const [discountType, setDiscountType] = useState<DiscountType>('percentage')
  const [discountPercentage, setDiscountPercentage] = useState<number>(10)
  const [discountAmount, setDiscountAmount] = useState<number>(5)
  const [selectedClassId, setSelectedClassId] = useState<string>('universal')
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [maxUses, setMaxUses] = useState<number>(1)
  const [note, setNote] = useState<string>('')
  const [customCode, setCustomCode] = useState<string>('')

  // Send email form state
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')

  const couponsService = new CouponsClientService()

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === 'fixed' && coupon.discount_amount != null) {
      return `$${coupon.discount_amount} OFF`
    }
    return `${coupon.discount_percentage}% OFF`
  }

  const getDiscountIcon = (coupon: Coupon) => {
    return coupon.discount_type === 'fixed' ? DollarSign : Percent
  }

  const getCouponStatus = (coupon: Coupon) => {
    if (coupon.use_count >= coupon.max_uses) return 'used'
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return 'expired'
    return 'available'
  }

  const handleCreateCoupon = async () => {
    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const newCoupon = await couponsService.createCoupon({
        discount_type: discountType,
        discount_percentage: discountType === 'percentage' ? discountPercentage : undefined,
        discount_amount: discountType === 'fixed' ? discountAmount : undefined,
        class_id: selectedClassId === 'universal' ? undefined : selectedClassId,
        created_by: userEmail,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        max_uses: maxUses,
        note: note.trim() || null,
        custom_code: customCode.trim() || undefined,
      })

      setCoupons([newCoupon, ...coupons])
      setIsCreateDialogOpen(false)
      setDiscountType('percentage')
      setDiscountPercentage(10)
      setDiscountAmount(5)
      setSelectedClassId('universal')
      setExpiresAt('')
      setMaxUses(1)
      setNote('')
      setCustomCode('')
      setSuccessMessage(`Coupon ${newCoupon.code} created successfully!`)
    } catch (err: any) {
      setError(err.message || 'Failed to create coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedCoupon || !recipientEmail) return

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      // Get class details if coupon is class-specific
      let classDetails = undefined
      if (selectedCoupon.class_id) {
        const classInfo = availableClasses.find(c => c.id === selectedCoupon.class_id)
        if (classInfo) {
          classDetails = {
            title: classInfo.title,
            date: classInfo.date,
            time: classInfo.time,
            price: classInfo.price
          }
        }
      }

      const response = await fetch('/api/send-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponCode: selectedCoupon.code,
          discountType: selectedCoupon.discount_type,
          discountPercentage: selectedCoupon.discount_percentage,
          discountAmount: selectedCoupon.discount_amount,
          recipientEmail,
          recipientName: recipientName || undefined,
          classDetails,
          expiresAt: selectedCoupon.expires_at,
          maxUses: selectedCoupon.max_uses,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to send email')
      }

      // Mark coupon as sent
      await couponsService.markCouponAsSent(selectedCoupon.id, recipientEmail)

      // Update local state
      setCoupons(coupons.map(c =>
        c.id === selectedCoupon.id
          ? { ...c, recipient_email: recipientEmail, sent_at: new Date().toISOString() }
          : c
      ))

      setIsSendEmailDialogOpen(false)
      setRecipientEmail('')
      setRecipientName('')
      setSelectedCoupon(null)
      setSuccessMessage(`Coupon sent to ${recipientEmail} successfully!`)
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    setLoading(true)
    setError('')

    try {
      await couponsService.deleteCoupon(couponId)
      setCoupons(coupons.filter(c => c.id !== couponId))
      setSuccessMessage('Coupon deleted successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to delete coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const openSendEmailDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setIsSendEmailDialogOpen(true)
  }

  const isCreateDisabled = () => {
    if (loading) return true
    if (discountType === 'percentage' && (discountPercentage < 1 || discountPercentage > 100)) return true
    if (discountType === 'fixed' && discountAmount <= 0) return true
    if (maxUses < 1) return true
    return false
  }

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
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Coupon
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Valid For</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Sent To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  No coupons created yet. Create your first coupon!
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => {
                const status = getCouponStatus(coupon)
                const DiscountIcon = getDiscountIcon(coupon)
                return (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-bold">
                      <div className="flex items-center gap-2">
                        {coupon.code}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(coupon.code)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedCode === coupon.code ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        <DiscountIcon className="h-3 w-3" />
                        {getDiscountDisplay(coupon)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.class_id ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">
                              {availableClasses.find(c => c.id === coupon.class_id)?.title || 'Specific Class'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {availableClasses.find(c => c.id === coupon.class_id)?.date &&
                              new Date(availableClasses.find(c => c.id === coupon.class_id)!.date).toLocaleDateString()
                            }
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">All Classes</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{coupon.use_count}</span>
                        <span className="text-muted-foreground"> / {coupon.max_uses}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {coupon.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(coupon.expires_at).toLocaleDateString()}
                        </div>
                      ) : (
                        <span>No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        status === 'used' ? "destructive" :
                        status === 'expired' ? "outline" :
                        "default"
                      }>
                        {status === 'used' ? 'Fully Used' :
                         status === 'expired' ? 'Expired' :
                         'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={coupon.note || ''}>
                      {coupon.note ? (
                        <div className="flex items-center gap-1">
                          <StickyNote className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{coupon.note}</span>
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {coupon.recipient_email ? (
                        <div className="text-sm">
                          <div>{coupon.recipient_email}</div>
                          <div className="text-xs text-muted-foreground">
                            {coupon.sent_at && new Date(coupon.sent_at).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not sent</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(coupon.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSendEmailDialog(coupon)}
                          disabled={status !== 'available' || loading}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Send
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Coupon Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>
              Create a new discount coupon with a custom or randomly generated code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto pr-1">
            {/* Custom Code & Class - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custom-code">Coupon Code (Optional)</Label>
                <Input
                  id="custom-code"
                  placeholder="e.g. REVIEW10"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  maxLength={20}
                  className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to auto-generate
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="class-select">Valid for Class (Optional)</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="universal">All classes</SelectItem>
                    {availableClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3 w-3" />
                          <span>{cls.title}</span>
                          <span className="text-xs text-muted-foreground">
                            ({new Date(cls.date).toLocaleDateString()})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave blank for all classes
                </p>
              </div>
            </div>

            {/* Discount Type & Value - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={discountType} onValueChange={(val) => setDiscountType(val as DiscountType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-3 w-3" />
                        <span>Percentage (%)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3" />
                        <span>Fixed Amount ($)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {discountType === 'percentage' ? (
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount Value</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="discount"
                      type="number"
                      min="1"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="discount-amount">Discount Value</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="discount-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Expiration & Max Uses - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expires-at">Expiration Date (Optional)</Label>
                <Input
                  id="expires-at"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank for no expiry
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-uses">Maximum Uses</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="max-uses"
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                  />
                  <span className="text-sm text-muted-foreground">times</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  1 = single-use
                </p>
              </div>
            </div>

            {/* Admin Note - full width */}
            <div className="space-y-2">
              <Label htmlFor="note">Admin Note (Optional)</Label>
              <Input
                id="note"
                placeholder="e.g. Post dumpling class coupon code"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Internal note to track why this coupon was created
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCoupon}
              disabled={isCreateDisabled()}
            >
              {loading ? 'Creating...' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={isSendEmailDialogOpen} onOpenChange={setIsSendEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Coupon via Email</DialogTitle>
            <DialogDescription>
              Send coupon {selectedCoupon?.code} ({selectedCoupon && getDiscountDisplay(selectedCoupon)}) to a recipient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-name">Recipient Name (Optional)</Label>
              <Input
                id="recipient-name"
                placeholder="John Doe"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Recipient Email *</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="recipient@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSendEmailDialogOpen(false)
                setRecipientEmail('')
                setRecipientName('')
                setSelectedCoupon(null)
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={loading || !recipientEmail}
            >
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
