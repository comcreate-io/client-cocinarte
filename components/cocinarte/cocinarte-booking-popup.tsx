"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Users, DollarSign, ChefHat, Eye, EyeOff, Mail, Lock, LogIn, UserPlus, ArrowLeft, CreditCard, CheckCircle, User } from "lucide-react"
import { Clase } from "@/lib/types/clases"
import { ClasesClientService } from "@/lib/supabase/clases-client"
import { StudentsClientService } from "@/lib/supabase/students-client"
import { BookingsClientService } from "@/lib/supabase/bookings-client"
import { useAuth } from "@/contexts/auth-context"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import StripePaymentForm from './stripe-payment-form'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BookingPopupProps {
  isOpen: boolean
  onClose: () => void
  selectedClass?: Clase
  initialStep?: 'class-selection' | 'login' | 'signup' | 'payment' | 'confirmation'
  initialSelectedClassId?: string
}

export default function CocinarteBookingPopup({ isOpen, onClose, selectedClass, initialStep, initialSelectedClassId }: BookingPopupProps) {
  const [classes, setClasses] = useState<Clase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialSelectedClassId || selectedClass?.id || null)
  
  // Authentication states
  const [authStep, setAuthStep] = useState<'class-selection' | 'login' | 'signup' | 'payment' | 'confirmation'>(initialStep || 'class-selection')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [parentName, setParentName] = useState('')
  const [childName, setChildName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  
  // Payment states
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [clientSecret, setClientSecret] = useState<string>('')
  const [paymentIntentId, setPaymentIntentId] = useState<string>('')
  
  const { user, signIn, signUp } = useAuth()

  const selectedClassData = classes.find(c => c.id === selectedClassId)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        const clasesService = new ClasesClientService()
        const upcomingClasses = await clasesService.getUpcomingClases()
        setClasses(upcomingClasses)
      } catch (error) {
        console.error('Error fetching classes:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      // Sync initial values when opened
      if (initialSelectedClassId) setSelectedClassId(initialSelectedClassId)
      if (initialStep) setAuthStep(initialStep)
      fetchClasses()
      
      // Check for pending booking when popup opens
      const pendingBooking = sessionStorage.getItem('pendingBooking')
      if (pendingBooking && user) {
        // If user is already logged in and there's a pending booking, restore it
        try {
          const bookingData = JSON.parse(pendingBooking)
          setSelectedClassId(bookingData.classId)
          setParentName(bookingData.parentName)
          setChildName(bookingData.childName)
          setPhone(bookingData.phone)
          setAddress(bookingData.address)
        } catch (error) {
          console.error('Error parsing pending booking:', error)
          sessionStorage.removeItem('pendingBooking')
        }
      }
    }
  }, [isOpen, initialSelectedClassId, initialStep, user])

  // Handle post-signup flow - restore booking and proceed to payment
  useEffect(() => {
    const handlePostSignup = async () => {
      // Check if user just authenticated and there's a pending booking
      const pendingBooking = sessionStorage.getItem('pendingBooking')
      
      if (user && pendingBooking && isOpen) {
        try {
          const bookingData = JSON.parse(pendingBooking)
          
          // Restore the booking state
          setSelectedClassId(bookingData.classId)
          setParentName(bookingData.parentName)
          setChildName(bookingData.childName)
          setPhone(bookingData.phone)
          setAddress(bookingData.address)
          
          // Create student record if it doesn't exist
          const studentsService = new StudentsClientService()
          const existingStudent = await studentsService.getStudentByEmail(user.email!)
          
          if (!existingStudent) {
            await studentsService.createStudent({
              parent_name: bookingData.parentName,
              child_name: bookingData.childName,
              email: user.email!,
              phone: bookingData.phone,
              address: bookingData.address
            })
          }
          
          // Clear the pending booking
          sessionStorage.removeItem('pendingBooking')
          
          // Proceed to payment
          setAuthStep('payment')
          setAuthMessage('Account created successfully! Please complete your payment.')
        } catch (error) {
          console.error('Error restoring booking:', error)
          setAuthError('Unable to restore booking. Please try again.')
        }
      }
    }
    
    handlePostSignup()
  }, [user, isOpen])

  // Create payment intent when entering payment step
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (authStep === 'payment' && selectedClassData && user && !clientSecret) {
        setPaymentLoading(true)
        setPaymentError('')
        
        try {
          // Get student information to fetch parent name
          const studentsService = new StudentsClientService()
          const studentInfo = await studentsService.getStudentByEmail(user.email!)
          
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: selectedClassData.price,
              classTitle: selectedClassData.title,
              userName: studentInfo?.parent_name || parentName || user.user_metadata?.full_name || 'Parent',
              studentName: studentInfo?.child_name || childName || 'Student',
              userEmail: user.email,
              classId: selectedClassData.id,
              classDate: selectedClassData.date,
              classTime: selectedClassData.time,
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to create payment intent')
          }

          const data = await response.json()
          setClientSecret(data.clientSecret)
          setPaymentIntentId(data.paymentIntentId)
        } catch (error) {
          console.error('Error creating payment intent:', error)
          setPaymentError('Failed to initialize payment. Please try again.')
        } finally {
          setPaymentLoading(false)
        }
      }
    }

    createPaymentIntent()
  }, [authStep, selectedClassData, user, clientSecret])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId)
  }

  const handleBookClass = () => {
    if (selectedClassId) {
      if (user) {
        // User is logged in, proceed to payment
        setAuthStep('payment')
      } else {
        // User not logged in, show auth flow
        setAuthStep('login')
      }
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setAuthError(error.message)
    } else {
      setAuthMessage('Successfully signed in!')
      // After successful login, proceed to payment
      setTimeout(() => {
        setAuthStep('payment')
      }, 1000)
    }
    
    setAuthLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    // Validate password confirmation
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match')
      setAuthLoading(false)
      return
    }

    // Validate required fields
    if (!parentName || !childName || !email || !phone || !address) {
      setAuthError('Please fill in all required fields')
      setAuthLoading(false)
      return
    }

    try {
      // Store booking intent in sessionStorage before signup
      const bookingData = {
        classId: selectedClassId,
        parentName,
        childName,
        phone,
        address,
        email
      }
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))
      
      const { error } = await signUp(email, password)
      
      if (error) {
        setAuthError(error.message)
        // Clear pending booking on error
        sessionStorage.removeItem('pendingBooking')
      } else {
        setAuthMessage('Account created successfully! Please wait while we set up your account...')
        // The useEffect hook will handle the rest when user becomes available
        // Note: If email confirmation is required, user will need to verify their email first
        
        // Check if user is immediately available (auto-confirm enabled)
        // If not, the user will need to verify email and come back
        setTimeout(() => {
          if (!user) {
            setAuthMessage('Please check your email to verify your account. After verification, you can proceed with booking.')
          }
        }, 2000)
      }
    } catch (error) {
      setAuthError('Error creating account. Please try again.')
      sessionStorage.removeItem('pendingBooking')
    }
    
    setAuthLoading(false)
  }

  const resetAuthForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setParentName('')
    setChildName('')
    setPhone('')
    setAddress('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAuthError('')
    setAuthMessage('')
  }

  const goBackToClassSelection = () => {
    setAuthStep('class-selection')
    resetAuthForm()
  }

  const handlePaymentSuccess = async () => {
    setPaymentLoading(true)
    setPaymentError('')

    // Validate required data
    if (!user || !selectedClassData) {
      setPaymentError('Missing user or class information')
      setPaymentLoading(false)
      return
    }

    try {
      // Check if class is already full (prevent overbooking)
      const clasesService = new ClasesClientService()
      const currentClass = await clasesService.getClaseById(selectedClassData.id)
      
      if (!currentClass) {
        setPaymentError('Class not found. Please try again.')
        setPaymentLoading(false)
        return
      }

      const enrolled = currentClass.enrolled || 0
      const maxStudents = currentClass.maxStudents || 0

      if (enrolled >= maxStudents) {
        setPaymentError('Sorry, this class is now full. Please choose another class.')
        setPaymentLoading(false)
        return
      }

      // Verify payment hold was successful with Stripe
      console.log('Verifying payment hold with Stripe...')
      const verifyResponse = await fetch('/api/stripe/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId
        })
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        setPaymentError(`Payment verification failed: ${errorData.error || 'Unknown error'}`)
        setPaymentLoading(false)
        return
      }

      const verifyData = await verifyResponse.json()
      
      if (verifyData.status !== 'requires_capture') {
        setPaymentError(`Payment hold failed. Status: ${verifyData.status}. Please try again.`)
        setPaymentLoading(false)
        return
      }

      console.log('✅ Payment hold verified successfully')

      // Get student information
      const studentsService = new StudentsClientService()
      const studentInfo = await studentsService.getStudentByEmail(user.email!)
      
      if (!studentInfo) {
        setPaymentError('Student profile not found. Please contact support.')
        setPaymentLoading(false)
        return
      }

      // Create booking record with payment on HOLD (verified)
      const bookingsService = new BookingsClientService()
      const newBooking = await bookingsService.createBooking({
        user_id: user.id!,
        class_id: selectedClassData.id,
        student_id: studentInfo.id,
        payment_amount: selectedClassData.price,
        payment_method: 'stripe',
        payment_status: 'held',
        booking_status: 'pending',
        stripe_payment_intent_id: paymentIntentId,
        notes: `Booking for ${selectedClassData.title} on ${formatDate(selectedClassData.date)} at ${formatTime(selectedClassData.time)}. Payment is on HOLD and will be charged 24 hours before class if minimum enrollment is reached.`
      })

      // Update enrolled count in the class
      await clasesService.updateClassEnrollment(selectedClassData.id, 1)
      
      // Send confirmation emails
      try {
        const emailResponse = await fetch('/api/booking-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: user.email,
            userName: studentInfo.parent_name || user.user_metadata?.full_name || 'Parent',
            studentName: studentInfo.child_name,
            classTitle: selectedClassData.title,
            classDate: selectedClassData.date,
            classTime: selectedClassData.time,
            classPrice: selectedClassData.price,
            bookingId: newBooking.id || `BK-${Date.now()}`
          })
        })

        if (!emailResponse.ok) {
          console.error('Failed to send confirmation emails')
        } else {
          console.log('Confirmation emails sent successfully')
        }
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError)
        // Don't fail the booking if email fails
      }
      
      // Payment successful, clear pending booking and show confirmation
      sessionStorage.removeItem('pendingBooking')
      setAuthStep('confirmation')
    } catch (error) {
      console.error('Payment/booking error:', error)
      setPaymentError('Booking creation failed. Please contact support.')
    }
    
    setPaymentLoading(false)
  }

  const handleBackToPayment = () => {
    setAuthStep('payment')
  }

  const handleCompleteBooking = () => {
    // Clear any pending booking data
    sessionStorage.removeItem('pendingBooking')
    
    const selectedClass = classes.find(c => c.id === selectedClassId)
    if (selectedClass) {
      alert(`Booking confirmed! ${selectedClass.title} for ${formatDate(selectedClass.date)} at ${formatTime(selectedClass.time)}`)
      onClose()
    }
  }

  const renderClassSelection = () => (
    <div className="space-y-6">
      {/* Available Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map((clase) => {
          const isClassFull = (clase.enrolled || 0) >= clase.maxStudents;
          return (
          <Card 
            key={clase.id} 
            className={`transition-all duration-300 border-2 ${
              isClassFull
                ? 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
                : selectedClassId === clase.id 
                  ? 'border-cocinarte-navy shadow-lg bg-cocinarte-navy/5 cursor-pointer' 
                  : 'border-slate-200 hover:border-cocinarte-navy/50 hover:shadow-md cursor-pointer hover:shadow-xl'
            }`}
            onClick={() => !isClassFull && handleClassSelect(clase.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 mb-2">
                    {clase.title}
                  </CardTitle>
                  {clase.description && (
                    <CardDescription className="text-slate-600 line-clamp-2 text-sm">
                      {clase.description}
                    </CardDescription>
                  )}
                </div>
                <Badge 
                  variant={selectedClassId === clase.id ? "default" : "secondary"}
                  className={`shrink-0 ${
                    selectedClassId === clase.id 
                      ? 'bg-cocinarte-navy text-white' 
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedClassId === clase.id ? 'Selected' : 'Select'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="bg-cocinarte-orange/20 p-1.5 rounded-lg">
                    <Calendar className="h-4 w-4 text-cocinarte-orange" />
                  </div>
                  <span className="font-medium">{formatDate(clase.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="bg-cocinarte-orange/10 p-1.5 rounded-lg">
                    <Clock className="h-4 w-4 text-cocinarte-orange" />
                  </div>
                  <span className="font-medium">{formatTime(clase.time)}</span>
                </div>
              </div>

              {/* Duration and Capacity */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="bg-slate-100 p-1.5 rounded-lg">
                    <Clock className="h-4 w-4 text-slate-500" />
                  </div>
                  <span>{clase.classDuration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="bg-slate-100 p-1.5 rounded-lg">
                    <Users className="h-4 w-4 text-slate-500" />
                  </div>
                  <span>{clase.minStudents}-{clase.maxStudents} students</span>
                </div>
              </div>

              {/* Price and Enrollment */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-500">${clase.price}</span>
                </div>
                <div className={`text-sm px-3 py-1 rounded-full ${
                  (clase.enrolled || 0) >= clase.maxStudents
                    ? 'bg-red-100 text-red-700 font-semibold'
                    : 'bg-slate-50 text-slate-500'
                }`}>
                  {(clase.enrolled || 0) >= clase.maxStudents 
                    ? 'Class Full' 
                    : `${clase.enrolled || 0} enrolled`
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        )}
      </div>

      {/* No Classes Message */}
      {classes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            No classes available
          </h3>
          <p className="text-slate-600">
            Check back soon for new cooking classes!
          </p>
        </div>
      )}

      {/* Selected Class Summary */}
      {selectedClassData && (
        <div className="bg-white border-2 border-gray-300 p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
              <ChefHat className="h-6 w-6 text-cocinarte-navy" />
            </div>
            <h3 className="text-xl font-bold text-cocinarte-navy">Ready to Book!</h3>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600">Class</span>
                  <p className="text-lg font-semibold text-slate-800">{selectedClassData.title}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Date & Time</span>
                  <p className="text-slate-800 font-medium">{formatDate(selectedClassData.date)} at {formatTime(selectedClassData.time)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600">Duration</span>
                  <p className="text-slate-800 font-medium">{selectedClassData.classDuration} minutes</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Price</span>
                  <p className="text-2xl font-bold text-cocinarte-navy">${selectedClassData.price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
        <Button 
          variant="outline" 
          onClick={onClose}
          size="lg"
          className="px-8"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleBookClass}
          disabled={!selectedClassId || (selectedClassData && (selectedClassData.enrolled || 0) >= selectedClassData.maxStudents)}
          size="lg"
          className={`px-8 ${
            selectedClassData && (selectedClassData.enrolled || 0) >= selectedClassData.maxStudents
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-cocinarte-red hover:bg-cocinarte-red/90 text-white'
          }`}
        >
          {selectedClassData && (selectedClassData.enrolled || 0) >= selectedClassData.maxStudents 
            ? 'Class Full' 
            : 'Book This Class'
          }
        </Button>
      </div>
    </div>
  )

  const renderLoginForm = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBackToClassSelection}
          className="text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Classes
        </Button>
      </div>


      {/* Login Form */}
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-slate-800">Sign In to Book</CardTitle>
          <CardDescription className="text-slate-600">Please sign in to complete your booking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {authMessage && (
              <Alert>
                <AlertDescription>{authMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={goBackToClassSelection}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={authLoading}
                className="flex-1 h-12 bg-cocinarte-red hover:bg-cocinarte-red/90 text-white"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </div>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={() => setAuthStep('signup')}
                className="text-cocinarte-red hover:underline font-semibold"
              >
                Sign up here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSignupForm = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBackToClassSelection}
          className="text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Classes
        </Button>
      </div>

      {/* Selected Class Summary */}
      {/* {selectedClassData && (
        <div className="bg-cocinarte-red/5 border border-cocinarte-red/20 rounded-lg p-4">
          <h4 className="font-semibold text-cocinarte-red mb-2">Booking:</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Class:</strong> {selectedClassData.title}</p>
            <p><strong>Date:</strong> {formatDate(selectedClassData.date)}</p>
            <p><strong>Time:</strong> {formatTime(selectedClassData.time)}</p>
            <p><strong>Price:</strong> ${selectedClassData.price}</p>
          </div>
        </div>
      )} */}

      {/* Signup Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-slate-800">Create Account</CardTitle>
          <CardDescription className="text-slate-600">Sign up to book your cooking class</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Parent Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent-name" className="text-sm font-semibold text-slate-700">Parent Name *</Label>
                <Input
                  id="parent-name"
                  type="text"
                  placeholder="Enter parent's full name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="child-name" className="text-sm font-semibold text-slate-700">Child Name *</Label>
                <Input
                  id="child-name"
                  type="text"
                  placeholder="Enter child's full name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-sm font-semibold text-slate-700">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Address *</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-semibold text-slate-700">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {authError && (
              <Alert variant="destructive">
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            {authMessage && (
              <Alert>
                <AlertDescription>{authMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={goBackToClassSelection}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={authLoading}
                className="flex-1 h-12 bg-cocinarte-red hover:bg-cocinarte-red/90 text-white"
              >
                {authLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </div>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => setAuthStep('login')}
                className="text-cocinarte-red hover:underline font-semibold"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPaymentForm = () => {
    const options = {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#1E3A8A',
        },
      },
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left Column - Class Details */}
        <div className="flex flex-col h-full">
          <Card className="border-slate-200 shadow-sm flex flex-col h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
                  <ChefHat className="h-5 w-5 text-cocinarte-navy" />
                </div>
                Class Details
              </CardTitle>
              <CardDescription className="text-slate-600">
                Review your selected cooking class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              {selectedClassData && (
                <>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-600">Class Name</span>
                      <p className="text-lg font-bold text-slate-800 mt-1">{selectedClassData.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="bg-cocinarte-orange/20 p-2 rounded-lg">
                          <Calendar className="h-4 w-4 text-cocinarte-orange" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-600">Date</span>
                          <p className="font-semibold text-slate-800">{formatDate(selectedClassData.date)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="bg-cocinarte-orange/20 p-2 rounded-lg">
                          <Clock className="h-4 w-4 text-cocinarte-orange" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-600">Time</span>
                          <p className="font-semibold text-slate-800">{formatTime(selectedClassData.time)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="bg-cocinarte-navy/20 p-2 rounded-lg">
                          <Clock className="h-4 w-4 text-cocinarte-navy" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-600">Duration</span>
                          <p className="font-semibold text-slate-800">{selectedClassData.classDuration} minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-slate-700">Total Amount</span>
                      <span className="text-3xl font-bold text-cocinarte-navy">${selectedClassData.price}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment Form */}
        <div className="flex flex-col h-full">
          <Card className="border-slate-200 shadow-sm flex flex-col h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
                  <CreditCard className="h-5 w-5 text-cocinarte-navy" />
                </div>
                Payment Information
              </CardTitle>
              <CardDescription className="text-slate-600">
                Securely pay with Stripe
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              {/* Payment Hold Notice */}
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">
                      Payment Authorization (Not a Charge)
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p className="font-medium">
                        Your card will be <strong>authorized</strong> but <strong>NOT charged</strong> immediately.
                      </p>
                      <ul className="list-disc list-inside space-y-1 mt-2 text-xs">
                        <li>We'll place a <strong>temporary hold</strong> on your card for ${selectedClassData?.price}</li>
                        <li><strong>You'll only be charged</strong> if the class reaches minimum enrollment 24 hours before start time</li>
                        <li><strong>If the class doesn't fill up</strong>, the hold will be released and you <strong>won't be charged</strong></li>
                        <li>The hold may appear as "pending" on your card statement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Alert>

              {!clientSecret ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cocinarte-navy"></div>
                  <span className="ml-2 text-slate-600">Loading payment form...</span>
                </div>
              ) : (
                <Elements stripe={stripePromise} options={options}>
                  <StripePaymentForm
                    amount={selectedClassData?.price || 0}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setAuthStep('class-selection')}
                    loading={paymentLoading}
                  />
                </Elements>
              )}
              {paymentError && !clientSecret && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{paymentError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const renderConfirmation = () => (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Booking Confirmed!</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Your cooking class has been successfully booked. You will receive a confirmation email shortly.
        </p>
      </div>

      {/* Payment Hold Reminder */}
      <Alert className="border-blue-200 bg-blue-50">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">
              Payment Status: Authorized (On Hold)
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Your payment of <strong>${selectedClassData?.price}</strong> is currently on hold and <strong>NOT yet charged</strong>.</p>
              <p className="mt-2">
                <strong>You will only be charged if:</strong> The class reaches minimum enrollment 24 hours before the start time.
              </p>
              <p>
                <strong>If the class doesn't fill up:</strong> The hold will be released automatically and you won't be charged.
              </p>
            </div>
          </div>
        </div>
      </Alert>

      {/* User Information */}
      {user && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-blue-700">Email Address</span>
                  <p className="text-blue-800 font-medium">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-700">Account Status</span>
                  <p className="text-blue-800 font-medium">Active</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-blue-700">Member Since</span>
                  <p className="text-blue-800 font-medium">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-700">Booking Date</span>
                  <p className="text-blue-800 font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Details */}
      {selectedClassData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-green-800 flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <ChefHat className="h-5 w-5 text-green-600" />
              </div>
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-green-700">Class</span>
                  <p className="text-green-800 font-medium">{selectedClassData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-green-700">Date & Time</span>
                  <p className="text-green-800 font-medium">{formatDate(selectedClassData.date)} at {formatTime(selectedClassData.time)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-green-700">Duration</span>
                  <p className="text-green-800 font-medium">{selectedClassData.classDuration} minutes</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-green-700">Amount Paid</span>
                  <p className="text-2xl font-bold text-green-800">${selectedClassData.price}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-cocinarte-navy text-white p-6 rounded-t-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <ChefHat className="h-8 w-8" />
              </div>
              Book Your Cooking Class
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              Choose from our available cooking classes and reserve your spot today!
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6">

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-slate-600">Loading classes...</span>
          </div>
        ) : authStep === 'class-selection' ? (
          renderClassSelection()
        ) : authStep === 'login' ? (
          renderLoginForm()
        ) : authStep === 'signup' ? (
          renderSignupForm()
        ) : authStep === 'payment' ? (
          renderPaymentForm()
        ) : authStep === 'confirmation' ? (
          renderConfirmation()
        ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}