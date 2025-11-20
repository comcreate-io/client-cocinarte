"use client"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

interface InvoicePaymentFormProps {
  invoiceId: string
  amount: number
  onSuccess: () => void
}

export default function InvoicePaymentForm({ invoiceId, amount, onSuccess }: InvoicePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError("")

    try {
      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message || "Payment failed")
        setProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Update invoice in database
        const response = await fetch('/api/invoice/mark-paid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoice_id: invoiceId,
            stripe_payment_intent_id: paymentIntent.id
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update invoice')
        }

        setSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }

    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment processing failed')
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Payment successful! Redirecting...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-cocinarte-red hover:bg-cocinarte-red/90 py-6 text-lg"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-center text-gray-600">
        Payments are securely processed by Stripe. We never store your card information.
      </p>
    </form>
  )
}
