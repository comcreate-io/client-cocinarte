"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DollarSign, RefreshCw, CreditCard, AlertCircle, CheckCircle, Clock, XCircle, Receipt, Copy, ExternalLink, Ban, Grid3X3, List } from 'lucide-react'
import { StripePaymentDetails } from '@/lib/types/stripe-payments'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function StripePaymentsClient() {
  const [payments, setPayments] = useState<StripePaymentDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<StripePaymentDetails | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isRefundOpen, setIsRefundOpen] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState<'duplicate' | 'fraudulent' | 'requested_by_customer'>('requested_by_customer')
  const [isRefunding, setIsRefunding] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const { toast } = useToast()

  const fetchPayments = async () => {
    try {
      let allPayments: StripePaymentDetails[] = []
      let hasMore = true
      let startingAfter: string | undefined = undefined

      // Fetch all payments by paginating
      while (hasMore) {
        const url = `/api/stripe/payments?limit=100${startingAfter ? `&starting_after=${startingAfter}` : ''}`
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch payments')
        const data = await response.json()

        allPayments = [...allPayments, ...(data.payments || [])]
        hasMore = data.hasMore

        if (hasMore && data.payments && data.payments.length > 0) {
          startingAfter = data.payments[data.payments.length - 1].id
        }
      }

      setPayments(allPayments)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast({
        title: "Error",
        description: "Failed to fetch payments from Stripe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPayments()
  }

  const handlePaymentClick = (payment: StripePaymentDetails) => {
    setSelectedPayment(payment)
    setIsDetailsOpen(true)
  }

  const handleRefundClick = (payment: StripePaymentDetails, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSelectedPayment(payment)
    setRefundAmount(((payment.amount - payment.amount_refunded) / 100).toFixed(2))
    setIsRefundOpen(true)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const openStripePayment = (paymentIntentId: string) => {
    window.open(`https://dashboard.stripe.com/payments/${paymentIntentId}`, '_blank')
  }

  const processRefund = async () => {
    if (!selectedPayment) return

    setIsRefunding(true)
    try {
      const amountInCents = Math.round(parseFloat(refundAmount) * 100)
      
      const response = await fetch('/api/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: selectedPayment.id,
          amount: amountInCents < selectedPayment.amount ? amountInCents : undefined,
          reason: refundReason,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Refund Processed",
          description: `Successfully refunded $${refundAmount}`,
        })
        setIsRefundOpen(false)
        fetchPayments() // Refresh the list
      } else {
        throw new Error(result.error || 'Refund failed')
      }
    } catch (error: any) {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      })
    } finally {
      setIsRefunding(false)
    }
  }

  const currency = (cents: number) => `$${(cents / 100).toFixed(2)}`

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing': return <Clock className="h-4 w-4 text-blue-600" />
      case 'requires_payment_method': return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'canceled': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded': return <Badge className="bg-green-100 text-green-800">Succeeded</Badge>
      case 'processing': return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'requires_payment_method': return <Badge variant="outline" className="text-orange-600">Requires Payment</Badge>
      case 'canceled': return <Badge variant="destructive">Canceled</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const canRefund = (payment: StripePaymentDetails) => {
    return payment.status === 'succeeded' && payment.amount_refunded < payment.amount
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading payments from Stripe...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Payment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Stripe Payment Intent: {selectedPayment?.id}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Amount Charged</Label>
                  <p className="text-xl font-bold text-green-600">{currency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                {selectedPayment.charges.length > 0 && selectedPayment.charges[0].fee > 0 && (
                  <>
                    <div>
                      <Label className="text-xs text-muted-foreground">Stripe Fee</Label>
                      <p className="text-sm font-medium text-orange-600">-{currency(selectedPayment.charges[0].fee)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Net Amount</Label>
                      <p className="text-sm font-bold text-green-600">{currency(selectedPayment.charges[0].net)}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Transaction Details */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Transaction Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Payment Intent ID</Label>
                    <p className="text-xs font-mono break-all">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Date & Time</Label>
                    <p className="text-xs">{new Date(selectedPayment.created * 1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Currency</Label>
                    <p className="text-xs uppercase">{selectedPayment.currency}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Capture Method</Label>
                    <p className="text-xs capitalize">
                      {selectedPayment.capture_method === 'automatic' ? 'Automatic' : 
                       selectedPayment.capture_method === 'manual' ? 'Manual' : 
                       selectedPayment.capture_method}
                    </p>
                  </div>
                  {selectedPayment.charges.length > 0 && selectedPayment.charges[0].receipt_number && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Receipt Number</Label>
                      <p className="text-xs">{selectedPayment.charges[0].receipt_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Class & Customer Info */}
              <div>
                <h3 className="font-semibold mb-3 text-sm">Booking Information</h3>
                <div className="space-y-2 text-sm">
                  {selectedPayment.description && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <p className="text-sm">{selectedPayment.description}</p>
                    </div>
                  )}
                  {selectedPayment.metadata.className && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Class Name</Label>
                      <p className="text-sm font-medium">{selectedPayment.metadata.className}</p>
                    </div>
                  )}
                  {selectedPayment.metadata.customerName && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Customer Name</Label>
                      <p className="text-sm">{selectedPayment.metadata.customerName}</p>
                    </div>
                  )}
                  {selectedPayment.customer_email && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm">{selectedPayment.customer_email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Details */}
              {selectedPayment.charges.length > 0 && selectedPayment.charges[0].payment_method_details && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Payment Method</h3>
                  {selectedPayment.charges[0].payment_method_details.card && (
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Card</Label>
                          <p className="text-sm capitalize font-medium">
                            {selectedPayment.charges[0].payment_method_details.card.brand} •••• {selectedPayment.charges[0].payment_method_details.card.last4}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Expiry</Label>
                          <p className="text-sm">
                            {selectedPayment.charges[0].payment_method_details.card.exp_month}/{selectedPayment.charges[0].payment_method_details.card.exp_year}
                          </p>
                        </div>
                        {selectedPayment.charges[0].payment_method_details.card.funding && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Type</Label>
                            <p className="text-sm capitalize">{selectedPayment.charges[0].payment_method_details.card.funding}</p>
                          </div>
                        )}
                        {selectedPayment.charges[0].payment_method_details.card.country && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Card Country</Label>
                            <p className="text-sm uppercase">{selectedPayment.charges[0].payment_method_details.card.country}</p>
                          </div>
                        )}
                        {selectedPayment.charges[0].payment_method_details.card.network && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Network</Label>
                            <p className="text-sm capitalize">{selectedPayment.charges[0].payment_method_details.card.network}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Billing Details */}
              {selectedPayment.charges.length > 0 && selectedPayment.charges[0].billing_details && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Billing Details</h3>
                  <div className="space-y-2 text-sm">
                    {selectedPayment.charges[0].billing_details.name && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <p className="text-sm">{selectedPayment.charges[0].billing_details.name}</p>
                      </div>
                    )}
                    {selectedPayment.charges[0].billing_details.email && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="text-sm">{selectedPayment.charges[0].billing_details.email}</p>
                      </div>
                    )}
                    {selectedPayment.charges[0].billing_details.phone && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p className="text-sm">{selectedPayment.charges[0].billing_details.phone}</p>
                      </div>
                    )}
                    {selectedPayment.charges[0].billing_details.address && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <div className="text-sm">
                          {selectedPayment.charges[0].billing_details.address.line1 && (
                            <p>{selectedPayment.charges[0].billing_details.address.line1}</p>
                          )}
                          {selectedPayment.charges[0].billing_details.address.line2 && (
                            <p>{selectedPayment.charges[0].billing_details.address.line2}</p>
                          )}
                          <p>
                            {[
                              selectedPayment.charges[0].billing_details.address.city,
                              selectedPayment.charges[0].billing_details.address.state,
                              selectedPayment.charges[0].billing_details.address.postal_code,
                            ].filter(Boolean).join(', ')}
                          </p>
                          {selectedPayment.charges[0].billing_details.address.country && (
                            <p className="uppercase">{selectedPayment.charges[0].billing_details.address.country}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Receipt Link */}
              {selectedPayment.receipt_url && (
                <div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(selectedPayment.receipt_url!, '_blank')}
                  >
                    View Stripe Receipt
                  </Button>
                </div>
              )}

              {/* Refund Information */}
              {selectedPayment.amount_refunded > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold mb-2 text-sm text-red-800">Refund Information</h3>
                  <div className="mb-2">
                    <Label className="text-xs text-red-700">Total Refunded</Label>
                    <p className="text-lg font-bold text-red-700">{currency(selectedPayment.amount_refunded)}</p>
                  </div>
                  {selectedPayment.refunds.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <Label className="text-xs text-red-700">Refund History</Label>
                      {selectedPayment.refunds.map((refund) => (
                        <div key={refund.id} className="text-xs bg-white p-2 rounded border border-red-100">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{currency(refund.amount)}</span>
                            <Badge variant="outline" className="text-[10px]">{refund.status}</Badge>
                          </div>
                          <p className="text-muted-foreground">{new Date(refund.created * 1000).toLocaleString()}</p>
                          {refund.reason && <p className="text-red-600 capitalize">Reason: {refund.reason}</p>}
                          {refund.receipt_number && <p className="text-muted-foreground">Receipt: {refund.receipt_number}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              {selectedPayment && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedPayment.id, 'Payment ID')}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy ID
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openStripePayment(selectedPayment.id)}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Stripe
                  </Button>
                  {selectedPayment.receipt_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedPayment.receipt_url!, '_blank')}
                      className="flex-1"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Receipt
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2">
              {selectedPayment && canRefund(selectedPayment) && (
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsDetailsOpen(false)
                    handleRefundClick(selectedPayment)
                  }}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Issue Refund
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>
              Process a refund for this payment. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Refund Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max: {selectedPayment ? currency(selectedPayment.amount - selectedPayment.amount_refunded) : '$0.00'}
              </p>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select value={refundReason} onValueChange={(value: any) => setRefundReason(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested_by_customer">Requested by Customer</SelectItem>
                  <SelectItem value="duplicate">Duplicate Payment</SelectItem>
                  <SelectItem value="fraudulent">Fraudulent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundOpen(false)} disabled={isRefunding}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={processRefund} disabled={isRefunding}>
              {isRefunding ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payments List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Stripe Payments</CardTitle>
            <CardDescription>
              All payments from Stripe ({payments.length} total)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">Amount</th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">Payment Method</th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">Description</th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">Customer</th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">Date</th>
                    <th className="text-left p-3 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const isRefunded = payment.amount_refunded > 0
                    const isFullyRefunded = payment.amount_refunded >= payment.amount
                    const isPartiallyRefunded = isRefunded && !isFullyRefunded
                    const cardDetails = payment.charges[0]?.payment_method_details?.card

                    return (
                      <tr 
                        key={payment.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handlePaymentClick(payment)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              isFullyRefunded ? 'text-red-600 line-through' : 
                              payment.status === 'succeeded' ? 'text-green-600' : 
                              'text-orange-600'
                            }`}>
                              {currency(payment.amount)}
                            </span>
                            {isFullyRefunded && (
                              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300 text-[10px]">
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Refunded
                                </div>
                              </Badge>
                            )}
                            {isPartiallyRefunded && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-300 text-[10px]">
                                <div className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Partially Refunded
                                </div>
                              </Badge>
                            )}
                          </div>
                          {isRefunded && (
                            <div className="text-xs text-red-600 mt-1">
                              -{currency(payment.amount_refunded)} refunded
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {cardDetails ? (
                              <>
                                <div className="w-6 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                                  {cardDetails.brand.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm">
                                  .... {cardDetails.last4}
                                </span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {payment.metadata.className || payment.description || 'Cooking Class'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {payment.metadata.customerName || payment.customer_email || payment.charges[0]?.billing_details?.email || 'Guest'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {new Date(payment.created * 1000).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePaymentClick(payment)
                            }}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {payments.map((payment) => {
                const isRefunded = payment.amount_refunded > 0
                const isFullyRefunded = payment.amount_refunded >= payment.amount
                const isPartiallyRefunded = isRefunded && !isFullyRefunded
                const cardDetails = payment.charges[0]?.payment_method_details?.card

                return (
                  <div
                    key={payment.id}
                    className={`w-full p-4 border-2 rounded-lg cursor-pointer hover:shadow-lg transition-all relative ${
                      isFullyRefunded ? 'border-red-300 bg-red-50/50' : 
                      isPartiallyRefunded ? 'border-orange-300 bg-orange-50/50' :
                      payment.status === 'succeeded' ? 'border-green-200 hover:border-green-400' : 
                      'border-gray-200 hover:border-cocinarte-navy/30'
                    }`}
                  >
                    {/* Refund Badge */}
                    {isFullyRefunded && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="text-[10px]">
                          FULLY REFUNDED
                        </Badge>
                      </div>
                    )}
                    {isPartiallyRefunded && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-orange-500 text-white text-[10px]">
                          PARTIAL REFUND
                        </Badge>
                      </div>
                    )}

                    <div onClick={() => handlePaymentClick(payment)}>
                      <div className="flex items-start space-x-3 mb-3">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          isFullyRefunded ? 'bg-red-100 text-red-600' : 
                          payment.status === 'succeeded' ? 'bg-green-100 text-green-600' : 
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {getStatusIcon(payment.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {payment.metadata.customerName || payment.customer_email || payment.charges[0]?.billing_details?.email || 'Guest'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {payment.metadata.className || payment.description || 'Cooking Class'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.created * 1000).toLocaleDateString()} at {new Date(payment.created * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>

                      {cardDetails && (
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground capitalize">
                            {cardDetails.brand} •••• {cardDetails.last4}
                            {cardDetails.funding && ` (${cardDetails.funding})`}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-bold text-lg ${
                                isFullyRefunded ? 'text-red-600 line-through' : 
                                payment.status === 'succeeded' ? 'text-green-600' : 
                                'text-orange-600'
                              }`}>
                                {currency(payment.amount)}
                              </p>
                              {isFullyRefunded && (
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-300 text-[10px]">
                                  <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Refunded
                                  </div>
                                </Badge>
                              )}
                              {isPartiallyRefunded && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-300 text-[10px]">
                                  <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Partially Refunded
                                  </div>
                                </Badge>
                              )}
                            </div>
                            {isRefunded && (
                              <p className="text-xs font-medium text-red-600">
                                -{currency(payment.amount_refunded)} refunded
                              </p>
                            )}
                            {payment.charges[0]?.net > 0 && !isFullyRefunded && (
                              <p className="text-xs text-muted-foreground">
                                Net: {currency(payment.charges[0].net)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePaymentClick(payment)
                        }}
                        className="flex-1 text-xs"
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      {payment.receipt_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(payment.receipt_url!, '_blank')
                          }}
                          className="flex-1 text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
              {payments.length === 0 && (
                <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                  No payments found in Stripe.
                </div>
              )}
            </div>
          )}
          {payments.length === 0 && viewMode === 'table' && (
            <div className="text-center text-sm text-muted-foreground py-8">
              No payments found in Stripe.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}