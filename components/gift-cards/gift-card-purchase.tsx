'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Gift, CreditCard, Send, CheckCircle, Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const PRESET_AMOUNTS = [25, 50, 75, 100, 150, 200]

interface GiftCardFormData {
  amount: number
  customAmount: string
  purchaserEmail: string
  purchaserName: string
  recipientEmail: string
  recipientName: string
  message: string
}

function GiftCardForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')

  const [formData, setFormData] = useState<GiftCardFormData>({
    amount: 50,
    customAmount: '',
    purchaserEmail: '',
    purchaserName: '',
    recipientEmail: '',
    recipientName: '',
    message: ''
  })

  const selectedAmount = formData.customAmount
    ? parseFloat(formData.customAmount)
    : formData.amount

  const handleAmountSelect = (amount: number) => {
    setFormData({ ...formData, amount, customAmount: '' })
  }

  const handleCustomAmountChange = (value: string) => {
    setFormData({ ...formData, customAmount: value, amount: 0 })
  }

  const validateForm = () => {
    if (!selectedAmount || selectedAmount < 10 || selectedAmount > 500) {
      setError('Please select an amount between $10 and $500')
      return false
    }
    if (!formData.purchaserName.trim()) {
      setError('Please enter your name')
      return false
    }
    if (!formData.purchaserEmail.trim() || !formData.purchaserEmail.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.recipientName.trim()) {
      setError('Please enter the recipient\'s name')
      return false
    }
    if (!formData.recipientEmail.trim() || !formData.recipientEmail.includes('@')) {
      setError('Please enter a valid recipient email address')
      return false
    }
    return true
  }

  const handleProceedToPayment = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          purchaserEmail: formData.purchaserEmail,
          purchaserName: formData.purchaserName,
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          message: formData.message
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
      setStep('payment')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/gift-cards/success`,
        },
        redirect: 'if_required'
      })

      if (paymentError) {
        throw new Error(paymentError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm the gift card creation
        const confirmResponse = await fetch('/api/gift-cards/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id })
        })

        const confirmData = await confirmResponse.json()

        if (!confirmResponse.ok) {
          throw new Error(confirmData.error || 'Failed to confirm gift card')
        }

        setStep('success')
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Gift Card Sent!</h3>
          <p className="text-green-700 mb-4">
            Your ${selectedAmount.toFixed(2)} gift card has been sent to {formData.recipientName} at {formData.recipientEmail}.
          </p>
          <p className="text-sm text-green-600">
            A confirmation email has been sent to your email address.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-cocinarte-orange" />
          {step === 'form' ? 'Send a Gift Card' : 'Complete Payment'}
        </CardTitle>
        <CardDescription>
          {step === 'form'
            ? 'Give the gift of cooking! Your recipient will receive an email with their gift card code.'
            : `Complete your $${selectedAmount.toFixed(2)} gift card purchase`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'form' ? (
          <>
            {/* Amount Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Amount</Label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={formData.amount === amount && !formData.customAmount ? 'default' : 'outline'}
                    className={formData.amount === amount && !formData.customAmount
                      ? 'bg-cocinarte-orange hover:bg-cocinarte-orange/90'
                      : ''
                    }
                    onClick={() => handleAmountSelect(amount)}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Or enter custom amount:</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    placeholder="Custom"
                    className="pl-7"
                    value={formData.customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">Amount must be between $10 and $500</p>
            </div>

            {/* Your Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Your Information</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaserName">Your Name *</Label>
                  <Input
                    id="purchaserName"
                    placeholder="Your full name"
                    value={formData.purchaserName}
                    onChange={(e) => setFormData({ ...formData, purchaserName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaserEmail">Your Email *</Label>
                  <Input
                    id="purchaserEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.purchaserEmail}
                    onChange={(e) => setFormData({ ...formData, purchaserEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Recipient Information</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient's Name *</Label>
                  <Input
                    id="recipientName"
                    placeholder="Recipient's full name"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient's Email *</Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="recipient@example.com"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Personal Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Write a special message for the recipient..."
                rows={3}
                maxLength={200}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
              <p className="text-xs text-gray-500 text-right">{formData.message.length}/200</p>
            </div>

            {/* Summary & Button */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Gift Card Amount</span>
                <span className="text-2xl font-bold text-cocinarte-orange">
                  ${selectedAmount ? selectedAmount.toFixed(2) : '0.00'}
                </span>
              </div>
              <Button
                className="w-full bg-cocinarte-orange hover:bg-cocinarte-orange/90"
                size="lg"
                onClick={handleProceedToPayment}
                disabled={loading || !selectedAmount}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sending to:</span>
                <span className="font-medium">{formData.recipientName}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-xl font-bold text-cocinarte-orange">${selectedAmount.toFixed(2)}</span>
              </div>
            </div>

            <PaymentElement />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('form')}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-cocinarte-orange hover:bg-cocinarte-orange/90"
                disabled={loading || !stripe}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Gift Card - ${selectedAmount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default function GiftCardPurchase({ onSuccess }: { onSuccess?: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  // We need to wrap in Elements only when we have a clientSecret
  // For now, we'll create a wrapper that handles this
  return (
    <div className="max-w-2xl mx-auto">
      <GiftCardPurchaseWrapper onSuccess={onSuccess || (() => {})} />
    </div>
  )
}

function GiftCardPurchaseWrapper({ onSuccess }: { onSuccess: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  // Create a minimal intent just for Elements initialization
  const initializePayment = async (amount: number) => {
    try {
      const response = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          purchaserEmail: 'temp@temp.com',
          purchaserName: 'Temp',
          recipientEmail: 'temp@temp.com',
          recipientName: 'Temp'
        })
      })
      const data = await response.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      }
    } catch (error) {
      console.error('Error initializing payment:', error)
    }
  }

  // For simplicity, we'll use a different approach - render the full form
  // and only wrap with Elements when needed

  return (
    <GiftCardFormStandalone onSuccess={onSuccess} />
  )
}

// Standalone form that handles its own Elements wrapper
function GiftCardFormStandalone({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')

  const [formData, setFormData] = useState<GiftCardFormData>({
    amount: 50,
    customAmount: '',
    purchaserEmail: '',
    purchaserName: '',
    recipientEmail: '',
    recipientName: '',
    message: ''
  })

  const selectedAmount = formData.customAmount
    ? parseFloat(formData.customAmount)
    : formData.amount

  const handleAmountSelect = (amount: number) => {
    setFormData({ ...formData, amount, customAmount: '' })
  }

  const handleCustomAmountChange = (value: string) => {
    setFormData({ ...formData, customAmount: value, amount: 0 })
  }

  const validateForm = () => {
    if (!selectedAmount || selectedAmount < 10 || selectedAmount > 500) {
      setError('Please select an amount between $10 and $500')
      return false
    }
    if (!formData.purchaserName.trim()) {
      setError('Please enter your name')
      return false
    }
    if (!formData.purchaserEmail.trim() || !formData.purchaserEmail.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.recipientName.trim()) {
      setError('Please enter the recipient\'s name')
      return false
    }
    if (!formData.recipientEmail.trim() || !formData.recipientEmail.includes('@')) {
      setError('Please enter a valid recipient email address')
      return false
    }
    return true
  }

  const handleProceedToPayment = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/gift-cards/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          purchaserEmail: formData.purchaserEmail,
          purchaserName: formData.purchaserName,
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          message: formData.message
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
      setStep('payment')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Gift Card Sent!</h3>
          <p className="text-green-700 mb-4">
            Your ${selectedAmount.toFixed(2)} gift card has been sent to {formData.recipientName} at {formData.recipientEmail}.
          </p>
          <p className="text-sm text-green-600">
            A confirmation email has been sent to your email address.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (step === 'payment' && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentStep
          formData={formData}
          selectedAmount={selectedAmount}
          onBack={() => setStep('form')}
          onSuccess={() => {
            setStep('success')
            onSuccess()
          }}
        />
      </Elements>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-cocinarte-orange" />
          Send a Gift Card
        </CardTitle>
        <CardDescription>
          Give the gift of cooking! Your recipient will receive an email with their gift card code.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Amount Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Select Amount</Label>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={formData.amount === amount && !formData.customAmount ? 'default' : 'outline'}
                className={formData.amount === amount && !formData.customAmount
                  ? 'bg-cocinarte-orange hover:bg-cocinarte-orange/90'
                  : ''
                }
                onClick={() => handleAmountSelect(amount)}
              >
                ${amount}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Or enter custom amount:</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                type="number"
                min="10"
                max="500"
                placeholder="Custom"
                className="pl-7"
                value={formData.customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">Amount must be between $10 and $500</p>
        </div>

        {/* Your Information */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Your Information</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaserName">Your Name *</Label>
              <Input
                id="purchaserName"
                placeholder="Your full name"
                value={formData.purchaserName}
                onChange={(e) => setFormData({ ...formData, purchaserName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaserEmail">Your Email *</Label>
              <Input
                id="purchaserEmail"
                type="email"
                placeholder="you@example.com"
                value={formData.purchaserEmail}
                onChange={(e) => setFormData({ ...formData, purchaserEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Recipient Information */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Recipient Information</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient's Name *</Label>
              <Input
                id="recipientName"
                placeholder="Recipient's full name"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient's Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="recipient@example.com"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Personal Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Personal Message (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Write a special message for the recipient..."
            rows={3}
            maxLength={200}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
          <p className="text-xs text-gray-500 text-right">{formData.message.length}/200</p>
        </div>

        {/* Summary & Button */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Gift Card Amount</span>
            <span className="text-2xl font-bold text-cocinarte-orange">
              ${selectedAmount ? selectedAmount.toFixed(2) : '0.00'}
            </span>
          </div>
          <Button
            className="w-full bg-cocinarte-orange hover:bg-cocinarte-orange/90"
            size="lg"
            onClick={handleProceedToPayment}
            disabled={loading || !selectedAmount}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Payment
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Payment step component (wrapped in Elements)
function PaymentStep({
  formData,
  selectedAmount,
  onBack,
  onSuccess
}: {
  formData: GiftCardFormData
  selectedAmount: number
  onBack: () => void
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)
    setError('')

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/gift-cards/success`,
        },
        redirect: 'if_required'
      })

      if (paymentError) {
        throw new Error(paymentError.message)
      }

      if (paymentIntent?.status === 'succeeded') {
        const confirmResponse = await fetch('/api/gift-cards/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id })
        })

        const confirmData = await confirmResponse.json()

        if (!confirmResponse.ok) {
          throw new Error(confirmData.error || 'Failed to confirm gift card')
        }

        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-cocinarte-orange" />
          Complete Payment
        </CardTitle>
        <CardDescription>
          Complete your ${selectedAmount.toFixed(2)} gift card purchase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sending to:</span>
              <span className="font-medium">{formData.recipientName}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-xl font-bold text-cocinarte-orange">${selectedAmount.toFixed(2)}</span>
            </div>
          </div>

          <PaymentElement />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-cocinarte-orange hover:bg-cocinarte-orange/90"
              disabled={loading || !stripe}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Gift Card - ${selectedAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
