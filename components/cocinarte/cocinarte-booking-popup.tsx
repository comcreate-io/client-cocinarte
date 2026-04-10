"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Users, DollarSign, ChefHat, Eye, EyeOff, Mail, Lock, LogIn, UserPlus, ArrowLeft, CreditCard, CheckCircle, User, Ticket, X, LogOut, Baby, AlertCircle, Camera, CalendarDays, Gift, Shield, FileCheck, XCircle, Loader2 } from "lucide-react"
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
import { SignupFormData, SignupFormDataMultiChild, ParentWithChildren, Child } from '@/types/student'
import GiftCardBalance from '@/components/gift-cards/gift-card-balance'
import ConsentManagement from '@/components/account/consent-management'
import { SignaturePad } from '@/components/consent/signature-pad'
import { SOCIAL_MEDIA_CONSENT_TEXT, LIABILITY_CONSENT_TEXT } from '@/types/consent'
import { Checkbox } from '@/components/ui/checkbox'

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
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([])
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
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, discountType: 'percentage' | 'fixed', discountAmount: number | null} | null>(null)
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  // Gift card states
  const [giftCardBalance, setGiftCardBalance] = useState<number | null>(null)
  const [useGiftCard, setUseGiftCard] = useState(false)
  const [giftCardAmountToUse, setGiftCardAmountToUse] = useState(0)

  // Child management states
  const [editingChildId, setEditingChildId] = useState<string | null>(null)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [childFormData, setChildFormData] = useState<Partial<Child>>({})
  const [childrenBookings, setChildrenBookings] = useState<{ [key: string]: any[] }>({})
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    booking: any
    childId: string
    title: string
    refundAmount: number
    isLateCancel: boolean
  }>({ open: false, booking: null, childId: '', title: '', refundAmount: 0, isLateCancel: false })
  const [cancelResultDialog, setCancelResultDialog] = useState<{ open: boolean; message: string; isError: boolean }>({ open: false, message: '', isError: false })

  // Consent form states for Add Child dialog
  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const [consentSignature, setConsentSignature] = useState<string | null>(null)
  const [consentSocialMedia, setConsentSocialMedia] = useState(false)
  const [consentLiability, setConsentLiability] = useState(false)
  const [consentParentName, setConsentParentName] = useState('')
  const [consentChildName, setConsentChildName] = useState('')
  const [consentSigning, setConsentSigning] = useState(false)
  // Store pending consent data for new children (not yet saved to DB)
  const [pendingConsentData, setPendingConsentData] = useState<{
    socialMediaConsent: boolean
    liabilityConsent: boolean
    parentNameSigned: string
    childNameSigned: string
    signatureDataUrl: string
  } | null>(null)

  // Booking comments state
  const [bookingComments, setBookingComments] = useState('')

  // Accompanying parent name for parent-child classes
  const [accompanyingParentName, setAccompanyingParentName] = useState('')

  // Guest booking states (legacy single-guest)
  const [isGuestBooking, setIsGuestBooking] = useState(false)
  const [guestChildName, setGuestChildName] = useState('')
  const [guestParentName, setGuestParentName] = useState('')
  const [guestParentEmail, setGuestParentEmail] = useState('')
  const [myGuestBookings, setMyGuestBookings] = useState<any[]>([])
  const [loadingGuestBookings, setLoadingGuestBookings] = useState(false)

  // Multi-guest booking states
  const [guestList, setGuestList] = useState<Array<{
    id: string
    childName: string
    parentName: string
    parentEmail: string
    isExisting: boolean
  }>>([])
  const [showAddGuestForm, setShowAddGuestForm] = useState(false)
  const [previousGuests, setPreviousGuests] = useState<Array<{
    guest_child_name: string
    guest_parent_name: string
    guest_parent_email: string
  }>>([])

  // Extra children pricing for Mommy & Me classes
  const EXTRA_CHILD_COST = 70 // Cost per extra child

  const { user, signIn, signUp, signUpWithStudentInfo, signOut } = useAuth()

  const selectedClassData = classes.find(c => c.id === selectedClassId)

  // Check if the selected class is a Mommy & Me / Chefcitos Together class
  const isMommyAndMeClass = (clase: Clase | undefined): boolean => {
    if (!clase) return false
    // Check by class_type or title keywords
    return clase.class_type === 'Chefcitos Together' ||
           clase.title?.toLowerCase().includes('mommy') ||
           clase.title?.toLowerCase().includes('mom') ||
           clase.title?.toLowerCase().includes('family') ||
           clase.title?.toLowerCase().includes('chefcitos together')
  }

  const isCurrentClassMommyAndMe = isMommyAndMeClass(selectedClassData)

  // Calculate extra children from selected children (first child is included, rest are extra)
  const extraChildren = isCurrentClassMommyAndMe ? Math.max(0, selectedChildIds.length - 1) : 0

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
      // Reset guest booking states
      setGuestList([])
      setShowAddGuestForm(false)
      setPreviousGuests([])
      setIsGuestBooking(false)
      setGuestChildName('')
      setGuestParentName('')
      setGuestParentEmail('')
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
    // Load previous guests when entering child-selection
    if (authStep === 'child-selection' && user) {
      const loadPreviousGuests = async () => {
        try {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const { data } = await supabase
            .from('guest_bookings')
            .select('guest_child_name, guest_parent_name, guest_parent_email')
            .eq('purchaser_user_id', user.id)
            .order('created_at', { ascending: false })
          // Deduplicate by email+childName
          const seen = new Set<string>()
          const unique = (data || []).filter(g => {
            const key = `${g.guest_parent_email}|${g.guest_child_name}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
          })
          setPreviousGuests(unique)
        } catch (err) {
          console.error('Error loading previous guests:', err)
        }
      }
      loadPreviousGuests()
    }
  }, [authStep, parentWithChildren, user])

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

          // Check for children before proceeding
          try {
            const parentsService = new ParentsClientService()
            const parentData = await parentsService.getParentWithChildrenByUserId(user.id)

            if (parentData && parentData.children && parentData.children.length > 0) {
              setParentWithChildren(parentData)

              // Fetch gift card balance
              try {
                const giftCardResponse = await fetch(`/api/gift-cards/balance?parentId=${parentData.id}`)
                const giftCardData = await giftCardResponse.json()
                if (giftCardResponse.ok) {
                  setGiftCardBalance(giftCardData.totalBalance || 0)
                }
              } catch (err) {
                console.error('Error fetching gift card balance:', err)
                setGiftCardBalance(0)
              }

              setAuthStep('child-selection')
              setAuthMessage('Account created successfully! Please select children to book.')
            } else {
              setAuthStep('payment')
              setAuthMessage('Account created successfully! Please complete your payment.')
            }
          } catch (err) {
            console.error('Error fetching children after signup:', err)
            setAuthStep('payment')
            setAuthMessage('Account created successfully! Please complete your payment.')
          }
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

          // Calculate the amount for all children + guests
          const ownChildrenCount = selectedChildIds.length
          const guestsCount = guestList.length
          const totalChildren = ownChildrenCount + guestsCount
          let finalAmount: number

          if (isCurrentClassMommyAndMe) {
            const extraOwn = Math.max(0, ownChildrenCount - 1)
            const ownCost = ownChildrenCount > 0 ? selectedClassData.price + extraOwn * EXTRA_CHILD_COST : 0
            finalAmount = ownCost + guestsCount * selectedClassData.price
          } else {
            finalAmount = totalChildren * selectedClassData.price
          }

          // Apply coupon if any
          if (appliedCoupon) {
            if (appliedCoupon.discountType === 'fixed' && appliedCoupon.discountAmount != null) {
              finalAmount = Math.max(0, finalAmount - appliedCoupon.discountAmount)
            } else {
              const discount = (finalAmount * appliedCoupon.discount) / 100
              finalAmount = finalAmount - discount
            }
          }

          // Apply gift card if enabled
          if (useGiftCard && giftCardAmountToUse > 0) {
            finalAmount = Math.max(0, finalAmount - giftCardAmountToUse)
          }

          console.log('Payment calculation:', {
            basePrice: selectedClassData.price,
            selectedChildIds,
            guestList: guestList.map(g => g.childName),
            ownChildrenCount,
            guestsCount,
            totalChildren,
            finalAmount,
            isMommyAndMe: isCurrentClassMommyAndMe,
            appliedCoupon,
            useGiftCard,
            giftCardAmountToUse
          })

          // Validation: Check for potential issues
          if (!selectedClassData.price || selectedClassData.price === 0) {
            console.error('⚠️ Class price is 0 or undefined!', {
              classId: selectedClassData.id,
              title: selectedClassData.title,
              price: selectedClassData.price
            })
            throw new Error('This class has no price set. Please contact support or try another class.')
          }

          if (totalChildren === 0 && !appliedCoupon) {
            console.error('⚠️ No children selected for booking!', {
              selectedChildIds,
              guestList
            })
            throw new Error('Please select at least one child or add a guest to continue.')
          }

          // Only allow $0 payment if it's due to 100% coupon or gift card covering everything
          const priceBeforeDiscounts = isCurrentClassMommyAndMe
            ? (ownChildrenCount > 0 ? selectedClassData.price + Math.max(0, ownChildrenCount - 1) * EXTRA_CHILD_COST : 0) + guestsCount * selectedClassData.price
            : totalChildren * selectedClassData.price

          if (finalAmount === 0 && priceBeforeDiscounts > 0) {
            console.log('✅ Free booking due to discount:', {
              priceBeforeDiscounts,
              finalAmount,
              appliedCoupon,
              giftCardAmountToUse
            })
          } else if (finalAmount === 0 && priceBeforeDiscounts === 0 && totalChildren > 0) {
            console.error('⚠️ Calculated price is $0 but children are selected!', {
              basePrice: selectedClassData.price,
              totalChildren,
              priceBeforeDiscounts
            })
            throw new Error('Unable to calculate price. The class price may not be set correctly.')
          }

          const requestBody = {
            amount: finalAmount,
            classTitle: selectedClassData.title,
            userName: studentInfo?.parent_name || parentName || user.user_metadata?.full_name || 'Parent',
            studentName: studentInfo?.child_name || childName || 'Student',
            userEmail: user.email,
            classId: selectedClassData.id,
            classDate: classDate,
            classTime: selectedClassData.time,
            extraChildren: isCurrentClassMommyAndMe ? Math.max(0, ownChildrenCount - 1) : 0,
            totalChildren: totalChildren,
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
  }, [authStep, selectedClassData, user, clientSecret, selectedChildIds, isCurrentClassMommyAndMe, appliedCoupon, useGiftCard, giftCardAmountToUse, guestList])

  const formatDate = (dateString: string) => {
    // Parse date string as local time to avoid timezone shift
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
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

            // Fetch gift card balance
            try {
              const giftCardResponse = await fetch(`/api/gift-cards/balance?parentId=${parentData.id}`)
              const giftCardData = await giftCardResponse.json()
              if (giftCardResponse.ok) {
                setGiftCardBalance(giftCardData.totalBalance || 0)
              }
            } catch (err) {
              console.error('Error fetching gift card balance:', err)
              setGiftCardBalance(0)
            }

            // Check if this is a Mommy & Me class
            const isMomMeClass = isMommyAndMeClass(classes.find(c => c.id === selectedClassId))

            // Always show child-selection screen (supports multi-child + guest booking)
            setAuthStep('child-selection')
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
        const coupon = result.coupon
        setAppliedCoupon({
          code: coupon.code,
          discount: coupon.discount_percentage || 0,
          discountType: coupon.discount_type || 'percentage',
          discountAmount: coupon.discount_amount,
        })
        const successMsg = coupon.discount_type === 'fixed'
          ? `$${coupon.discount_amount} discount applied!`
          : `${coupon.discount_percentage}% discount applied!`
        setCouponSuccess(successMsg)
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

  // Calculate cost for own children
  const getOwnChildrenCost = () => {
    if (!selectedClassData) return 0
    if (isCurrentClassMommyAndMe) {
      // Mommy & Me: first child = base price, extras at $70
      if (selectedChildIds.length === 0) return 0
      return selectedClassData.price + extraChildren * EXTRA_CHILD_COST
    }
    // Regular classes: each child = full price
    return selectedChildIds.length * selectedClassData.price
  }

  // Calculate cost for guests
  const getGuestsCost = () => {
    if (!selectedClassData) return 0
    return guestList.length * selectedClassData.price
  }

  // Calculate extra children cost (Mommy & Me only, kept for backward compat)
  const getExtraChildrenCost = () => {
    return extraChildren * EXTRA_CHILD_COST
  }

  // Get the total price before any discounts (own children + guests)
  const getTotalBeforeDiscounts = () => {
    return getOwnChildrenCost() + getGuestsCost()
  }

  // Calculate final price with coupon discount, gift card
  const calculateFinalPrice = () => {
    const ownCost = getOwnChildrenCost()
    const guestsCost = getGuestsCost()
    let price = getTotalBeforeDiscounts()

    // Debug logging to identify when price is 0
    if (price === 0) {
      console.warn('⚠️ calculateFinalPrice: Base price is $0', {
        selectedClassData: selectedClassData ? {
          id: selectedClassData.id,
          title: selectedClassData.title,
          price: selectedClassData.price
        } : null,
        selectedChildIds,
        guestList: guestList.map(g => g.childName),
        ownCost,
        guestsCost,
        isCurrentClassMommyAndMe
      })
    }

    if (price === 0 && !selectedClassData) return 0

    const priceBeforeDiscounts = price

    // Apply coupon discount first
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'fixed' && appliedCoupon.discountAmount != null) {
        price = Math.max(0, price - appliedCoupon.discountAmount)
      } else {
        const discount = (price * appliedCoupon.discount) / 100
        price = price - discount
      }
    }

    // Then apply gift card if enabled
    if (useGiftCard && giftCardAmountToUse > 0) {
      price = Math.max(0, price - giftCardAmountToUse)
    }

    // Log when final price becomes 0 after discounts
    if (price === 0 && priceBeforeDiscounts > 0) {
      console.log('✅ Final price is $0 due to discounts:', {
        priceBeforeDiscounts,
        appliedCoupon,
        giftCardAmountToUse
      })
    }

    return price
  }

  // Calculate price after coupon but before gift card
  const getPriceAfterCoupon = () => {
    let basePrice = getTotalBeforeDiscounts()
    if (!appliedCoupon) return basePrice
    if (appliedCoupon.discountType === 'fixed' && appliedCoupon.discountAmount != null) {
      return Math.max(0, basePrice - appliedCoupon.discountAmount)
    }
    const discount = (basePrice * appliedCoupon.discount) / 100
    return basePrice - discount
  }

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0
    let basePrice = getTotalBeforeDiscounts()
    if (appliedCoupon.discountType === 'fixed' && appliedCoupon.discountAmount != null) {
      return Math.min(appliedCoupon.discountAmount, basePrice)
    }
    return (basePrice * appliedCoupon.discount) / 100
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setAuthError(error.message)
      setAuthLoading(false)
      return
    }

    setAuthMessage('Successfully signed in!')

    // After successful login, check for children (same flow as handleBookClass)
    try {
      const { data: { user: currentUser } } = await (await import('@/lib/supabase/client')).createClient().auth.getUser()
      if (currentUser) {
        const parentsService = new ParentsClientService()
        const parentData = await parentsService.getParentWithChildrenByUserId(currentUser.id)

        if (parentData && parentData.children && parentData.children.length > 0) {
          setParentWithChildren(parentData)

          // Fetch gift card balance
          try {
            const giftCardResponse = await fetch(`/api/gift-cards/balance?parentId=${parentData.id}`)
            const giftCardData = await giftCardResponse.json()
            if (giftCardResponse.ok) {
              setGiftCardBalance(giftCardData.totalBalance || 0)
            }
          } catch (err) {
            console.error('Error fetching gift card balance:', err)
            setGiftCardBalance(0)
          }

          setAuthStep('child-selection')
        } else {
          setAuthStep('payment')
        }
      } else {
        setAuthStep('payment')
      }
    } catch (err) {
      console.error('Error fetching children after login:', err)
      setAuthStep('payment')
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
    // Reset child selection when going back
    setSelectedChildId(null)
    setSelectedChildIds([])
    setBookingComments('')
    // Reset guest list
    setGuestList([])
    setShowAddGuestForm(false)
    setPreviousGuests([])
    setIsGuestBooking(false)
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
      const reservedSpots = currentClass.reserved_spots || 0
      const maxStudents = currentClass.maxStudents || 0

      const totalBookingChildren = selectedChildIds.length + guestList.length
      if (enrolled + reservedSpots + totalBookingChildren > maxStudents) {
        const spotsLeft = maxStudents - enrolled - reservedSpots
        if (spotsLeft <= 0) {
          setPaymentError('Sorry, this class is now full. Please choose another class.')
        } else {
          setPaymentError(`Not enough spots available. Only ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left in this class.`)
        }
        setPaymentLoading(false)
        return
      }

      const finalPrice = calculateFinalPrice()
      const isFreeBooking = finalPrice === 0

      // Only verify Stripe payment if there's a charge
      if (!isFreeBooking) {
        // Verify payment was successful with Stripe
        console.log('Verifying payment with Stripe...')
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

        if (verifyData.status !== 'succeeded') {
          setPaymentError(`Payment failed. Status: ${verifyData.status}. Please try again.`)
          setPaymentLoading(false)
          return
        }

        console.log('✅ Payment completed successfully')
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
        ? ` Coupon ${appliedCoupon.code} applied (${appliedCoupon.discountType === 'fixed' ? `$${appliedCoupon.discountAmount} off` : `${appliedCoupon.discount}% off`}, saved $${getDiscountAmount().toFixed(2)}).`
        : ''
      const giftCardNote = useGiftCard && giftCardAmountToUse > 0
        ? ` Gift card used: $${giftCardAmountToUse.toFixed(2)}.`
        : ''
      // Get all children names for notes
      const selectedChildrenNames = selectedChildIds.length > 0 && parentWithChildren
        ? parentWithChildren.children
            .filter(c => selectedChildIds.includes(c.id))
            .map(c => c.child_full_name)
        : []
      const guestNames = guestList.map(g => g.childName)
      const allChildNames = [...selectedChildrenNames, ...guestNames]
      const childrenNote = allChildNames.length > 0
        ? ` Children: ${selectedChildrenNames.join(', ')}${guestNames.length > 0 ? `. Guests: ${guestNames.join(', ')}` : ''}.`
        : ''

      console.log('Creating booking with:', {
        selectedChildIds,
        guestList: guestList.map(g => g.childName),
        extraChildren,
        isCurrentClassMommyAndMe,
        allChildNames,
        finalPrice
      })

      // Only create primary booking if the user selected their own children
      // (skip for guest-only purchases to avoid duplicate entries)
      const isGuestOnlyPurchase = selectedChildIds.length === 0 && guestList.length > 0
      let primaryBookingId: string | null = null

      if (!isGuestOnlyPurchase) {
        // Calculate discounted own-children cost for accurate payment_amount
        const totalBeforeDiscount = getTotalBeforeDiscounts()
        const ownCostBeforeDiscount = getOwnChildrenCost()
        const ownCostAfterDiscount = totalBeforeDiscount > 0
          ? (ownCostBeforeDiscount / totalBeforeDiscount) * finalPrice
          : 0

        // Create individual booking for each selected child
        for (let i = 0; i < selectedChildIds.length; i++) {
          const childId = selectedChildIds[i]
          const childData = parentWithChildren?.children.find((c: Child) => c.id === childId)
          const childFullName = childData?.child_full_name || 'Child'

          // Calculate per-child payment amount
          let perChildPayment: number
          if (selectedChildIds.length === 1) {
            // Single child: gets the full discounted own cost (or finalPrice if no guests)
            perChildPayment = guestList.length > 0 ? ownCostAfterDiscount : finalPrice
          } else if (isCurrentClassMommyAndMe) {
            // Mommy & Me: proportional share based on base vs extra pricing
            const perChildBeforeDiscount = i === 0 ? selectedClassData.price : EXTRA_CHILD_COST
            perChildPayment = ownCostBeforeDiscount > 0
              ? (perChildBeforeDiscount / ownCostBeforeDiscount) * ownCostAfterDiscount
              : 0
          } else {
            // Regular class: split evenly among own children
            perChildPayment = ownCostAfterDiscount / selectedChildIds.length
          }

          const bookingData: any = {
            user_id: user.id!,
            class_id: selectedClassData.id,
            student_id: studentInfo.id,
            child_id: childId,
            payment_amount: Math.round(perChildPayment * 100) / 100,
            payment_method: isFreeBooking ? 'coupon' : 'stripe',
            payment_status: 'completed',
            booking_status: 'confirmed',
            stripe_payment_intent_id: isFreeBooking ? null : paymentIntentId,
            gift_card_amount_used: i === 0 && useGiftCard && giftCardAmountToUse > 0 ? giftCardAmountToUse : undefined,
            parent_id: parentWithChildren?.id || undefined,
            booking_comments: i === 0 ? (bookingComments || undefined) : undefined,
            accompanying_parent_name: selectedClassData.requires_parent ? accompanyingParentName : undefined,
            notes: isFreeBooking
              ? `Free booking for ${childFullName} - ${selectedClassData.title} on ${formatDate(selectedClassData.date)} at ${formatTime(selectedClassData.time)}.${discountNote}${giftCardNote}${i === 0 ? childrenNote : ''}`
              : `Booking for ${childFullName} - ${selectedClassData.title} on ${formatDate(selectedClassData.date)} at ${formatTime(selectedClassData.time)}. Payment completed.${discountNote}${giftCardNote}${i === 0 ? childrenNote : ''}`
          }

          const newBooking = await bookingsService.createBooking(bookingData)
          if (i === 0) primaryBookingId = newBooking.id
          console.log(`Booking created for ${childFullName}: ${newBooking.id}`)
        }
      } else {
        console.log('Guest-only purchase, skipping primary booking creation')
      }

      // Create guest booking records for each guest in the guestList
      // Calculate discounted guest cost
      const totalBeforeDiscountForGuests = getTotalBeforeDiscounts()
      const guestCostBeforeDiscount = getGuestsCost()
      const perGuestAfterDiscount = totalBeforeDiscountForGuests > 0 && guestList.length > 0
        ? ((guestCostBeforeDiscount / totalBeforeDiscountForGuests) * finalPrice) / guestList.length
        : selectedClassData.price

      for (const guest of guestList) {
        try {
          console.log(`Creating guest booking for ${guest.childName}...`)
          const guestBookingData: any = {
            user_id: user.id!,
            class_id: selectedClassData.id,
            student_id: studentInfo.id,
            child_id: null,
            payment_amount: Math.round(perGuestAfterDiscount * 100) / 100,
            payment_method: isFreeBooking ? 'coupon' : 'stripe',
            payment_status: 'completed',
            booking_status: 'confirmed',
            stripe_payment_intent_id: isFreeBooking ? null : paymentIntentId,
            parent_id: parentWithChildren?.id || undefined,
            accompanying_parent_name: selectedClassData.requires_parent ? accompanyingParentName : undefined,
            is_guest_booking: true,
            notes: `Guest booking for ${guest.childName} (parent: ${guest.parentName}, ${guest.parentEmail}).`
          }
          const guestBooking = await bookingsService.createBooking(guestBookingData)
          console.log(`Guest booking created: ${guestBooking.id}`)

          // Create guest_bookings record + send emails
          const guestCreateRes = await fetch('/api/guest-booking/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking_id: guestBooking.id,
              purchaser_user_id: user.id,
              purchaser_name: parentWithChildren?.parent_guardian_names || studentInfo.parent_name || user.user_metadata?.full_name || 'Parent',
              purchaser_email: user.email,
              guest_parent_name: guest.parentName,
              guest_parent_email: guest.parentEmail,
              guest_child_name: guest.childName,
            }),
          })
          const guestCreateData = await guestCreateRes.json()

          if (guestCreateData.success) {
            console.log(`Sending guest emails for ${guest.childName}...`)
            await fetch('/api/guest-booking/send-emails', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                purchaser_name: parentWithChildren?.parent_guardian_names || studentInfo.parent_name || user.user_metadata?.full_name || 'Parent',
                purchaser_email: user.email,
                guest_parent_name: guest.parentName,
                guest_parent_email: guest.parentEmail,
                guest_child_name: guest.childName,
                class_title: selectedClassData.title,
                class_date: selectedClassData.date,
                class_time: selectedClassData.time,
                class_price: selectedClassData.price,
                form_token: guestCreateData.form_token,
                booking_id: guestBooking.id,
              }),
            })
            console.log(`Guest emails sent for ${guest.childName}`)
          }
        } catch (guestError) {
          console.error(`Error in guest booking flow for ${guest.childName}:`, guestError)
          // Don't fail the primary booking if guest flow fails
        }
      }

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
        }
      }

      // Deduct gift card balance if used
      if (useGiftCard && giftCardAmountToUse > 0 && parentWithChildren?.id) {
        try {
          const giftCardResponse = await fetch('/api/gift-cards/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              parentId: parentWithChildren.id,
              amount: giftCardAmountToUse,
              bookingId: primaryBookingId,
              description: `Payment for ${selectedClassData.title} on ${formatDate(selectedClassData.date)}`
            })
          })
          if (giftCardResponse.ok) {
            console.log('Gift card balance deducted:', giftCardAmountToUse)
          } else {
            console.error('Error deducting gift card balance')
          }
        } catch (giftCardError) {
          console.error('Error deducting gift card balance:', giftCardError)
        }
      }

      // Update enrolled count for ALL children + guests
      const totalEnrollment = selectedChildIds.length + guestList.length
      console.log(`Updating class enrollment by ${totalEnrollment}...`)
      await clasesService.updateClassEnrollment(selectedClassData.id, totalEnrollment)
      console.log('Class enrollment updated')

      // Send confirmation emails
      try {
        const emailChildrenNames = parentWithChildren && selectedChildIds.length > 0
          ? parentWithChildren.children
              .filter(c => selectedChildIds.includes(c.id))
              .map(c => c.child_full_name)
          : [studentInfo.child_name]

        const emailResponse = await fetch('/api/booking-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: user.email,
            userName: studentInfo.parent_name || user.user_metadata?.full_name || 'Parent',
            studentName: emailChildrenNames.length > 0 ? emailChildrenNames[0] : studentInfo.child_name,
            classTitle: selectedClassData.title,
            classDate: selectedClassData.date,
            classTime: selectedClassData.time,
            classPrice: finalPrice,
            basePrice: selectedClassData.price,
            extraChildren: isCurrentClassMommyAndMe ? extraChildren : Math.max(0, selectedChildIds.length - 1),
            extraChildrenCost: isCurrentClassMommyAndMe && extraChildren > 0 ? extraChildren * EXTRA_CHILD_COST : 0,
            selectedChildrenNames: emailChildrenNames,
            guestChildren: guestList.map(g => ({ childName: g.childName, parentName: g.parentName, parentEmail: g.parentEmail })),
            bookingId: primaryBookingId || `BK-${Date.now()}`
          })
        })

        if (!emailResponse.ok) {
          console.error('Failed to send confirmation emails')
        } else {
          console.log('Confirmation emails sent successfully')
        }
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError)
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

  const handleQuestionnaireComplete = async (formData: SignupFormDataMultiChild) => {
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

  const renderChildSelection = () => {
    // Helper to toggle child selection for Mommy & Me classes
    const handleChildToggle = (childId: string) => {
      // Multi-select for all class types
      setSelectedChildIds(prev => {
        if (prev.includes(childId)) {
          const newIds = prev.filter(id => id !== childId)
          setSelectedChildId(newIds.length > 0 ? newIds[0] : null)
          return newIds
        } else {
          const newIds = [...prev, childId]
          setSelectedChildId(newIds[0])
          return newIds
        }
      })
    }

    const isChildSelected = (childId: string) => selectedChildIds.includes(childId)

    // Helper to check if child meets age requirements
    const meetsAgeRequirements = (childAge: number | null | undefined): { meets: boolean; reason?: string } => {
      if (!childAge) return { meets: true } // If no age provided, allow booking
      if (!selectedClassData) return { meets: true }

      const minAge = selectedClassData.min_age
      const maxAge = selectedClassData.max_age

      if (minAge && childAge < minAge) {
        return { meets: false, reason: `Minimum age: ${minAge} years` }
      }
      if (maxAge && childAge > maxAge) {
        return { meets: false, reason: `Maximum age: ${maxAge} years` }
      }

      return { meets: true }
    }

    const canContinue = (selectedChildIds.length > 0 || guestList.length > 0) &&
      (!selectedClassData?.requires_parent || accompanyingParentName.trim() !== '')

    return (
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
              Select Children for This Class
            </CardTitle>
          </div>
          <CardDescription className="text-slate-600">
            Select your children and/or add guest children who will be attending this cooking class.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Pricing info */}
      {isCurrentClassMommyAndMe ? (
        <Alert className="bg-purple-50 border-purple-200">
          <Users className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Mommy & Me Pricing:</strong> First child is ${selectedClassData?.price}, each additional own child is ${EXTRA_CHILD_COST}, each guest is ${selectedClassData?.price}.
          </AlertDescription>
        </Alert>
      ) : (
        (selectedChildIds.length > 1 || guestList.length > 0) && selectedClassData && (
          <Alert className="bg-blue-50 border-blue-200">
            <Users className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Pricing:</strong> ${selectedClassData.price} per child.
            </AlertDescription>
          </Alert>
        )
      )}

      {/* Selected Class Info */}
      {selectedClassData && (
        <Alert className="bg-cocinarte-orange/10 border-cocinarte-orange">
          <ChefHat className="h-4 w-4 text-cocinarte-orange" />
          <AlertDescription className="text-cocinarte-navy">
            <strong>Booking:</strong> {selectedClassData.title} on {formatDate(selectedClassData.date)} at {formatTime(selectedClassData.time)}
            {(selectedClassData.min_age || selectedClassData.max_age) && (
              <span className="block mt-1 text-sm">
                <strong>Age Range:</strong> {selectedClassData.min_age || 'Any'} - {selectedClassData.max_age || 'Any'} years
              </span>
            )}
            {selectedClassData.requires_parent && (
              <span className="block mt-1 text-sm">
                <strong>⚠️ Parent Participation Required:</strong> A parent/guardian must attend and participate in this class with the child.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* My Children section */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-3">My Children</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parentWithChildren?.children.map((child: Child) => {
            const existingBooking = childrenBookings[child.id]?.find(
              (booking: any) => booking.class_id === selectedClassId &&
              (booking.booking_status === 'confirmed' || booking.booking_status === 'pending' || !booking.booking_status)
            )
            const isAlreadyBooked = !!existingBooking
            const ageCheck = meetsAgeRequirements(child.child_age)
            const isAgeRestricted = !ageCheck.meets
            const cannotSelect = isAlreadyBooked || isAgeRestricted
            const isSelected = isChildSelected(child.id)
            const selectionIndex = selectedChildIds.indexOf(child.id)

            return (
              <Card
                key={child.id}
                className={`transition-all duration-300 border-2 ${
                  cannotSelect
                    ? 'border-gray-300 bg-gray-50/50 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'border-cocinarte-navy shadow-lg bg-cocinarte-navy/5 cursor-pointer'
                      : 'border-slate-200 hover:border-cocinarte-navy/50 hover:shadow-md cursor-pointer'
                }`}
                onClick={() => !cannotSelect && handleChildToggle(child.id)}
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
                      ) : isAgeRestricted ? (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Age Restricted
                        </Badge>
                      ) : isSelected ? (
                        <Badge className="bg-cocinarte-navy">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isCurrentClassMommyAndMe && selectedChildIds.length > 1
                            ? `Selected #${selectionIndex + 1}${selectionIndex === 0 ? ' (included)' : ` (+$${EXTRA_CHILD_COST})`}`
                            : 'Selected'}
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

                    {isAgeRestricted && ageCheck.reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs">
                        <div className="flex items-center gap-1 text-red-800">
                          <AlertCircle className="h-3 w-3" />
                          <span className="font-medium">{ageCheck.reason}</span>
                        </div>
                        <p className="text-red-700 mt-1">This child cannot be booked for this class.</p>
                      </div>
                    )}

                    {!isAgeRestricted && (child.allergies || child.dietary_restrictions) && (
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
      </div>

      {/* Guest Children section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700">Guest Children</h4>
          {!showAddGuestForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddGuestForm(true)}
              className="text-[#1E3A8A] border-[#1E3A8A]/30 hover:bg-[#1E3A8A]/5"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add a Guest
            </Button>
          )}
        </div>

        {/* List of added guests */}
        {guestList.length > 0 && (
          <div className="space-y-2 mb-4">
            {guestList.map((guest) => (
              <div key={guest.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{guest.childName}</p>
                  <p className="text-xs text-slate-500">Parent: {guest.parentName} ({guest.parentEmail})</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGuestList(prev => prev.filter(g => g.id !== guest.id))}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add guest form */}
        {showAddGuestForm && (
          <Card className="border-[#1E3A8A]/20 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-[#1E3A8A]" />
                  Add Guest Child
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddGuestForm(false)
                    setGuestChildName('')
                    setGuestParentName('')
                    setGuestParentEmail('')
                  }}
                  className="text-slate-500 hover:text-slate-700 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Previous guests dropdown */}
              {previousGuests.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Select from Previous Guests</Label>
                  <select
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                    defaultValue=""
                    onChange={(e) => {
                      const idx = parseInt(e.target.value)
                      if (!isNaN(idx) && previousGuests[idx]) {
                        const pg = previousGuests[idx]
                        setGuestChildName(pg.guest_child_name)
                        setGuestParentName(pg.guest_parent_name)
                        setGuestParentEmail(pg.guest_parent_email)
                      }
                    }}
                  >
                    <option value="" disabled>-- Select a previous guest --</option>
                    {previousGuests.map((pg, i) => (
                      <option key={i} value={i}>
                        {pg.guest_child_name} (parent: {pg.guest_parent_name})
                      </option>
                    ))}
                  </select>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center text-xs"><span className="bg-blue-50 px-2 text-slate-500">or enter manually</span></div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="guest-child-name" className="text-sm font-medium text-slate-700">
                  Guest Child's Name *
                </Label>
                <Input
                  id="guest-child-name"
                  value={guestChildName}
                  onChange={(e) => setGuestChildName(e.target.value)}
                  placeholder="Child's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-parent-name" className="text-sm font-medium text-slate-700">
                  Guest Parent's Name *
                </Label>
                <Input
                  id="guest-parent-name"
                  value={guestParentName}
                  onChange={(e) => setGuestParentName(e.target.value)}
                  placeholder="Parent's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-parent-email" className="text-sm font-medium text-slate-700">
                  Guest Parent's Email *
                </Label>
                <Input
                  id="guest-parent-email"
                  type="email"
                  value={guestParentEmail}
                  onChange={(e) => setGuestParentEmail(e.target.value)}
                  placeholder="parent@email.com"
                />
              </div>
              <p className="text-xs text-slate-500">
                An enrollment form will be sent to this email after payment. The guest parent will need to complete the child's details and sign consent forms.
              </p>
              <Button
                onClick={() => {
                  if (guestChildName && guestParentName && guestParentEmail) {
                    setGuestList(prev => [...prev, {
                      id: `guest-${Date.now()}`,
                      childName: guestChildName,
                      parentName: guestParentName,
                      parentEmail: guestParentEmail,
                      isExisting: false,
                    }])
                    setGuestChildName('')
                    setGuestParentName('')
                    setGuestParentEmail('')
                    setShowAddGuestForm(false)
                  }
                }}
                disabled={!guestChildName || !guestParentName || !guestParentEmail}
                className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Add Guest
              </Button>
            </CardContent>
          </Card>
        )}

        {guestList.length === 0 && !showAddGuestForm && (
          <p className="text-sm text-slate-400 italic">No guests added yet. Click "Add a Guest" to book for a friend's child.</p>
        )}
      </div>

      {/* Selection Summary */}
      {(selectedChildIds.length > 0 || guestList.length > 0) && selectedClassData && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-800">
                Booking Summary
              </h4>
              <div className="text-sm text-slate-600 mt-1 space-y-0.5">
                {selectedChildIds.length > 0 && parentWithChildren && (
                  <p>
                    Own children ({selectedChildIds.length}): {parentWithChildren.children
                      .filter(c => selectedChildIds.includes(c.id))
                      .map(c => c.child_full_name)
                      .join(', ')}
                  </p>
                )}
                {guestList.length > 0 && (
                  <p>
                    Guests ({guestList.length}): {guestList.map(g => g.childName).join(', ')}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Total Price</p>
              <p className="text-2xl font-bold text-cocinarte-navy">
                ${(() => {
                  if (isCurrentClassMommyAndMe) {
                    const ownCost = selectedChildIds.length > 0
                      ? selectedClassData.price + Math.max(0, selectedChildIds.length - 1) * EXTRA_CHILD_COST
                      : 0
                    return ownCost + guestList.length * selectedClassData.price
                  }
                  return (selectedChildIds.length + guestList.length) * selectedClassData.price
                })()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Accompanying Parent Name - Required for parent-child classes */}
      {selectedClassData?.requires_parent && (
        <div className="space-y-2 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-blue-600" />
            <Label htmlFor="accompanying-parent" className="text-sm font-semibold text-blue-900">
              Accompanying Parent Name *
            </Label>
          </div>
          <p className="text-xs text-blue-700 mb-2">
            This class requires a parent/guardian to attend and participate with the child.
          </p>
          <Input
            id="accompanying-parent"
            value={accompanyingParentName}
            onChange={(e) => setAccompanyingParentName(e.target.value)}
            placeholder="Enter the name of the parent/guardian attending..."
            className="bg-white"
            required
          />
        </div>
      )}

      {/* Comments */}
      <div className="space-y-2">
        <Label htmlFor="booking-comments" className="text-sm font-medium text-slate-700">
          Comments (optional)
        </Label>
        <Textarea
          id="booking-comments"
          value={bookingComments}
          onChange={(e) => setBookingComments(e.target.value)}
          placeholder="Any allergies, dietary needs, or special requests..."
          rows={3}
          className="resize-none"
        />
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
          onClick={() => {
            // Set selectedChildId to first child for backward compatibility
            if (selectedChildIds.length > 0) {
              setSelectedChildId(selectedChildIds[0])
            }
            // Sync legacy isGuestBooking flag if only guests (no own children)
            if (selectedChildIds.length === 0 && guestList.length > 0) {
              setIsGuestBooking(true)
              // Set legacy guest fields from first guest for backward compat
              setGuestChildName(guestList[0].childName)
              setGuestParentName(guestList[0].parentName)
              setGuestParentEmail(guestList[0].parentEmail)
            } else {
              setIsGuestBooking(false)
            }
            setAuthStep('payment')
          }}
          disabled={!canContinue}
          size="lg"
          className="px-8 bg-cocinarte-red hover:bg-cocinarte-red/90 text-white"
        >
          Continue to Payment
          {(selectedChildIds.length > 0 || guestList.length > 0) && selectedClassData && (
            <span className="ml-2">
              (${(() => {
                if (isCurrentClassMommyAndMe) {
                  const ownCost = selectedChildIds.length > 0
                    ? selectedClassData.price + Math.max(0, selectedChildIds.length - 1) * EXTRA_CHILD_COST
                    : 0
                  return ownCost + guestList.length * selectedClassData.price
                }
                return (selectedChildIds.length + guestList.length) * selectedClassData.price
              })()})
            </span>
          )}
        </Button>
      </div>
    </div>
  )
  }

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

                    {/* Selected Children & Guests Display */}
                    {(selectedChildIds.length > 0 || guestList.length > 0) && (
                      <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-purple-600" />
                          <h4 className="font-semibold text-purple-800">
                            {selectedChildIds.length + guestList.length} {(selectedChildIds.length + guestList.length) === 1 ? 'Child' : 'Children'} Attending
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {parentWithChildren && parentWithChildren.children
                            .filter(c => selectedChildIds.includes(c.id))
                            .map((child, index) => (
                              <p key={child.id} className="text-sm text-purple-700">
                                {index + 1}. {child.child_full_name}
                                {isCurrentClassMommyAndMe
                                  ? (index === 0 ? ' (included in base price)' : ` (+$${EXTRA_CHILD_COST})`)
                                  : ` ($${selectedClassData?.price})`}
                              </p>
                            ))}
                          {guestList.map((guest, index) => (
                            <p key={guest.id} className="text-sm text-blue-700">
                              {selectedChildIds.length + index + 1}. {guest.childName} <span className="text-blue-500">(guest)</span> (${selectedClassData?.price})
                            </p>
                          ))}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setClientSecret('')
                            setPaymentIntentId('')
                            setAuthStep('child-selection')
                          }}
                          className="mt-2 p-0 h-auto text-purple-600 hover:text-purple-800"
                        >
                          Change selection
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 pt-4 mt-auto space-y-3">
                    {(appliedCoupon || (useGiftCard && giftCardAmountToUse > 0) || selectedChildIds.length > 1 || guestList.length > 0 || (isCurrentClassMommyAndMe && extraChildren > 0)) && (
                      <>
                        {isCurrentClassMommyAndMe ? (
                          <>
                            {selectedChildIds.length > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Own Children ({selectedChildIds.length})</span>
                                <span className="text-slate-800">${getOwnChildrenCost().toFixed(2)}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          selectedChildIds.length > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Own Children ({selectedChildIds.length} x ${selectedClassData.price})</span>
                              <span className="text-slate-800">${getOwnChildrenCost().toFixed(2)}</span>
                            </div>
                          )
                        )}
                        {guestList.length > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-600 font-medium flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              Guests ({guestList.length} x ${selectedClassData.price})
                            </span>
                            <span className="text-blue-600 font-medium">${getGuestsCost().toFixed(2)}</span>
                          </div>
                        )}
                        {appliedCoupon && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-600 font-medium flex items-center gap-1">
                              <Ticket className="h-3 w-3" />
                              Discount ({appliedCoupon.discountType === 'fixed' ? `$${appliedCoupon.discountAmount}` : `${appliedCoupon.discount}%`})
                            </span>
                            <span className="text-green-600 font-medium">-${getDiscountAmount().toFixed(2)}</span>
                          </div>
                        )}
                        {useGiftCard && giftCardAmountToUse > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-amber-600 font-medium flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              Gift Card
                            </span>
                            <span className="text-amber-600 font-medium">-${giftCardAmountToUse.toFixed(2)}</span>
                          </div>
                        )}
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
                        {appliedCoupon.discountType === 'fixed' ? `$${appliedCoupon.discountAmount} OFF` : `${appliedCoupon.discount}% OFF`}
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

              {/* Gift Card Section */}
              {giftCardBalance !== null && giftCardBalance > 0 && (
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        Gift Card Balance: ${giftCardBalance.toFixed(2)}
                      </span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useGiftCard}
                        onChange={(e) => {
                          setUseGiftCard(e.target.checked)
                          if (e.target.checked) {
                            // Use the minimum of gift card balance or price after coupon
                            const priceAfterCoupon = getPriceAfterCoupon()
                            setGiftCardAmountToUse(Math.min(giftCardBalance!, priceAfterCoupon))
                          } else {
                            setGiftCardAmountToUse(0)
                          }
                        }}
                        className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-amber-700">Use gift card</span>
                    </label>
                  </div>
                  {useGiftCard && (
                    <p className="text-xs text-amber-600 mt-2">
                      Applying ${giftCardAmountToUse.toFixed(2)} from your gift card balance
                    </p>
                  )}
                </div>
              )}

              {/* Payment Notice or Free Booking Notice */}
              {calculateFinalPrice() > 0 ? (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-green-800 mb-1">
                        Secure Payment
                      </h4>
                      <div className="text-sm text-green-700 space-y-1">
                        <p className="font-medium">
                          Your card will be <strong>charged immediately</strong> to confirm your spot.
                        </p>
                        <ul className="list-disc list-inside space-y-1 mt-2 text-xs">
                          <li>Total amount: <strong>${calculateFinalPrice().toFixed(2)}</strong></li>
                          <li>Your booking is confirmed upon successful payment</li>
                          <li>Cancellations made 48+ hours before class receive a full refund</li>
                          <li>A confirmation email will be sent to your email address</li>
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

      // Fetch guest bookings purchased by this user
      if (user.id) {
        await loadGuestBookings(user.id)
      }
    } catch (error) {
      console.error('Error fetching student profile:', error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const openCancelDialog = (booking: any, childId: string) => {
    const clase = booking.clases
    if (!clase) return

    const now = new Date()
    const classDateTime = new Date(`${clase.date}T${clase.time}`)
    const hoursUntil = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntil <= 0) {
      setCancelResultDialog({ open: true, message: 'This class has already started or passed.', isError: true })
      return
    }

    const isLateCancel = hoursUntil < 48
    let refundEstimate = 0
    const paymentAmount = booking.payment_amount || 0
    if (hoursUntil >= 48) {
      refundEstimate = paymentAmount
    } else if (clase.late_cancel_refund_type && clase.late_cancel_refund_value != null) {
      if (clase.late_cancel_refund_type === 'percentage') {
        refundEstimate = Math.round(paymentAmount * (clase.late_cancel_refund_value / 100) * 100) / 100
      } else if (clase.late_cancel_refund_type === 'fixed') {
        refundEstimate = Math.min(clase.late_cancel_refund_value, paymentAmount)
      }
    }

    setCancelDialog({
      open: true,
      booking,
      childId,
      title: clase.title,
      refundAmount: refundEstimate,
      isLateCancel,
    })
  }

  const confirmCancelBooking = async () => {
    const { booking, childId } = cancelDialog
    if (!booking) return

    setCancelDialog(prev => ({ ...prev, open: false }))
    setCancellingBookingId(booking.id)

    try {
      const response = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to cancel booking')

      if (parentWithChildren?.children) {
        await loadBookingsForChildren(parentWithChildren.children)
      }

      if (result.refundAmount > 0) {
        setCancelResultDialog({ open: true, message: `Booking cancelled. A refund of $${result.refundAmount.toFixed(2)} will be processed.`, isError: false })
      } else {
        setCancelResultDialog({ open: true, message: 'Booking cancelled successfully.', isError: false })
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error)
      setCancelResultDialog({ open: true, message: error.message || 'Failed to cancel booking. Please try again.', isError: true })
    } finally {
      setCancellingBookingId(null)
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
              price,
              late_cancel_refund_type,
              late_cancel_refund_value
            )
          `)
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

  const loadGuestBookings = async (userId: string) => {
    setLoadingGuestBookings(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: guestBookings, error } = await supabase
        .from('guest_bookings')
        .select(`
          *,
          bookings:booking_id (
            id,
            booking_status,
            payment_status,
            payment_amount,
            clases:class_id (
              id,
              title,
              date,
              time,
              price
            )
          )
        `)
        .eq('purchaser_user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading guest bookings:', error)
      } else {
        setMyGuestBookings(guestBookings || [])
      }
    } catch (error) {
      console.error('Failed to load guest bookings:', error)
    } finally {
      setLoadingGuestBookings(false)
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
    console.log('handleSaveChild called', { childFormData, editingChildId })

    if (!childFormData.child_full_name || !childFormData.child_age) {
      console.log('Validation failed - missing required fields')
      setAuthError('Please fill in all required fields')
      setTimeout(() => setAuthError(''), 3000)
      return
    }

    try {
      const parentsService = new ParentsClientService()

      if (editingChildId) {
        // Update existing child - remove consent_form as it's a joined object, not a column
        const { consent_form, id, parent_id, created_at, updated_at, ...updateData } = childFormData as any
        console.log('Updating child:', editingChildId, updateData)
        await parentsService.updateChild(editingChildId, updateData)
        console.log('Child updated successfully')
        setAuthMessage('Child updated successfully')
      } else {
        // Add new child
        if (!parentWithChildren?.id) {
          setAuthError('Parent information not found')
          return
        }
        const newChild = await parentsService.addChild(parentWithChildren.id, childFormData as Child)

        // If we have pending consent data, save it now that we have the child ID
        if (pendingConsentData && newChild.id) {
          try {
            await fetch('/api/consent/sign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                child_id: newChild.id,
                parent_id: parentWithChildren.id,
                social_media_consent: pendingConsentData.socialMediaConsent,
                liability_consent: pendingConsentData.liabilityConsent,
                parent_name_signed: pendingConsentData.parentNameSigned,
                child_name_signed: pendingConsentData.childNameSigned,
                signature_data_url: pendingConsentData.signatureDataUrl,
              }),
            })
          } catch (consentError) {
            console.error('Error saving consent form:', consentError)
            // Don't fail the child creation, just log the error
          }
        }

        setAuthMessage('Child added successfully')
      }

      // Close form immediately
      setIsAddingChild(false)
      setEditingChildId(null)
      setChildFormData({})
      setPendingConsentData(null)

      // Then refresh data in background
      fetchStudentProfile()
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
    setPendingConsentData(null)
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
                    <div className="text-blue-900 font-medium">
                      <Badge variant="default" className="bg-green-600">Active</Badge>
                    </div>
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

              {/* Gift Card Balance */}
              {parentWithChildren && (
                <GiftCardBalance
                  parentId={parentWithChildren.id}
                  initialBalance={giftCardBalance ?? undefined}
                  onBalanceChange={setGiftCardBalance}
                />
              )}

              {/* Guest Bookings Section */}
              {myGuestBookings.length > 0 && (
                <>
                  <div className="border-t border-blue-200 pt-4"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2 mb-4">
                      <Gift className="h-5 w-5" />
                      Guest Bookings ({myGuestBookings.length})
                    </h3>
                    <div className="space-y-3">
                      {myGuestBookings.map((gb: any) => {
                        const clase = gb.bookings?.clases
                        const formCompleted = !!gb.form_completed_at
                        return (
                          <Card key={gb.id} className="border-purple-200">
                            <CardContent className="pt-4 pb-4">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="font-semibold text-purple-900 text-sm sm:text-base">
                                      {clase?.title || 'Class'}
                                    </div>
                                    <div className="text-xs text-purple-700 mt-1">
                                      {clase?.date && new Date(clase.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                      {clase?.time && ` • ${clase.time}`}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                                      Gift
                                    </Badge>
                                    {formCompleted ? (
                                      <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                        Form Complete
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                        Form Pending
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-2 text-xs space-y-1">
                                  <div>
                                    <span className="font-medium text-purple-800">Guest Child: </span>
                                    <span className="text-purple-700">{gb.guest_child_name}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-purple-800">Guest Parent: </span>
                                    <span className="text-purple-700">{gb.guest_parent_name} ({gb.guest_parent_email})</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-blue-200 pt-4"></div>

              {/* Children Information */}
              {parentWithChildren ? (
                parentWithChildren.children && parentWithChildren.children.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                      <Baby className="h-5 w-5" />
                      My Children ({parentWithChildren.children.length})
                    </h3>
                    {!isAddingChild && !editingChildId && (
                      <Button
                        onClick={handleAddChild}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Child
                      </Button>
                    )}
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
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-wrap items-start sm:items-center">
                                <Badge variant="outline" className="bg-blue-50 w-fit">
                                  Age: {child.child_age}
                                </Badge>
                                {(child as any).consent_form?.liability_consent ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Consent Signed
                                    {(child as any).consent_form?.social_media_consent && (
                                      <span className="ml-1">(+Media)</span>
                                    )}
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-xs border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                    onClick={() => handleEditChild(child)}
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Sign Consent Required
                                  </Button>
                                )}
                                {child.has_cooking_experience && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                                    <ChefHat className="h-3 w-3 mr-1" />
                                    Cooking Exp
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
                                  {childrenBookings[child.id].map((booking: any) => {
                                    const classDate = booking.clases?.date
                                    const classTime = booking.clases?.time
                                    const isFuture = classDate && classTime && new Date(`${classDate}T${classTime}`).getTime() > Date.now()
                                    const isCancelled = booking.booking_status === 'cancelled'

                                    return (
                                    <div key={booking.id} className="bg-white border border-orange-100 rounded p-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <div className="font-medium text-sm text-orange-900">
                                            {booking.clases?.title || 'Class'}
                                          </div>
                                          <div className="text-xs text-orange-700 mt-1">
                                            {classDate && new Date(classDate).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric'
                                            })}
                                            {classTime && ` • ${classTime}`}
                                          </div>
                                          <Badge
                                            variant="outline"
                                            className={`mt-1 text-xs ${
                                              booking.booking_status === 'confirmed' ? 'bg-green-50 text-green-800 border-green-200' :
                                              booking.booking_status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                                              booking.booking_status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                                              'bg-blue-50 text-blue-800 border-blue-200'
                                            }`}
                                          >
                                            {booking.booking_status || 'booked'}
                                          </Badge>
                                        </div>
                                        {isFuture && !isCancelled && (
                                          <button
                                            onClick={() => openCancelDialog(booking, child.id)}
                                            disabled={cancellingBookingId === booking.id}
                                            className="mt-0.5 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-200 transition-colors disabled:opacity-50 flex-shrink-0"
                                          >
                                            {cancellingBookingId === booking.id ? (
                                              <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Cancelling...
                                              </>
                                            ) : (
                                              <>
                                                <XCircle className="h-3 w-3" />
                                                Cancel
                                              </>
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    )
                                  })}
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
                  {!isAddingChild && (
                    <>
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
                    </>
                  )}
                </div>
                )
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    No parent profile found. Please complete your registration.
                  </AlertDescription>
                </Alert>
              )}

              {/* Consent status is shown in each child's badges above - click "Edit" on a child to update consent */}

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

                    {/* Consent Form Section */}
                    {(() => {
                      // Determine if consent has been signed
                      const existingChild = editingChildId
                        ? parentWithChildren?.children?.find(c => c.id === editingChildId)
                        : null
                      const hasExistingConsent = existingChild && (existingChild as any).consent_form?.liability_consent
                      const hasPendingConsent = pendingConsentData?.liabilityConsent
                      const hasConsent = hasExistingConsent || hasPendingConsent
                      const currentSocialMediaConsent = hasPendingConsent
                        ? pendingConsentData?.socialMediaConsent
                        : (existingChild as any)?.consent_form?.social_media_consent

                      // For new children (no existing consent)
                      if (!hasConsent) {
                        return (
                          <div className="border rounded-lg p-3 bg-yellow-50/50 border-yellow-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-yellow-600" />
                                <Label className="font-medium text-yellow-800">Consent Form (Required)</Label>
                              </div>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Not Signed
                              </Badge>
                            </div>
                            <p className="text-xs text-yellow-700 mt-2">
                              Consent form includes liability waiver (required) and optional media permission.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                              onClick={() => {
                                setConsentChildName(childFormData.child_full_name || '')
                                setConsentParentName(parentWithChildren?.parent_guardian_names || '')
                                setConsentSocialMedia(false)
                                setConsentLiability(false)
                                setConsentSignature(null)
                                setShowConsentDialog(true)
                              }}
                            >
                              <FileCheck className="h-4 w-4 mr-2" />
                              Sign Consent Form
                            </Button>
                          </div>
                        )
                      }

                      // For existing consent - show toggle for media permission
                      return (
                        <div className="border rounded-lg p-3 bg-green-50/50 border-green-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <Label className="font-medium text-green-800">Consent Form</Label>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Waiver Signed
                            </Badge>
                          </div>

                          {/* Media Permission Toggle */}
                          <div className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center gap-2">
                              <Camera className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">Allow photos/videos</span>
                            </div>
                            <button
                              type="button"
                              onClick={async () => {
                                if (currentSocialMediaConsent) {
                                  // Turning OFF - no signature needed, just update directly
                                  if (editingChildId && existingChild) {
                                    try {
                                      const response = await fetch('/api/consent/update-media', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          child_id: editingChildId,
                                          social_media_consent: false,
                                        }),
                                      })
                                      const result = await response.json()
                                      if (result.success) {
                                        // Refresh parent data
                                        if (user?.email) {
                                          const parentsService = new ParentsClientService()
                                          const updatedParent = await parentsService.getParentWithChildrenByEmail(user.email)
                                          if (updatedParent) {
                                            setParentWithChildren(updatedParent)
                                          }
                                        }
                                      }
                                    } catch (err) {
                                      console.error('Failed to update media consent:', err)
                                    }
                                  } else if (pendingConsentData) {
                                    setPendingConsentData({ ...pendingConsentData, socialMediaConsent: false })
                                  }
                                } else {
                                  // Turning ON - need new signature
                                  setConsentChildName(childFormData.child_full_name || '')
                                  setConsentParentName(parentWithChildren?.parent_guardian_names || '')
                                  setConsentSocialMedia(true)
                                  setConsentLiability(true)
                                  setConsentSignature(null)
                                  setShowConsentDialog(true)
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                currentSocialMediaConsent ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  currentSocialMediaConsent ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {currentSocialMediaConsent
                              ? 'Photos/videos allowed for social media & marketing'
                              : 'Turn on to allow photos/videos (requires new signature)'}
                          </p>
                        </div>
                      )
                    })()}

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
          {guestList.length > 0
            ? 'Your booking has been confirmed! Guest parents will receive enrollment forms.'
            : 'Your cooking class has been successfully booked. You will receive a confirmation email shortly.'}
        </p>
      </div>

      {/* Guest booking info */}
      {guestList.length > 0 && (
        <Alert className="border-purple-200 bg-purple-50">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-800 mb-1">
                Guest Enrollment {guestList.length === 1 ? 'Form' : 'Forms'} Sent
              </h4>
              <div className="text-xs text-purple-700 space-y-2">
                {guestList.map(guest => (
                  <div key={guest.id}>
                    <p>An enrollment form has been sent to <strong>{guest.parentEmail}</strong>.</p>
                    <p>
                      <strong>{guest.parentName}</strong> will need to complete {guest.childName}'s information
                      and sign consent forms before the class.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Alert>
      )}

      {/* Payment Confirmation */}
      <Alert className="border-green-200 bg-green-50">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-800 mb-1">
              Payment Completed
            </h4>
            <div className="text-xs text-green-700 space-y-1">
              <p>Your payment of <strong>${calculateFinalPrice()}</strong> has been <strong>successfully processed</strong>.</p>
              <p className="mt-2">
                <strong>Booking Confirmed:</strong> Your spot is now reserved for this class.
              </p>
              <p>
                <strong>Cancellation Policy:</strong> Full refund available for cancellations made 48+ hours before class starts.
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
      {selectedChildIds.length > 0 && parentWithChildren && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-purple-800 flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Baby className="h-5 w-5 text-purple-600" />
              </div>
              {selectedChildIds.length > 1 ? `Children Attending (${selectedChildIds.length})` : 'Child Attending'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const selectedChildren = parentWithChildren.children.filter((c: Child) => selectedChildIds.includes(c.id))
              if (selectedChildren.length === 0) return null

              return (
                <div className="space-y-4">
                  {selectedChildren.map((child: Child, index: number) => (
                    <div key={child.id} className={index > 0 ? "pt-4 border-t border-purple-200" : ""}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-semibold text-purple-700">Child Name</span>
                          <p className="text-purple-800 font-medium text-lg">
                            {child.child_full_name}
                            {isCurrentClassMommyAndMe && (
                              <span className="ml-2 text-sm font-normal text-purple-600">
                                {index === 0 ? '(included in base price)' : '(+$70)'}
                              </span>
                            )}
                          </p>
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
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
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
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
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
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Guest Children Information */}
      {guestList.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Gift className="h-5 w-5 text-blue-600" />
              </div>
              Guest Children ({guestList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guestList.map((guest, index) => (
                <div key={guest.id} className={index > 0 ? "pt-3 border-t border-blue-200" : ""}>
                  <p className="text-blue-800 font-medium text-lg">{guest.childName}</p>
                  <p className="text-sm text-blue-600">Parent: {guest.parentName} ({guest.parentEmail})</p>
                  <p className="text-xs text-blue-500 mt-1">Enrollment form sent - pending completion</p>
                </div>
              ))}
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
                  <p className="text-2xl font-bold text-green-800">${calculateFinalPrice()}</p>
                  {selectedChildIds.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Own children ({selectedChildIds.length}): ${getOwnChildrenCost()}
                    </p>
                  )}
                  {guestList.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Guests ({guestList.length}): ${getGuestsCost()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )

  return (
    <>
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

      {/* Consent Form Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-blue-600" />
              Consent Form for {consentChildName || 'Child'}
            </DialogTitle>
            <DialogDescription>
              Please review and sign the consent forms below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Social Media & Video Consent */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  {SOCIAL_MEDIA_CONSENT_TEXT.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {SOCIAL_MEDIA_CONSENT_TEXT.intro}
                </p>
                <p className="text-sm text-muted-foreground">
                  {SOCIAL_MEDIA_CONSENT_TEXT.understanding}
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                  {SOCIAL_MEDIA_CONSENT_TEXT.uses.map((use, index) => (
                    <li key={index}>{use}</li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground font-medium">
                  {SOCIAL_MEDIA_CONSENT_TEXT.privacy}
                </p>
                <p className="text-sm text-muted-foreground">
                  {SOCIAL_MEDIA_CONSENT_TEXT.revocation}
                </p>

                <div className="flex items-start space-x-3 pt-2 border-t">
                  <Checkbox
                    id="consent-social-media"
                    checked={consentSocialMedia}
                    onCheckedChange={(checked) => setConsentSocialMedia(checked === true)}
                  />
                  <Label
                    htmlFor="consent-social-media"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I give permission for my child to participate in photos and/or videos
                    <span className="text-muted-foreground font-normal block mt-1">
                      (Optional - you can change this at any time)
                    </span>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Liability Waiver */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  {LIABILITY_CONSENT_TEXT.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {LIABILITY_CONSENT_TEXT.intro}
                </p>
                <p className="text-sm text-muted-foreground">
                  {LIABILITY_CONSENT_TEXT.risks}
                </p>
                <p className="text-sm text-muted-foreground">
                  {LIABILITY_CONSENT_TEXT.release}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {LIABILITY_CONSENT_TEXT.disclosure}
                </p>

                <div className="flex items-start space-x-3 pt-2 border-t">
                  <Checkbox
                    id="consent-liability"
                    checked={consentLiability}
                    onCheckedChange={(checked) => setConsentLiability(checked === true)}
                    required
                  />
                  <Label
                    htmlFor="consent-liability"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I have read and agree to the Cooking Program Liability Acknowledgment
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Signature Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Electronic Signature</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consent-parent-name">
                      Parent/Guardian Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="consent-parent-name"
                      value={consentParentName}
                      onChange={(e) => setConsentParentName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consent-child-name">
                      Child&apos;s Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="consent-child-name"
                      value={consentChildName}
                      onChange={(e) => setConsentChildName(e.target.value)}
                      placeholder="Enter child's full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Signature <span className="text-destructive">*</span></Label>
                  <SignaturePad onSignatureChange={setConsentSignature} />
                </div>

                <p className="text-xs text-muted-foreground">
                  By signing above, I confirm that I am the parent or legal guardian of the child
                  named and have the authority to provide this consent. Today&apos;s date:{' '}
                  {new Date().toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowConsentDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                // Validate form
                if (!consentLiability) {
                  alert('Please accept the liability waiver to continue')
                  return
                }
                if (!consentParentName.trim() || !consentChildName.trim()) {
                  alert('Please enter both parent and child names')
                  return
                }
                if (!consentSignature) {
                  alert('Please provide your signature')
                  return
                }

                setConsentSigning(true)

                try {
                  // If we have a parent ID and this is for an existing child, save to database immediately
                  if (parentWithChildren?.id && editingChildId) {
                    const response = await fetch('/api/consent/sign', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        child_id: editingChildId,
                        parent_id: parentWithChildren.id,
                        social_media_consent: consentSocialMedia,
                        liability_consent: consentLiability,
                        parent_name_signed: consentParentName.trim(),
                        child_name_signed: consentChildName.trim(),
                        signature_data_url: consentSignature,
                      }),
                    })

                    if (!response.ok) {
                      throw new Error('Failed to save consent form')
                    }

                    // Refresh parent data to show updated consent status
                    if (user?.email) {
                      const parentsService = new ParentsClientService()
                      const updatedParent = await parentsService.getParentWithChildrenByEmail(user.email)
                      if (updatedParent) {
                        setParentWithChildren(updatedParent)
                      }
                    }
                  } else {
                    // For new children, store consent data to be saved after child is created
                    setPendingConsentData({
                      socialMediaConsent: consentSocialMedia,
                      liabilityConsent: consentLiability,
                      parentNameSigned: consentParentName.trim(),
                      childNameSigned: consentChildName.trim(),
                      signatureDataUrl: consentSignature,
                    })
                  }

                  // Update child form data with consent info
                  setChildFormData({
                    ...childFormData,
                    media_permission: consentSocialMedia,
                  })

                  // Close dialog
                  setShowConsentDialog(false)
                } catch (error) {
                  console.error('Error saving consent:', error)
                  alert('Failed to save consent form. Please try again.')
                } finally {
                  setConsentSigning(false)
                }
              }}
              disabled={!consentLiability || !consentParentName.trim() || !consentChildName.trim() || !consentSignature || consentSigning}
              className="bg-green-600 hover:bg-green-700"
            >
              {consentSigning ? 'Saving...' : 'Sign & Save Consent'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>

    {/* Cancel Booking Confirmation Dialog */}
    <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog(prev => ({ ...prev, open: false }))}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg text-red-700 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Cancel Booking
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-gray-700">
            Are you sure you want to cancel your booking for <strong>{cancelDialog.title}</strong>?
          </p>
          <div className={`rounded-lg p-3 text-sm ${
            !cancelDialog.isLateCancel
              ? 'bg-green-50 border border-green-200 text-green-800'
              : cancelDialog.refundAmount > 0
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {!cancelDialog.isLateCancel ? (
              <p>You will receive a <strong>full refund of ${cancelDialog.refundAmount.toFixed(2)}</strong>.</p>
            ) : cancelDialog.refundAmount > 0 ? (
              <p>This is a late cancellation (less than 48 hours before class). Per our policy, you will receive a <strong>refund of ${cancelDialog.refundAmount.toFixed(2)}</strong>.</p>
            ) : (
              <p>This is a late cancellation (less than 48 hours before class). Per our policy, <strong>no refund</strong> will be issued.</p>
            )}
          </div>
          <p className="text-xs text-gray-500">This action cannot be undone.</p>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setCancelDialog(prev => ({ ...prev, open: false }))}>
            Keep Booking
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={confirmCancelBooking}
          >
            Yes, Cancel Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Cancel Result Dialog */}
    <Dialog open={cancelResultDialog.open} onOpenChange={(open) => !open && setCancelResultDialog(prev => ({ ...prev, open: false }))}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className={`text-lg flex items-center gap-2 ${cancelResultDialog.isError ? 'text-red-700' : 'text-green-700'}`}>
            {cancelResultDialog.isError ? (
              <><AlertCircle className="h-5 w-5" /> Error</>
            ) : (
              <><CheckCircle className="h-5 w-5" /> Success</>
            )}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-700 py-2">{cancelResultDialog.message}</p>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCancelResultDialog(prev => ({ ...prev, open: false }))}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}