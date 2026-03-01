"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, ChefHat, Flower2, AlertCircle, ArrowLeft, CheckCircle, CreditCard, User, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { ClasesClientService } from "@/lib/supabase/clases-client"
import { ParentsClientService } from "@/lib/supabase/parents-client"
import { BookingsClientService } from "@/lib/supabase/bookings-client"
import { StudentsClientService } from "@/lib/supabase/students-client"
import { Clase } from "@/lib/types/clases"
import { useAuth } from "@/contexts/auth-context"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import StripePaymentForm from './stripe-payment-form'
import { ParentWithChildren, Child } from '@/types/student'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CampBookingPopupProps {
  isOpen: boolean
  onClose: () => void
}

// Camp dates for Spring Break 2026
const CAMP_DATES = [
  { day: "Monday", date: "March 23", fullDate: "2026-03-23" },
  { day: "Tuesday", date: "March 24", fullDate: "2026-03-24" },
  { day: "Wednesday", date: "March 25", fullDate: "2026-03-25" },
  { day: "Thursday", date: "March 26", fullDate: "2026-03-26" },
  { day: "Friday", date: "March 27", fullDate: "2026-03-27" },
]

type BookingStep = 'select-dates' | 'login' | 'signup' | 'child-selection' | 'payment' | 'confirmation'

