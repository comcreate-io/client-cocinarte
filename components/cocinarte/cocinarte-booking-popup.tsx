"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Users, DollarSign, ChefHat, Eye, EyeOff, Mail, Lock, LogIn, UserPlus, ArrowLeft, CreditCard, CheckCircle, User, Ticket, X, LogOut, Baby, AlertCircle, Camera, CalendarDays } from "lucide-react"
import { Clase } from "@/lib/types/clases"
import { ClasesClientService } from "@/lib/supabase/clases-client"
import { StudentsClientService } from "@/lib/supabase/students-client"
import { BookingsClientService } from "@/lib/supabase/bookings-client"
import { CouponsClientService } from "@/lib/supabase/coupons-client"
import { ParentsClientService } from "@/lib/supabase/parents-client"
import { useAuth } from "@/contexts/auth-context"
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import StripePaymentForm from './stripe-payment-form'
import SignupQuestionnaireMultiChild from '../auth/signup-questionnaire-multi-child'
import { SignupFormData, ParentWithChildren, Child } from '@/types/student'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BookingPopupProps {
  isOpen: boolean
  onClose: () => void
  selectedClass?: Clase
  initialStep?: 'class-selection' | 'child-selection' | 'login' | 'signup' | 'payment' | 'confirmation' | 'account'
  initialSelectedClassId?: string
}

