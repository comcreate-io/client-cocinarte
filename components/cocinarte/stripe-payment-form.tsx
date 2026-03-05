"use client"

import { useState, FormEvent } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock } from 'lucide-react'

interface StripePaymentFormProps {
  amount: number
  onSuccess: () => void
  onCancel?: () => void
  onError?: (error: string) => void
  loading?: boolean
  submitLabel?: string
  cancelLabel?: string
  showCancel?: boolean
}

export default function StripePaymentForm({
  amount,
  onSuccess,
  onCancel,
  onError,
  loading: externalLoading,
  submitLabel,
  cancelLabel = 'Cancel',
  showCancel = true
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
        const msg = error.message || 'An error occurred during payment'
        setErrorMessage(msg)
        onError?.(msg)
        setIsLoading(false)
      } else if (paymentIntent) {
        // Verify payment was successful
        console.log('Payment Intent Status:', paymentIntent.status)

        if (paymentIntent.status === 'succeeded') {
          // Payment successful!
          console.log('✅ Payment successful - amount charged')
          onSuccess()
        } else {
          // Unexpected status
          setErrorMessage(`Payment failed. Status: ${paymentIntent.status}. Please try again.`)
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

  const defaultSubmitLabel = `Pay $${amount}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 flex flex-col flex-1">
      <div className="space-y-4 sm:space-y-6 flex-1">
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          }}
        />

        {errorMessage && (
          <Alert variant="destructive" className="text-sm">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200 mt-auto">
        {showCancel && onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || externalLoading}
            className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base"
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || isLoading || externalLoading}
          className="w-full sm:flex-1 h-12 sm:h-14 bg-[#F0614F] hover:bg-[#F48E77] text-white text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl"
        >
          {isLoading || externalLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm sm:text-base">Processing...</span>
            </div>
          ) : (
<<<<<<< HEAD
            `Pay $${amount}`
=======
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {submitLabel || defaultSubmitLabel}
            </span>
>>>>>>> bfea6bddc63ce03108b54a260c8c7dfd1e46935d
          )}
        </Button>
      </div>
    </form>
  )
}