export default function CampBookingPopup({ isOpen, onClose }: CampBookingPopupProps) {
  const { user, signIn, signUp } = useAuth()

  // Date selection state
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [campClasses, setCampClasses] = useState<Clase[]>([])
  const [loading, setLoading] = useState(true)

  // Booking flow state
  const [step, setStep] = useState<BookingStep>('select-dates')
  const [parentWithChildren, setParentWithChildren] = useState<ParentWithChildren | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  // Auth state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Payment state
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // Booking state
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookedClasses, setBookedClasses] = useState<Clase[]>([])

  // Booking comments state
  const [bookingComments, setBookingComments] = useState('')

  // Children bookings state (for duplicate check)
  const [childrenBookings, setChildrenBookings] = useState<{ [key: string]: any[] }>({})

  // Fetch camp classes from database
  useEffect(() => {
    const fetchCampClasses = async () => {
      if (!isOpen) return

      try {
        setLoading(true)
        const clasesService = new ClasesClientService()
        const allClasses = await clasesService.getUpcomingClases()

        // Filter for camp classes
        const campClassesFiltered = allClasses.filter(clase => {
          const title = clase.title?.toLowerCase() || ''
          return title.includes('spring break') ||
                 title.includes('bake & create') ||
                 title.includes('camp')
        })

        setCampClasses(campClassesFiltered)
      } catch (error) {
        // Error fetching camp classes
      } finally {
        setLoading(false)
      }
    }

    fetchCampClasses()
  }, [isOpen])

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDates([])
      setStep('select-dates')
      setSelectedChildId(null)
      setClientSecret('')
      setPaymentIntentId('')
      setPaymentError('')
      setAuthError('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setBookingComplete(false)
      setBookedClasses([])
      setChildrenBookings({})
      setBookingComments('')
    }
  }, [isOpen])

  // Check auth status and load children when step changes
  useEffect(() => {
    const loadUserData = async () => {
      if (step === 'child-selection' && user) {
        try {
          const parentsService = new ParentsClientService()
          const parent = await parentsService.getParentWithChildrenByUserId(user.id)
          setParentWithChildren(parent)

          // Load bookings for children to check for duplicates
          if (parent && parent.children) {
            await loadBookingsForChildren(parent.children)
          }
        } catch (error) {
          // Error loading children
        }
      }
    }
    loadUserData()
  }, [step, user])

  // Create payment intent when entering payment step
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (step === 'payment' && selectedChildId && selectedClasses.length > 0 && !clientSecret) {
        setPaymentLoading(true)
        try {
          const campTitle = `Spring Break Camp (${selectedClasses.length} day${selectedClasses.length > 1 ? 's' : ''})`
          const childName = parentWithChildren?.children.find(c => c.id === selectedChildId)?.child_full_name || ''

          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: totalPrice, // API will convert to cents
              classId: selectedClasses[0].id, // Use first class for validation
              classTitle: campTitle,
              studentName: childName,
              userEmail: user?.email,
            }),
          })

          const data = await response.json()
          if (data.clientSecret) {
            setClientSecret(data.clientSecret)
            setPaymentIntentId(data.paymentIntentId)
          } else {
            setPaymentError(data.error || 'Failed to initialize payment')
          }
        } catch (error) {
          setPaymentError('Failed to initialize payment')
        } finally {
          setPaymentLoading(false)
        }
      }
    }
    createPaymentIntent()
  }, [step, selectedChildId, user])

  const handleDateToggle = (fullDate: string) => {
    setSelectedDates(prev =>
      prev.includes(fullDate)
        ? prev.filter(d => d !== fullDate)
        : [...prev, fullDate]
    )
  }

  const handleSelectFullWeek = () => {
    const availableDates = CAMP_DATES.filter(d => getClassForDate(d.fullDate)).map(d => d.fullDate)
    if (selectedDates.length === availableDates.length) {
      setSelectedDates([])
    } else {
      setSelectedDates(availableDates)
    }
  }

  const getClassForDate = (fullDate: string): Clase | undefined => {
    return campClasses.find(clase => {
      const classDate = new Date(clase.date).toISOString().split('T')[0]
      return classDate === fullDate
    })
  }

  const selectedClasses = selectedDates
    .map(date => getClassForDate(date))
    .filter((c): c is Clase => c !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalPrice = selectedClasses.reduce((sum, c) => sum + c.price, 0)
  const availableDates = CAMP_DATES.filter(d => getClassForDate(d.fullDate))
  const isFullWeekSelected = selectedDates.length === availableDates.length && availableDates.length > 0

  const handleContinueFromDates = () => {
    if (user) {
      setStep('child-selection')
    } else {
      setStep('login')
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    const { error } = await signIn(email, password)

    if (error) {
      setAuthError(error.message)
    } else {
      setStep('child-selection')
    }

    setAuthLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match')
      setAuthLoading(false)
      return
    }

    const { error } = await signUp(email, password)

    if (error) {
      setAuthError(error.message)
    } else {
      setAuthError('')
      setStep('child-selection')
    }

    setAuthLoading(false)
  }

  const loadBookingsForChildren = async (children: Child[]) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const bookingsMap: { [key: string]: any[] } = {}

      for (const child of children) {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*, clases:class_id (id, title, date, time, price)')
          .eq('child_id', child.id)
          .not('booking_status', 'eq', 'cancelled')
          .not('payment_status', 'in', '("failed","canceled")')
          .order('created_at', { ascending: false })

        if (error) {
          console.error(`Error loading bookings for child ${child.id}:`, error)
        }

        bookingsMap[child.id] = bookings || []
      }

      setChildrenBookings(bookingsMap)
    } catch (error) {
      console.error('Failed to load bookings:', error)
    }
  }

  const handleSelectChild = (childId: string) => {
    setSelectedChildId(childId)
  }

  const handleContinueToPayment = () => {
    if (selectedChildId) {
      setStep('payment')
    }
  }

  const handlePaymentSuccess = async () => {
    // Create bookings for all selected classes
    try {
      const bookingsService = new BookingsClientService()
      const studentsService = new StudentsClientService()
      const selectedChild = parentWithChildren?.children.find(c => c.id === selectedChildId)
      const childName = selectedChild?.child_full_name || 'Child'
      const parentName = parentWithChildren?.parent_guardian_names || 'Parent'

      // Get or create student record (required for bookings)
      let studentInfo = await studentsService.getStudentByEmail(user!.email!)

      if (!studentInfo) {
        // Create student record for backward compatibility
        studentInfo = await studentsService.createStudent({
          parent_name: parentName,
          child_name: childName,
          email: user!.email!,
          phone: parentWithChildren?.parent_phone || undefined,
          address: parentWithChildren?.address || undefined
        })
      }

      let firstBookingId = ''
      for (const clase of selectedClasses) {
        const booking = await bookingsService.createBooking({
          class_id: clase.id,
          child_id: selectedChildId!,
          user_id: user!.id,
          student_id: studentInfo.id,
          parent_id: parentWithChildren?.id,
          payment_amount: clase.price,
          payment_method: 'stripe',
          payment_status: 'completed',
          booking_status: 'confirmed',
          stripe_payment_intent_id: paymentIntentId,
          booking_comments: bookingComments || undefined,
          notes: `Spring Break Camp booking for ${childName} - ${clase.title} on ${clase.date}.`
        })
        if (!firstBookingId) firstBookingId = booking.id
      }

      // Send confirmation email for camp booking
      try {
        const campDates = selectedClasses.map(c => c.date).join(', ')
        const emailResponse = await fetch('/api/booking-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: user!.email,
            userName: parentName,
            studentName: childName,
            classTitle: `Bake & Create Spring Break Camp (${selectedClasses.length} day${selectedClasses.length > 1 ? 's' : ''})`,
            classDate: selectedClasses[0].date,
            classTime: selectedClasses[0].time,
            classPrice: totalPrice,
            bookingId: firstBookingId || `CAMP-${Date.now()}`
          })
        })

        // Email sent (or failed silently)
      } catch (emailError) {
        // Don't fail the booking if email fails
      }

      setBookedClasses(selectedClasses)
      setBookingComplete(true)
      setStep('confirmation')
    } catch (error) {
      setPaymentError('Payment successful but failed to create bookings. Please contact support.')
    }
  }

  const selectedChild = parentWithChildren?.children.find(c => c.id === selectedChildId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader className="pb-3 sm:pb-4 border-b">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-slate pr-6">
            {step === 'confirmation' ? 'Booking Confirmed!' : 'Spring Break Camp'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          {/* Step: Select Dates */}
          {step === 'select-dates' && (
            <>
              {/* Camp Info */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <Badge className="bg-[#FCB414] text-black px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                  <Flower2 className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                  Spring 2026
                </Badge>
                <Badge className="bg-[#F0614F] text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                  Ages 7+
                </Badge>
                <Badge className="bg-[#00ADEE] text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                  $120/day
                </Badge>
              </div>

              <div className="flex items-center text-slate bg-gray-50 rounded-lg p-2.5 sm:p-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-[#FCB414]" />
                <span className="font-medium text-sm sm:text-base">9:00 AM – 12:30 PM daily</span>
              </div>

              {loading && (
                <div className="text-center py-4">
                  <p className="text-slate-medium">Loading camp classes...</p>
                </div>
              )}

              {!loading && campClasses.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Camp classes coming soon!</p>
                    <p className="text-sm text-amber-700">Please check back later or contact us for more information.</p>
                  </div>
                </div>
              )}

              {!loading && campClasses.length > 0 && (
                <>
                  {/* Full Week Option */}
                  <div
                    className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${
                      isFullWeekSelected
                        ? 'border-[#F0614F] bg-[#F0614F]/5'
                        : 'border-gray-200 hover:border-[#F0614F]/50'
                    }`}
                    onClick={handleSelectFullWeek}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Checkbox
                          checked={isFullWeekSelected}
                          className="data-[state=checked]:bg-[#F0614F] data-[state=checked]:border-[#F0614F] h-4 w-4 sm:h-5 sm:w-5"
                        />
                        <div>
                          <p className="font-semibold text-slate text-sm sm:text-base">Full Week ({availableDates.length} Days)</p>
                          <p className="text-xs sm:text-sm text-slate-medium">March 23–27, 2026</p>
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-[#F0614F]">${availableDates.length * 120}</p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 sm:px-3 text-xs sm:text-sm text-slate-medium">or select individual days</span>
                    </div>
                  </div>

                  {/* Individual Days */}
                  <div className="space-y-1.5 sm:space-y-2">
                    {CAMP_DATES.map((campDate) => {
                      const classForDate = getClassForDate(campDate.fullDate)
                      const isSelected = selectedDates.includes(campDate.fullDate)
                      const isAvailable = !!classForDate

                      return (
                        <div
                          key={campDate.fullDate}
                          className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all ${
                            !isAvailable
                              ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                              : isSelected
                                ? 'border-[#F0614F] bg-[#F0614F]/5 cursor-pointer'
                                : 'border-gray-200 hover:border-[#F0614F]/50 cursor-pointer'
                          }`}
                          onClick={() => isAvailable && handleDateToggle(campDate.fullDate)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Checkbox
                                checked={isSelected}
                                disabled={!isAvailable}
                                className="data-[state=checked]:bg-[#F0614F] data-[state=checked]:border-[#F0614F] h-4 w-4 sm:h-5 sm:w-5"
                              />
                              <div>
                                <p className="font-semibold text-slate text-sm sm:text-base">{campDate.day}</p>
                                <p className="text-xs sm:text-sm text-slate-medium">{campDate.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#F0614F] text-sm sm:text-base">$120</p>
                              {!isAvailable && (
                                <p className="text-xs text-slate-medium">Not available</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Summary */}
              {selectedDates.length > 0 && (
                <div className="bg-[#FCB414]/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate text-sm sm:text-base">
                        {selectedDates.length} day{selectedDates.length > 1 ? 's' : ''} selected
                      </p>
                      <p className="text-xs sm:text-sm text-slate-medium">
                        {isFullWeekSelected ? 'Full week enrollment' : 'Individual days'}
                      </p>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-[#F0614F]">${totalPrice}</p>
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-[#F0614F] hover:bg-[#F48E77] text-white py-4 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl disabled:opacity-50"
                disabled={selectedDates.length === 0 || loading}
                onClick={handleContinueFromDates}
              >
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {selectedDates.length === 0 ? 'Select days to continue' : 'Continue to Booking'}
              </Button>
            </>
          )}

          {/* Step: Login */}
          {step === 'login' && (
            <>
              <Button
                variant="ghost"
                className="mb-2 -ml-2 text-sm sm:text-base"
                onClick={() => setStep('select-dates')}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                Back
              </Button>

              <div className="text-center mb-3 sm:mb-4">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#F0614F] mx-auto mb-2" />
                <h3 className="text-base sm:text-lg font-semibold text-slate">Sign in to continue</h3>
                <p className="text-xs sm:text-sm text-slate-medium">Sign in to your account to book camp</p>
              </div>

              {authError && (
                <Alert variant="destructive">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignIn} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 sm:h-11 text-sm sm:text-base"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#F0614F] hover:bg-[#F48E77] h-10 sm:h-11 text-sm sm:text-base"
                  disabled={authLoading}
                >
                  {authLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-medium">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setStep('signup')}
                    className="text-[#F0614F] font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Step: Sign Up */}
          {step === 'signup' && (
            <>
              <Button
                variant="ghost"
                className="mb-2 -ml-2 text-sm sm:text-base"
                onClick={() => setStep('login')}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                Back
              </Button>

              <div className="text-center mb-3 sm:mb-4">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#F0614F] mx-auto mb-2" />
                <h3 className="text-base sm:text-lg font-semibold text-slate">Create an account</h3>
                <p className="text-xs sm:text-sm text-slate-medium">Sign up to book camp</p>
              </div>

              {authError && (
                <Alert variant="destructive">
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSignUp} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="signup-email" className="text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-password" className="text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 sm:h-11 text-sm sm:text-base"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#F0614F] hover:bg-[#F48E77] h-10 sm:h-11 text-sm sm:text-base"
                  disabled={authLoading}
                >
                  {authLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-medium">
                  Already have an account?{' '}
                  <button
                    onClick={() => setStep('login')}
                    className="text-[#F0614F] font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Step: Child Selection */}
          {step === 'child-selection' && (
            <>
              <Button
                variant="ghost"
                className="mb-2 -ml-2 text-sm sm:text-base"
                onClick={() => setStep('select-dates')}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                Back
              </Button>

              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="font-semibold text-slate mb-1 text-sm sm:text-base">Selected Days:</p>
                <p className="text-xs sm:text-sm text-slate-medium">
                  {selectedClasses.map(c => {
                    const campDate = CAMP_DATES.find(d => d.fullDate === new Date(c.date).toISOString().split('T')[0])
                    return campDate ? `${campDate.day}` : c.title
                  }).join(', ')}
                </p>
                <p className="text-base sm:text-lg font-bold text-[#F0614F] mt-2">Total: ${totalPrice}</p>
              </div>

              <div className="text-center mb-3 sm:mb-4">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-[#F0614F] mx-auto mb-2" />
                <h3 className="text-base sm:text-lg font-semibold text-slate">Select a child</h3>
                <p className="text-xs sm:text-sm text-slate-medium">Choose which child will attend camp</p>
              </div>

              {parentWithChildren?.children && parentWithChildren.children.length > 0 ? (
                <div className="space-y-2">
                  {parentWithChildren.children.map((child) => {
                    // Check if this child is already booked for any of the selected camp classes
                    const selectedClassIds = selectedClasses.map(c => c.id)
                    const isAlreadyBooked = childrenBookings[child.id]?.some(
                      (booking: any) => selectedClassIds.includes(booking.class_id) &&
                      (booking.booking_status === 'confirmed' || booking.booking_status === 'pending' || !booking.booking_status)
                    ) || false

                    return (
                      <div
                        key={child.id}
                        className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all ${
                          isAlreadyBooked
                            ? 'border-gray-300 bg-gray-50/50 opacity-60 cursor-not-allowed'
                            : selectedChildId === child.id
                              ? 'border-[#F0614F] bg-[#F0614F]/5 cursor-pointer'
                              : 'border-gray-200 hover:border-[#F0614F]/50 cursor-pointer'
                        }`}
                        onClick={() => !isAlreadyBooked && handleSelectChild(child.id)}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isAlreadyBooked ? 'border-gray-300 bg-gray-200' :
                            selectedChildId === child.id ? 'border-[#F0614F] bg-[#F0614F]' : 'border-gray-300'
                          }`}>
                            {selectedChildId === child.id && !isAlreadyBooked && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate text-sm sm:text-base">{child.child_full_name}</p>
                            {child.child_age && <p className="text-xs sm:text-sm text-slate-medium">Age: {child.child_age}</p>}
                          </div>
                          {isAlreadyBooked && (
                            <Badge className="bg-orange-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Already Booked
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-slate-medium text-sm">No children found. Please add a child to your account first.</p>
                </div>
              )}

              <div className="space-y-2 mt-3 sm:mt-4">
                <Label htmlFor="camp-booking-comments" className="text-sm font-medium text-slate-700">
                  Comments (optional)
                </Label>
                <Textarea
                  id="camp-booking-comments"
                  value={bookingComments}
                  onChange={(e) => setBookingComments(e.target.value)}
                  placeholder="Any allergies, dietary needs, or special requests..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <Button
                className="w-full bg-[#F0614F] hover:bg-[#F48E77] text-white py-4 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl disabled:opacity-50 mt-3 sm:mt-4"
                disabled={!selectedChildId}
                onClick={handleContinueToPayment}
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Continue to Payment
              </Button>
            </>
          )}

          {/* Step: Payment */}
          {step === 'payment' && (
            <>
              <Button
                variant="ghost"
                className="mb-2 -ml-2 text-sm sm:text-base"
                onClick={() => {
                  setStep('child-selection')
                  setClientSecret('')
                  setPaymentIntentId('')
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-1.5 sm:mr-2" />
                Back
              </Button>

              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="font-semibold text-slate mb-1 text-sm sm:text-base">Booking Summary:</p>
                <p className="text-xs sm:text-sm text-slate-medium">Child: {selectedChild?.child_full_name}</p>
                <p className="text-xs sm:text-sm text-slate-medium">
                  Days: {selectedClasses.map(c => {
                    const campDate = CAMP_DATES.find(d => d.fullDate === new Date(c.date).toISOString().split('T')[0])
                    return campDate?.day
                  }).join(', ')}
                </p>
                <p className="text-base sm:text-lg font-bold text-[#F0614F] mt-2">Total: ${totalPrice}</p>
              </div>

              {paymentError && (
                <Alert variant="destructive" className="text-sm">
                  <AlertDescription>{paymentError}</AlertDescription>
                </Alert>
              )}

              {paymentLoading && (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-slate-medium text-sm sm:text-base">Initializing payment...</p>
                </div>
              )}

              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={(error) => setPaymentError(error)}
                    amount={totalPrice}
                  />
                </Elements>
              )}
            </>
          )}

          {/* Step: Confirmation */}
          {step === 'confirmation' && (
            <div className="text-center py-2 sm:py-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate mb-2">Booking Confirmed!</h3>
              <p className="text-slate-medium mb-4 sm:mb-6 text-sm sm:text-base">
                {selectedChild?.child_full_name} is enrolled in {bookedClasses.length} day{bookedClasses.length > 1 ? 's' : ''} of camp.
              </p>

              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-left mb-4 sm:mb-6">
                <p className="font-semibold text-slate mb-2 text-sm sm:text-base">Enrolled Days:</p>
                {bookedClasses.map((clase) => {
                  const campDate = CAMP_DATES.find(d => d.fullDate === new Date(clase.date).toISOString().split('T')[0])
                  return (
                    <div key={clase.id} className="flex items-center gap-2 text-xs sm:text-sm text-slate-medium mb-1">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      <span>{campDate?.day}, {campDate?.date} - 9:00–12:30</span>
                    </div>
                  )
                })}
                <p className="text-base sm:text-lg font-bold text-[#F0614F] mt-3">Total Paid: ${totalPrice}</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-medium mb-3 sm:mb-4">
                A confirmation email has been sent to your email address.
              </p>

              <Button
                className="w-full bg-[#F0614F] hover:bg-[#F48E77] h-10 sm:h-11 text-sm sm:text-base"
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
