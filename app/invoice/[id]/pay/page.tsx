"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  FileText, Calendar, User, Building, Mail, Phone, MapPin,
  CheckCircle, Clock, AlertCircle, DollarSign
} from "lucide-react"
import { Invoice } from "@/lib/types/invoice"
import { InvoicesClientService } from "@/lib/supabase/invoices-client"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import InvoicePaymentForm from "@/components/invoice/invoice-payment-form"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function InvoicePaymentPage() {
  const params = useParams()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    fetchInvoice()
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const service = new InvoicesClientService()
      const data = await service.getInvoiceById(invoiceId)

      if (!data) {
        setError("Invoice not found")
        return
      }

      if (data.payment_status === 'paid') {
        setPaymentSuccess(true)
      }

      setInvoice(data)
    } catch (err) {
      console.error("Error fetching invoice:", err)
      setError("Failed to load invoice")
    } finally {
      setLoading(false)
    }
  }

  const handleInitiatePayment = async () => {
    if (!invoice) return

    try {
      const response = await fetch('/api/invoice/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoice.id,
          amount: invoice.total_amount
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const data = await response.json()
      setClientSecret(data.clientSecret)
    } catch (err) {
      console.error("Error creating payment intent:", err)
      setError("Failed to initialize payment. Please try again.")
    }
  }

  const handlePaymentComplete = () => {
    setPaymentSuccess(true)
    fetchInvoice()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
      paid: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Paid" },
      overdue: { color: "bg-red-100 text-red-800", icon: AlertCircle, label: "Overdue" },
      cancelled: { color: "bg-gray-100 text-gray-800", icon: AlertCircle, label: "Cancelled" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cocinarte-red"></div>
          <span className="text-gray-600">Loading invoice...</span>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
            <p className="text-gray-600">{error || "The invoice you're looking for doesn't exist or has been removed."}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your payment. Invoice {invoice.invoice_number} has been marked as paid.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                A payment confirmation has been sent to <strong>{invoice.recipient_email}</strong>
              </p>
            </div>
            <div className="text-left max-w-md mx-auto bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Payment Details:</p>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Invoice:</span>
                <span className="font-semibold">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700">Amount Paid:</span>
                <span className="font-semibold text-green-600">{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Payment Date:</span>
                <span className="font-semibold">{formatDate(invoice.paid_at || new Date().toISOString())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#dc2626',
      },
    },
  } : null

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cocinarte</h1>
          <p className="text-gray-600">Invoice Payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Invoice Details */}
          <div className="space-y-6">
            {/* Invoice Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cocinarte-red" />
                    {invoice.invoice_number}
                  </CardTitle>
                  {getStatusBadge(invoice.payment_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Invoice Date
                    </p>
                    <p className="font-semibold">{formatDate(invoice.invoice_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due Date
                    </p>
                    <p className="font-semibold text-red-600">{formatDate(invoice.due_date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipient Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Bill To
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold text-lg">{invoice.recipient_name}</p>
                {invoice.recipient_company && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {invoice.recipient_company}
                  </p>
                )}
                <p className="text-gray-600 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {invoice.recipient_email}
                </p>
                {invoice.recipient_phone && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {invoice.recipient_phone}
                  </p>
                )}
                {invoice.recipient_address && (
                  <p className="text-gray-600 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1" />
                    <span>{invoice.recipient_address}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-semibold">Description</th>
                        <th className="text-center p-3 font-semibold">Qty</th>
                        <th className="text-right p-3 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.line_items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right font-semibold">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.tax_rate > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax ({invoice.tax_rate}%):</span>
                      <span className="font-semibold">{formatCurrency(invoice.tax_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-cocinarte-red">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {invoice.notes && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-900">
                  <strong>Notes:</strong> {invoice.notes}
                </AlertDescription>
              </Alert>
            )}

            {/* Terms */}
            {invoice.terms && (
              <Alert>
                <AlertDescription className="text-gray-700">
                  <strong>Payment Terms:</strong> {invoice.terms}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Payment Section */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-cocinarte-red" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!clientSecret ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Amount Due</p>
                      <p className="text-3xl font-bold text-cocinarte-red">{formatCurrency(invoice.total_amount)}</p>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-blue-900 text-sm">
                        Click below to securely pay this invoice using Stripe. Your payment information is encrypted and secure.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleInitiatePayment}
                      className="w-full bg-cocinarte-red hover:bg-cocinarte-red/90 py-6 text-lg"
                    >
                      <DollarSign className="h-5 w-5 mr-2" />
                      Pay {formatCurrency(invoice.total_amount)}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-gray-600 mb-2">Amount Due</p>
                      <p className="text-3xl font-bold text-cocinarte-red">{formatCurrency(invoice.total_amount)}</p>
                    </div>

                    {options && (
                      <Elements stripe={stripePromise} options={options}>
                        <InvoicePaymentForm
                          invoiceId={invoice.id}
                          amount={invoice.total_amount}
                          onSuccess={handlePaymentComplete}
                        />
                      </Elements>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