export default function CocinarteBookingPopup({ isOpen, onClose, selectedClass, initialStep, initialSelectedClassId }: BookingPopupProps) {
  const [classes, setClasses] = useState<Clase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(initialSelectedClassId || selectedClass?.id || null)
  
  // Authentication states
  const [authStep, setAuthStep] = useState<'class-selection' | 'child-selection' | 'login' | 'signup' | 'payment' | 'confirmation' | 'account'>(initialStep || 'class-selection')
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [parentWithChildren, setParentWithChildren] = useState<ParentWithChildren | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
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

  // Coupon states
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null)
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  // Child management states
  const [editingChildId, setEditingChildId] = useState<string | null>(null)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [childFormData, setChildFormData] = useState<Partial<Child>>({})
  const [childrenBookings, setChildrenBookings] = useState<{ [key: string]: any[] }>({})

  const { user, signIn, signUp, signUpWithStudentInfo, signOut } = useAuth()

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
    } else {
      // When popup closes, clear payment states to prevent reuse
      setClientSecret('')
      setPaymentIntentId('')
      setPaymentError('')
    }
  }, [isOpen, initialSelectedClassId, initialStep, user])

  // Auto-trigger booking flow when class is pre-selected from calendar
  useEffect(() => {
    const autoStartBooking = async () => {
      if (isOpen && initialSelectedClassId && selectedClassId && !initialStep && authStep === 'class-selection') {
        // A class was pre-selected (from calendar), auto-start the booking flow
        await handleBookClass()
      }
    }
    autoStartBooking()
  }, [isOpen, initialSelectedClassId, selectedClassId, initialStep])

  // Fetch student profile when viewing account page
  useEffect(() => {
    if (authStep === 'account' && user) {
      fetchStudentProfile()
    }
  }, [authStep, user])

  // Reload bookings when entering child-selection to check for existing bookings
  useEffect(() => {
    if (authStep === 'child-selection' && parentWithChildren?.children) {
      loadBookingsForChildren(parentWithChildren.children)
    }
  }, [authStep, parentWithChildren])

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
          
          // Format date if it's a Date object
          const classDate = selectedClassData.date instanceof Date 
            ? selectedClassData.date.toISOString().split('T')[0]
            : selectedClassData.date

          const finalAmount = calculateFinalPrice()

          const requestBody = {
            amount: finalAmount,
            classTitle: selectedClassData.title,
            userName: studentInfo?.parent_name || parentName || user.user_metadata?.full_name || 'Parent',
            studentName: studentInfo?.child_name || childName || 'Student',
            userEmail: user.email,
            classId: selectedClassData.id,
            classDate: classDate,
            classTime: selectedClassData.time,
          }

          console.log('Creating payment intent with data:', requestBody)

          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('Payment intent error response:', errorData)
            throw new Error(errorData.error || 'Failed to create payment intent')
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

  const handleBookClass = async () => {
    if (selectedClassId) {
      if (user) {
        // User is logged in, check if they have children to select
        try {
          const parentsService = new ParentsClientService()
          const parentData = await parentsService.getParentWithChildrenByUserId(user.id)

          if (parentData && parentData.children && parentData.children.length > 0) {
            // Parent has children, show child selection
            setParentWithChildren(parentData)
            if (parentData.children.length === 1) {
              // Only one child, auto-select and proceed to payment
              setSelectedChildId(parentData.children[0].id)
              setAuthStep('payment')
            } else {
              // Multiple children, show selection screen
              setAuthStep('child-selection')
            }
          } else {
            // No children found, proceed to payment (backward compatibility)
            setAuthStep('payment')
          }
        } catch (error) {
          console.error('Error fetching children:', error)
          // If error, proceed to payment (backward compatibility)
          setAuthStep('payment')
        }
      } else {
        // User not logged in, show auth flow
        setAuthStep('login')
      }
    }
  }

  // Coupon handling
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    if (!selectedClassId) {
      setCouponError('Please select a class first')
      return
    }

    setCouponValidating(true)
    setCouponError('')
    setCouponSuccess('')

    try {
      const couponsService = new CouponsClientService()
      const result = await couponsService.validateCoupon(
        couponCode.trim().toUpperCase(),
        selectedClassId
      )

      if (result.valid && result.coupon) {
        setAppliedCoupon({
          code: result.coupon.code,
          discount: result.coupon.discount_percentage
        })
        setCouponSuccess(`${result.coupon.discount_percentage}% discount applied!`)
        setCouponCode('')
      } else {
        setCouponError(result.error || 'Invalid coupon code')
      }
    } catch (error: any) {
      setCouponError('Failed to validate coupon')
    } finally {
      setCouponValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
    setCouponSuccess('')
  }

  // Calculate final price with coupon discount
  const calculateFinalPrice = () => {
    if (!selectedClassData) return 0
    if (!appliedCoupon) return selectedClassData.price

    const discount = (selectedClassData.price * appliedCoupon.discount) / 100
    return selectedClassData.price - discount
  }

  const getDiscountAmount = () => {
    if (!selectedClassData || !appliedCoupon) return 0
    return (selectedClassData.price * appliedCoupon.discount) / 100
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
    // Clear payment states to prevent reuse of old PaymentIntent
    setClientSecret('')
    setPaymentIntentId('')
    setPaymentError('')
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

      const finalPrice = calculateFinalPrice()
      const isFreeBooking = finalPrice === 0

      // Only verify Stripe payment if there's a charge
      if (!isFreeBooking) {
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
      } else {
        console.log('✅ Free booking (100% discount coupon applied)')
      }

      // Get or create student information
      console.log('Fetching student information...')
      const studentsService = new StudentsClientService()
      let studentInfo = await studentsService.getStudentByEmail(user.email!)

      // If using new parent/children structure, get child info
      let childInfo = null
      if (selectedChildId && parentWithChildren) {
        childInfo = parentWithChildren.children.find((c: Child) => c.id === selectedChildId)
        console.log('Using selected child:', childInfo?.child_full_name)
      }

      if (!studentInfo) {
        console.log('Student profile not found, creating one for backward compatibility...')

        // Determine parent and child names
        let parentNameForStudent = parentName
        let childNameForStudent = childName

        // If we have parent/child data from new structure, use it
        if (parentWithChildren && childInfo) {
          parentNameForStudent = parentWithChildren.parent_guardian_names
          childNameForStudent = childInfo.child_full_name
        } else {
          // Check if we have the required data from signup or session
          if (!parentName || !childName) {
            // Try to get from sessionStorage
            const pendingBooking = sessionStorage.getItem('pendingBooking')
            if (pendingBooking) {
              const bookingData = JSON.parse(pendingBooking)
              setParentName(bookingData.parentName || '')
              setChildName(bookingData.childName || '')
              setPhone(bookingData.phone || '')
              setAddress(bookingData.address || '')
              parentNameForStudent = bookingData.parentName || ''
              childNameForStudent = bookingData.childName || ''
            }
          }
        }

        // If still missing required data, show error
        if (!parentNameForStudent || !childNameForStudent) {
          setPaymentError('Missing required information. Please ensure you have completed your profile.')
          setPaymentLoading(false)
          return
        }

        // Create student profile (backward compatibility)
        try {
          studentInfo = await studentsService.createStudent({
            parent_name: parentNameForStudent,
            child_name: childNameForStudent,
            email: user.email!,
            phone: parentWithChildren?.parent_phone || phone || undefined,
            address: parentWithChildren?.address || address || undefined
          })
          console.log('Student profile created:', studentInfo.id)
        } catch (createError: any) {
          console.error('Error creating student profile:', createError)
          setPaymentError('Failed to create student profile. Please try again.')
          setPaymentLoading(false)
          return
        }
      } else {
        console.log('Student info found:', studentInfo.id)
      }

      // Create booking record
      console.log('Creating booking record...')
      const bookingsService = new BookingsClientService()
      const discountNote = appliedCoupon
        ? ` Coupon ${appliedCoupon.code} applied (${appliedCoupon.discount}% off, saved $${getDiscountAmount().toFixed(2)}).`
        : ''

      const newBooking = await bookingsService.createBooking({
        user_id: user.id!,
        class_id: selectedClassData.id,
        student_id: studentInfo.id,
        child_id: selectedChildId || undefined,
        payment_amount: finalPrice,
        payment_method: isFreeBooking ? 'coupon' : 'stripe',
        payment_status: isFreeBooking ? 'paid' : 'held',
        booking_status: isFreeBooking ? 'confirmed' : 'pending',
        stripe_payment_intent_id: isFreeBooking ? null : paymentIntentId,
        notes: isFreeBooking
          ? `Free booking for ${selectedClassData.title} on ${formatDate(selectedClassData.date)} at ${formatTime(selectedClassData.time)}.${discountNote}`
          : `Booking for ${selectedClassData.title} on ${formatDate(selectedClassData.date)} at ${formatTime(selectedClassData.time)}. Payment is on HOLD and will be charged 24 hours before class if minimum enrollment is reached.${discountNote}`
      })

      console.log('Booking created:', newBooking.id)

      // Mark coupon as used if one was applied
      if (appliedCoupon && user.id) {
        try {
          const couponsService = new CouponsClientService()
          const couponData = await couponsService.getCouponByCode(appliedCoupon.code)
          if (couponData) {
            await couponsService.markCouponAsUsed(couponData.id, user.id)
            console.log('Coupon marked as used:', appliedCoupon.code)
          }
        } catch (couponError) {
          console.error('Error marking coupon as used:', couponError)
          // Don't fail the booking if coupon update fails
        }
      }

      // Update enrolled count in the class
      console.log('Updating class enrollment...')
      await clasesService.updateClassEnrollment(selectedClassData.id, 1)
      console.log('Class enrollment updated')
      
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
      console.log('Booking completed successfully, showing confirmation...')
      sessionStorage.removeItem('pendingBooking')

      // Clear payment states to prevent reuse on future bookings
      setClientSecret('')
      setPaymentIntentId('')

      setAuthStep('confirmation')
      setPaymentLoading(false)
      console.log('Payment loading set to false')
    } catch (error) {
      console.error('Payment/booking error:', error)
      console.error('Error details:', error instanceof Error ? error.message : error)
      setPaymentError('Booking creation failed. Please contact support.')
      setPaymentLoading(false)
    }
  }

  const handleBackToPayment = () => {
    setAuthStep('payment')
  }

  const handleCompleteBooking = () => {
    // Clear any pending booking data
    sessionStorage.removeItem('pendingBooking')

    // Clear payment states
    setClientSecret('')
    setPaymentIntentId('')
    setPaymentError('')

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

  const handleQuestionnaireComplete = async (formData: SignupFormData) => {
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    try {
      // Store booking intent in sessionStorage before signup
      // Use the first child for booking purposes
      const firstChild = formData.children && formData.children.length > 0 ? formData.children[0] : null

      if (!firstChild) {
        setAuthError('Please add at least one child')
        setAuthLoading(false)
        return { error: new Error('No child information provided') }
      }

      const bookingData = {
        classId: selectedClassId,
        parentName: formData.parentInfo.parent_guardian_names,
        childName: firstChild.child_full_name,
        phone: formData.parentInfo.parent_phone,
        address: formData.parentInfo.address || '',
        email: formData.parentInfo.parent_email
      }
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))

      const { error } = await signUpWithStudentInfo(formData)

      if (error) {
        setAuthError(error.message || 'Failed to create account')
        sessionStorage.removeItem('pendingBooking')
        setAuthLoading(false)
        return { error }
      }

      setAuthMessage('Account created successfully! Proceeding to payment...')
      // The useEffect hook will handle the rest when user becomes available
      return { error: null }
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred')
      sessionStorage.removeItem('pendingBooking')
      setAuthLoading(false)
      return { error: err }
    }
  }

  const renderSignupForm = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2 mb-4">
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

      {/* Selected Class Info */}
      {selectedClassData && (
        <Alert className="bg-cocinarte-orange/10 border-cocinarte-orange">
          <ChefHat className="h-4 w-4 text-cocinarte-orange" />
          <AlertDescription className="text-cocinarte-navy">
            <strong>Booking:</strong> {selectedClassData.title} on {new Date(selectedClassData.date).toLocaleDateString()} at {selectedClassData.time}
          </AlertDescription>
        </Alert>
      )}

      {/* Signup Questionnaire */}
      <SignupQuestionnaireMultiChild
        onComplete={handleQuestionnaireComplete}
        loading={authLoading}
      />

      <div className="text-center pt-4">
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
    </div>
  )

  const renderChildSelection = () => (
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

      {/* Header */}
      <Card className="border-cocinarte-navy/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
              <Baby className="h-6 w-6 text-cocinarte-navy" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Select a Child for This Class
            </CardTitle>
          </div>
          <CardDescription className="text-slate-600">
            Which of your children will be attending this cooking class?
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Selected Class Info */}
      {selectedClassData && (
        <Alert className="bg-cocinarte-orange/10 border-cocinarte-orange">
          <ChefHat className="h-4 w-4 text-cocinarte-orange" />
          <AlertDescription className="text-cocinarte-navy">
            <strong>Booking:</strong> {selectedClassData.title} on {formatDate(selectedClassData.date)} at {formatTime(selectedClassData.time)}
          </AlertDescription>
        </Alert>
      )}

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {parentWithChildren?.children.map((child: Child) => {
          // Check if this child is already booked for the selected class
          const existingBooking = childrenBookings[child.id]?.find(
            (booking: any) => booking.class_id === selectedClassId &&
            (booking.status === 'confirmed' || booking.status === 'pending' || !booking.status)
          )
          const isAlreadyBooked = !!existingBooking

          return (
            <Card
              key={child.id}
              className={`transition-all duration-300 border-2 ${
                isAlreadyBooked
                  ? 'border-orange-300 bg-orange-50/50 opacity-75 cursor-not-allowed'
                  : selectedChildId === child.id
                    ? 'border-cocinarte-navy shadow-lg bg-cocinarte-navy/5 cursor-pointer'
                    : 'border-slate-200 hover:border-cocinarte-navy/50 hover:shadow-md cursor-pointer'
              }`}
              onClick={() => !isAlreadyBooked && setSelectedChildId(child.id)}
            >
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-800">{child.child_full_name}</h4>
                      {child.child_preferred_name && (
                        <p className="text-sm text-slate-600">Goes by: {child.child_preferred_name}</p>
                      )}
                    </div>
                    {isAlreadyBooked ? (
                      <Badge className="bg-orange-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Already Booked
                      </Badge>
                    ) : selectedChildId === child.id ? (
                      <Badge className="bg-cocinarte-navy">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    ) : null}
                  </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-slate-50">
                    Age {child.child_age}
                  </Badge>
                  {child.has_cooking_experience && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <ChefHat className="h-3 w-3 mr-1" />
                      Cooking experience
                    </Badge>
                  )}
                </div>

                {/* Health alerts if any */}
                {(child.allergies || child.dietary_restrictions) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs">
                    <div className="flex items-center gap-1 text-yellow-800">
                      <AlertCircle className="h-3 w-3" />
                      <span className="font-medium">Health Note:</span>
                    </div>
                    {child.allergies && (
                      <p className="text-yellow-700 mt-1">Allergies: {child.allergies}</p>
                    )}
                    {child.dietary_restrictions && (
                      <p className="text-yellow-700 mt-1">Dietary: {child.dietary_restrictions}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={goBackToClassSelection}
          size="lg"
          className="px-8"
        >
          Cancel
        </Button>
        <Button
          onClick={() => setAuthStep('payment')}
          disabled={!selectedChildId}
          size="lg"
          className="px-8 bg-cocinarte-red hover:bg-cocinarte-red/90 text-white"
        >
          Continue to Payment
        </Button>
      </div>
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
                  
                  <div className="border-t border-slate-200 pt-4 mt-auto space-y-3">
                    {appliedCoupon && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Original Price</span>
                          <span className="text-slate-800">${selectedClassData.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Ticket className="h-3 w-3" />
                            Discount ({appliedCoupon.discount}%)
                          </span>
                          <span className="text-green-600 font-medium">-${getDiscountAmount().toFixed(2)}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-2"></div>
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-slate-700">Total Amount</span>
                      <span className="text-3xl font-bold text-cocinarte-navy">${calculateFinalPrice().toFixed(2)}</span>
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
              {/* Coupon Section */}
              <div className="mb-6 space-y-3">
                {!appliedCoupon ? (
                  <>
                    <Label htmlFor="coupon">Have a Discount Coupon?</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        disabled={couponValidating}
                        className="uppercase"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || couponValidating}
                      >
                        {couponValidating ? 'Validating...' : 'Apply'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-800">{appliedCoupon.code}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {appliedCoupon.discount}% OFF
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {couponError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{couponError}</AlertDescription>
                  </Alert>
                )}
                {couponSuccess && (
                  <Alert className="py-2 border-green-200 bg-green-50">
                    <AlertDescription className="text-sm text-green-800">{couponSuccess}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Payment Hold Notice or Free Booking Notice */}
              {calculateFinalPrice() > 0 ? (
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
                          <li>We'll place a <strong>temporary hold</strong> on your card for ${calculateFinalPrice().toFixed(2)}</li>
                          <li><strong>You'll only be charged</strong> if the class reaches minimum enrollment 24 hours before start time</li>
                          <li><strong>If the class doesn't fill up</strong>, the hold will be released and you <strong>won't be charged</strong></li>
                          <li>The hold may appear as "pending" on your card statement</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Alert>
              ) : (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-green-800 mb-1">
                        Free Class - No Payment Required!
                      </h4>
                      <p className="text-sm text-green-700">
                        Your coupon covers the full cost of this class. Click "Book Now" to confirm your spot!
                      </p>
                    </div>
                  </div>
                </Alert>
              )}

              {calculateFinalPrice() === 0 ? (
                // Free booking - just show Book Now button
                <div className="space-y-4">
                  <Button
                    onClick={handlePaymentSuccess}
                    disabled={paymentLoading}
                    className="w-full bg-cocinarte-navy hover:bg-cocinarte-navy/90 text-white py-6 text-lg font-semibold rounded-xl"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Book Now - FREE
                      </>
                    )}
                  </Button>
                  {paymentError && (
                    <Alert variant="destructive">
                      <AlertDescription>{paymentError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                // Paid booking - show Stripe form
                <>
                  {!clientSecret ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cocinarte-navy"></div>
                      <span className="ml-2 text-slate-600">Loading payment form...</span>
                    </div>
                  ) : (
                    <Elements stripe={stripePromise} options={options}>
                      <StripePaymentForm
                        amount={calculateFinalPrice()}
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const fetchStudentProfile = async () => {
    if (!user?.email) return

    setLoadingProfile(true)
    try {
      const studentsService = new StudentsClientService()
      const profile = await studentsService.getStudentByEmail(user.email)
      setStudentProfile(profile)

      // Also fetch parent with children data
      const parentsService = new ParentsClientService()
      const parentData = await parentsService.getParentWithChildrenByUserId(user.id)
      setParentWithChildren(parentData)

      // Fetch bookings for each child
      if (parentData && parentData.children) {
        await loadBookingsForChildren(parentData.children)
      }
    } catch (error) {
      console.error('Error fetching student profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const loadBookingsForChildren = async (children: Child[]) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const bookingsMap: { [key: string]: any[] } = {}

      for (const child of children) {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select(`
            *,
            clases:class_id (
              id,
              title,
              date,
              time,
              price
            )
          `)
          .eq('child_id', child.id)
          .order('created_at', { ascending: false })
          .limit(5)

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

  const handleAddChild = () => {
    setIsAddingChild(true)
    setEditingChildId(null)
    setChildFormData({
      child_full_name: '',
      child_preferred_name: '',
      child_age: 0,
      allergies: '',
      dietary_restrictions: '',
      has_cooking_experience: false,
      cooking_experience_details: '',
      medical_conditions: '',
      emergency_medications: '',
      media_permission: false,
      authorized_pickup_persons: '',
      custody_restrictions: '',
      additional_notes: ''
    })
  }

  const handleEditChild = (child: Child) => {
    setEditingChildId(child.id)
    setIsAddingChild(false)
    setChildFormData(child)
  }

  const handleDeleteChild = async (childId: string) => {
    if (!confirm('Are you sure you want to delete this child? This action cannot be undone.')) {
      return
    }

    try {
      const parentsService = new ParentsClientService()
      await parentsService.deleteChild(childId)
      await fetchStudentProfile() // Refresh data
      setAuthMessage('Child deleted successfully')
      setTimeout(() => setAuthMessage(''), 3000)
    } catch (error) {
      console.error('Error deleting child:', error)
      setAuthError('Failed to delete child')
      setTimeout(() => setAuthError(''), 3000)
    }
  }

  const handleSaveChild = async () => {
    if (!childFormData.child_full_name || !childFormData.child_age) {
      setAuthError('Please fill in all required fields')
      setTimeout(() => setAuthError(''), 3000)
      return
    }

    try {
      const parentsService = new ParentsClientService()

      if (editingChildId) {
        // Update existing child
        await parentsService.updateChild(editingChildId, childFormData)
        setAuthMessage('Child updated successfully')
      } else {
        // Add new child
        if (!parentWithChildren?.id) {
          setAuthError('Parent information not found')
          return
        }
        await parentsService.addChild(parentWithChildren.id, childFormData as Child)
        setAuthMessage('Child added successfully')
      }

      // Reset form and refresh data
      setIsAddingChild(false)
      setEditingChildId(null)
      setChildFormData({})
      await fetchStudentProfile()
      setTimeout(() => setAuthMessage(''), 3000)
    } catch (error) {
      console.error('Error saving child:', error)
      setAuthError('Failed to save child')
      setTimeout(() => setAuthError(''), 3000)
    }
  }

  const handleCancelChildEdit = () => {
    setIsAddingChild(false)
    setEditingChildId(null)
    setChildFormData({})
  }

  const renderAccount = () => (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            My Account
          </CardTitle>
          <CardDescription className="text-blue-600">
            Your account and family information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingProfile ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-blue-600">Loading profile...</span>
            </div>
          ) : (
            <>
              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-semibold text-blue-700">Email Address</span>
                    <p className="text-blue-900 font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-blue-700">Account Status</span>
                    <p className="text-blue-900 font-medium">
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-blue-700">Member Since</span>
                    <p className="text-blue-900 font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-blue-700">User ID</span>
                    <p className="text-blue-900 font-medium text-xs">{user?.id?.substring(0, 8)}...</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-4"></div>

              {/* Parent Information */}
              {parentWithChildren ? (
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Parent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-blue-700">Name</span>
                      <p className="text-blue-900 font-medium">{parentWithChildren.parent_guardian_names}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-blue-700">Phone</span>
                      <p className="text-blue-900 font-medium">{parentWithChildren.parent_phone}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-blue-700">Preferred Contact</span>
                      <p className="text-blue-900 font-medium capitalize">{parentWithChildren.preferred_communication_method}</p>
                    </div>
                    {parentWithChildren.address && (
                      <div>
                        <span className="text-sm font-semibold text-blue-700">Address</span>
                        <p className="text-blue-900 font-medium">{parentWithChildren.address}</p>
                      </div>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  {parentWithChildren.emergency_contact_name && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-blue-600 font-medium">Name: </span>
                          <span className="text-blue-900">{parentWithChildren.emergency_contact_name}</span>
                        </div>
                        {parentWithChildren.emergency_contact_phone && (
                          <div>
                            <span className="text-blue-600 font-medium">Phone: </span>
                            <span className="text-blue-900">{parentWithChildren.emergency_contact_phone}</span>
                          </div>
                        )}
                        {parentWithChildren.emergency_contact_relationship && (
                          <div>
                            <span className="text-blue-600 font-medium">Relationship: </span>
                            <span className="text-blue-900">{parentWithChildren.emergency_contact_relationship}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="border-t border-blue-200 pt-4"></div>

              {/* Children Information */}
              {parentWithChildren && parentWithChildren.children && parentWithChildren.children.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                      <Baby className="h-5 w-5" />
                      My Children ({parentWithChildren.children.length})
                    </h3>
                    <Button
                      onClick={handleAddChild}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Child
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {parentWithChildren.children.map((child: Child) => (
                      <Card key={child.id} className="border-blue-200">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            {/* Child Basic Info */}
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-blue-900 text-lg">{child.child_full_name}</h4>
                                  {child.child_preferred_name && (
                                    <p className="text-sm text-blue-600">Preferred name: {child.child_preferred_name}</p>
                                  )}
                                </div>
                                {/* Desktop Edit/Delete Buttons */}
                                <div className="hidden sm:flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditChild(child)}
                                    className="border-blue-300 hover:bg-blue-50"
                                  >
                                    <span className="text-sm">Edit</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteChild(child.id)}
                                    className="border-red-300 hover:bg-red-50 text-red-600"
                                  >
                                    <span className="text-sm">Delete</span>
                                  </Button>
                                </div>
                              </div>

                              {/* Badges - stacked on mobile, horizontal on desktop */}
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                <Badge variant="outline" className="bg-blue-50 w-fit">
                                  Age: {child.child_age}
                                </Badge>
                                {child.has_cooking_experience && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                                    <ChefHat className="h-3 w-3 mr-1" />
                                    Has cooking experience
                                  </Badge>
                                )}
                                {child.media_permission ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                                    <Camera className="h-3 w-3 mr-1" />
                                    Media OK
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 w-fit">
                                    <Camera className="h-3 w-3 mr-1" />
                                    No media
                                  </Badge>
                                )}
                              </div>

                              {/* Mobile Edit/Delete Buttons */}
                              <div className="flex gap-2 sm:hidden">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditChild(child)}
                                  className="border-blue-300 hover:bg-blue-50 flex-1"
                                >
                                  <span className="text-sm">Edit</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteChild(child.id)}
                                  className="border-red-300 hover:bg-red-50 text-red-600 flex-1"
                                >
                                  <span className="text-sm">Delete</span>
                                </Button>
                              </div>
                            </div>

                            {/* Cooking Experience Details */}
                            {child.has_cooking_experience && child.cooking_experience_details && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-900">
                                  <span className="font-medium">Cooking Experience: </span>
                                  {child.cooking_experience_details}
                                </p>
                              </div>
                            )}

                            {/* Health & Safety Information */}
                            {(child.allergies || child.dietary_restrictions || child.medical_conditions || child.emergency_medications) && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-yellow-700" />
                                  <h5 className="text-sm font-semibold text-yellow-900">Health & Safety Information</h5>
                                </div>
                                {child.allergies && (
                                  <div className="text-sm">
                                    <span className="font-medium text-yellow-900">Allergies: </span>
                                    <span className="text-yellow-800">{child.allergies}</span>
                                  </div>
                                )}
                                {child.dietary_restrictions && (
                                  <div className="text-sm">
                                    <span className="font-medium text-yellow-900">Dietary Restrictions: </span>
                                    <span className="text-yellow-800">{child.dietary_restrictions}</span>
                                  </div>
                                )}
                                {child.medical_conditions && (
                                  <div className="text-sm">
                                    <span className="font-medium text-yellow-900">Medical Conditions: </span>
                                    <span className="text-yellow-800">{child.medical_conditions}</span>
                                  </div>
                                )}
                                {child.emergency_medications && (
                                  <div className="text-sm">
                                    <span className="font-medium text-yellow-900">Emergency Medications: </span>
                                    <span className="text-yellow-800">{child.emergency_medications}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Pick-up Information */}
                            {(child.authorized_pickup_persons || child.custody_restrictions) && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                                {child.authorized_pickup_persons && (
                                  <div className="text-sm">
                                    <span className="font-medium text-blue-900">Authorized Pick-up: </span>
                                    <span className="text-blue-800">{child.authorized_pickup_persons}</span>
                                  </div>
                                )}
                                {child.custody_restrictions && (
                                  <div className="text-sm">
                                    <span className="font-medium text-blue-900">Custody Restrictions: </span>
                                    <span className="text-blue-800">{child.custody_restrictions}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Additional Notes */}
                            {child.additional_notes && (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-sm text-gray-800">
                                  <span className="font-medium">Additional Notes: </span>
                                  {child.additional_notes}
                                </p>
                              </div>
                            )}

                            {/* Bookings Section */}
                            {childrenBookings[child.id] && childrenBookings[child.id].length > 0 && (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <CalendarDays className="h-4 w-4 text-orange-700" />
                                  <h5 className="text-sm font-semibold text-orange-900">
                                    Recent Bookings ({childrenBookings[child.id].length})
                                  </h5>
                                </div>
                                <div className="space-y-2">
                                  {childrenBookings[child.id].map((booking: any) => (
                                    <div key={booking.id} className="bg-white border border-orange-100 rounded p-2">
                                      <div className="font-medium text-sm text-orange-900">
                                        {booking.clases?.title || 'Class'}
                                      </div>
                                      <div className="text-xs text-orange-700 mt-1">
                                        {booking.clases?.date && new Date(booking.clases.date).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                        {booking.clases?.time && ` • ${booking.clases.time}`}
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={`mt-1 text-xs ${
                                          booking.status === 'confirmed' ? 'bg-green-50 text-green-800 border-green-200' :
                                          booking.status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                                          booking.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                                          'bg-blue-50 text-blue-800 border-blue-200'
                                        }`}
                                      >
                                        {booking.status || 'booked'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertDescription className="text-yellow-800">
                      No children found. Please add children information to your account.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleAddChild}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First Child
                  </Button>
                </div>
              )}

              {/* Child Form for Add/Edit */}
              {(isAddingChild || editingChildId) && (
                <Card className="border-green-200 bg-green-50 mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-green-900">
                      {editingChildId ? 'Edit Child Information' : 'Add New Child'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="child_full_name">Full Name *</Label>
                        <Input
                          id="child_full_name"
                          value={childFormData.child_full_name || ''}
                          onChange={(e) => setChildFormData({ ...childFormData, child_full_name: e.target.value })}
                          placeholder="Child's full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="child_preferred_name">Preferred Name</Label>
                        <Input
                          id="child_preferred_name"
                          value={childFormData.child_preferred_name || ''}
                          onChange={(e) => setChildFormData({ ...childFormData, child_preferred_name: e.target.value })}
                          placeholder="Nickname or preferred name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="child_age">Age *</Label>
                        <Input
                          id="child_age"
                          type="number"
                          value={childFormData.child_age || ''}
                          onChange={(e) => setChildFormData({ ...childFormData, child_age: parseInt(e.target.value) || 0 })}
                          placeholder="Child's age"
                        />
                      </div>
                      <div>
                        <Label htmlFor="allergies">Allergies</Label>
                        <Input
                          id="allergies"
                          value={childFormData.allergies || ''}
                          onChange={(e) => setChildFormData({ ...childFormData, allergies: e.target.value })}
                          placeholder="Any allergies"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                        <Input
                          id="dietary_restrictions"
                          value={childFormData.dietary_restrictions || ''}
                          onChange={(e) => setChildFormData({ ...childFormData, dietary_restrictions: e.target.value })}
                          placeholder="Dietary restrictions"
                        />
                      </div>
                      <div>
                        <Label htmlFor="medical_conditions">Medical Conditions</Label>
                        <Input
                          id="medical_conditions"
                          value={childFormData.medical_conditions || ''}
                          onChange={(e) => setChildFormData({ ...childFormData, medical_conditions: e.target.value })}
                          placeholder="Medical conditions"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        id="has_cooking_experience"
                        checked={childFormData.has_cooking_experience || false}
                        onChange={(e) => setChildFormData({ ...childFormData, has_cooking_experience: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="has_cooking_experience">Has cooking experience</Label>
                    </div>

                    {childFormData.has_cooking_experience && (
                      <div>
                        <Label htmlFor="cooking_experience_details">Cooking Experience Details</Label>
                        <Input
                          id="cooking_experience_details"
                          value={childFormData.cooking_experience_details || ''}
                          onChange={(e) => setChildFormData({ ...childFormData, cooking_experience_details: e.target.value })}
                          placeholder="Describe cooking experience"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 items-center">
                      <input
                        type="checkbox"
                        id="media_permission"
                        checked={childFormData.media_permission || false}
                        onChange={(e) => setChildFormData({ ...childFormData, media_permission: e.target.checked })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="media_permission">Media permission (photos/videos)</Label>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="outline"
                        onClick={handleCancelChildEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveChild}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {editingChildId ? 'Update Child' : 'Add Child'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setAuthStep('class-selection')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Button>
        <Button
          variant="destructive"
          onClick={async () => {
            await signOut()
            setStudentProfile(null)
            setParentWithChildren(null)
            onClose()
          }}
          className="gap-2 bg-cocinarte-red hover:bg-cocinarte-red/90"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )

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

      {/* Child Information */}
      {selectedChildId && parentWithChildren && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-purple-800 flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Baby className="h-5 w-5 text-purple-600" />
              </div>
              Child Attending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const child = parentWithChildren.children.find((c: Child) => c.id === selectedChildId)
              if (!child) return null

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-purple-700">Child Name</span>
                      <p className="text-purple-800 font-medium text-lg">{child.child_full_name}</p>
                      {child.child_preferred_name && (
                        <p className="text-sm text-purple-600">Goes by: {child.child_preferred_name}</p>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-purple-700">Age</span>
                      <p className="text-purple-800 font-medium text-lg">{child.child_age} years old</p>
                    </div>
                  </div>

                  {/* Cooking Experience */}
                  {child.has_cooking_experience && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <ChefHat className="h-4 w-4 text-green-700" />
                        <span className="text-sm font-semibold text-green-800">Has Cooking Experience</span>
                      </div>
                      {child.cooking_experience_details && (
                        <p className="text-sm text-green-700 ml-6">{child.cooking_experience_details}</p>
                      )}
                    </div>
                  )}

                  {/* Health & Safety Information */}
                  {(child.allergies || child.dietary_restrictions) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-700" />
                        <span className="text-sm font-semibold text-yellow-800">Health & Safety Notes</span>
                      </div>
                      <div className="space-y-1 ml-6">
                        {child.allergies && (
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">Allergies:</span> {child.allergies}
                          </p>
                        )}
                        {child.dietary_restrictions && (
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">Dietary Restrictions:</span> {child.dietary_restrictions}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
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
                {authStep === 'account' ? (
                  <User className="h-8 w-8" />
                ) : (
                  <ChefHat className="h-8 w-8" />
                )}
              </div>
              {authStep === 'account' ? 'My Account' : 'Book Your Cooking Class'}
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              {authStep === 'account'
                ? 'Manage your account and family information'
                : 'Choose from our available cooking classes and reserve your spot today!'
              }
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
        ) : authStep === 'child-selection' ? (
          renderChildSelection()
        ) : authStep === 'login' ? (
          renderLoginForm()
        ) : authStep === 'signup' ? (
          renderSignupForm()
        ) : authStep === 'account' ? (
          renderAccount()
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