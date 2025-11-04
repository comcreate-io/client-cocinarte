"use client"

import { useState, FormEvent } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StripePaymentFormProps {
  amount: number
  onSuccess: () => void
  onCancel: () => void
  loading?: boolean
}

export default function StripePaymentForm({ 
  amount, 
  onSuccess, 
  onCancel,
  loading: externalLoading 
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment')
        setIsLoading(false)
      } else if (paymentIntent) {
        // Verify payment hold was successful
        console.log('Payment Intent Status:', paymentIntent.status)
        
        if (paymentIntent.status === 'requires_capture') {
          // Payment hold successful!
          console.log('✅ Payment hold successful - amount authorized')
          onSuccess()
        } else {
          // Unexpected status
          setErrorMessage(`Payment authorization failed. Status: ${paymentIntent.status}. Please try again.`)
          setIsLoading(false)
        }
      } else {
        setErrorMessage('Payment verification failed. Please try again.')
        setIsLoading(false)
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col flex-1">
      <div className="space-y-6 flex-1">
        <PaymentElement />

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200 mt-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || externalLoading}
          className="flex-1 h-12"
        >
          Back to Classes
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading || externalLoading}
          className="flex-1 h-12 bg-cocinarte-navy hover:bg-cocinarte-navy/90 text-white"
        >
          {isLoading || externalLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            `Authorize $${amount} (Hold)`
          )}
        </Button>
      </div>
    </form>
  )
}

