"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, Instagram, Facebook, User, LogOut, ChefHat, Mail, Phone, MapPin, Calendar, Shield, ExternalLink, XCircle, Gift, ChevronDown, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import CocinarteBookingPopup from "./cocinarte-booking-popup"
import CocinarteAuthPopup from "./cocinarte-auth-popup"
import { useAuth } from "@/contexts/auth-context"
import { StudentsClientService } from "@/lib/supabase/students-client"
import { BookingsClientService } from "@/lib/supabase/bookings-client"
import { Student } from "@/lib/types/students"
import { BookingWithDetails } from "@/lib/types/bookings"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import GiftCardPurchase from "@/components/gift-cards/gift-card-purchase"

function CocinarteHeaderInner() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false)
  const [isCampsDropdownOpen, setIsCampsDropdownOpen] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [bookingInitialStep, setBookingInitialStep] = useState<'class-selection' | 'login' | 'signup' | 'payment' | 'confirmation' | 'account'>('class-selection')
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false)
  const [studentInfo, setStudentInfo] = useState<Student | null>(null)
  const [loadingStudent, setLoadingStudent] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    parent_name: '',
    phone: '',
    address: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  
  // Bookings state
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    booking: BookingWithDetails | null
    title: string
    refundAmount: number
    isLateCancel: boolean
  }>({ open: false, booking: null, title: '', refundAmount: 0, isLateCancel: false })
  const [cancelResultDialog, setCancelResultDialog] = useState<{ open: boolean; message: string; isError: boolean }>({ open: false, message: '', isError: false })
  
  const { user, signOut } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle URL-based popup opening
  useEffect(() => {
    const popup = searchParams.get('popup')
    if (popup === 'giftcard') {
      setIsGiftCardOpen(true)
    }
  }, [searchParams])

  const fetchStudentInfo = async () => {
    if (!user?.email) return
    
    try {
      setLoadingStudent(true)
      const studentsService = new StudentsClientService()
      const student = await studentsService.getStudentByEmail(user.email)
      setStudentInfo(student)
    } catch (error) {
      console.error('Error fetching student info:', error)
    } finally {
      setLoadingStudent(false)
    }
  }

  const fetchBookings = async () => {
    if (!user?.id) return
    
    setLoadingBookings(true)
    try {
      const bookingsService = new BookingsClientService()
      const userBookings = await bookingsService.getBookingsWithDetails(user.id)
      setBookings(userBookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleAccountClick = () => {
    if (user) {
      // Open booking popup in account view mode
      setBookingInitialStep('account')
      setIsBookingOpen(true)
    } else {
      // If not logged in, show auth popup
      setIsAuthOpen(true)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsAccountOpen(false)
      setStudentInfo(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleEditClick = () => {
    if (studentInfo) {
      setEditForm({
        parent_name: studentInfo.parent_name,
        phone: studentInfo.phone || '',
        address: studentInfo.address || ''
      })
      setIsEditing(true)
      setUpdateError('')
      setUpdateMessage('')
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      parent_name: '',
      phone: '',
      address: ''
    })
    setUpdateError('')
    setUpdateMessage('')
  }

  const handleUpdateStudent = async () => {
    if (!studentInfo) return

    setUpdateLoading(true)
    setUpdateError('')
    setUpdateMessage('')

    try {
      const studentsService = new StudentsClientService()
      const updatedStudent = await studentsService.updateStudent({
        id: studentInfo.id,
        parent_name: editForm.parent_name,
        phone: editForm.phone,
        address: editForm.address
      })

      setStudentInfo(updatedStudent)
      setIsEditing(false)
      setUpdateMessage('Profile updated successfully!')
    } catch (error) {
      setUpdateError('Error updating profile. Please try again.')
    } finally {
      setUpdateLoading(false)
    }
  }

  const getHoursUntilClass = (classDate: string, classTime: string): number => {
    const now = new Date()
    const classDateTime = new Date(`${classDate}T${classTime}`)
    return (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  }

  const canCancelBooking = (classDate: string, classTime: string): boolean => {
    return getHoursUntilClass(classDate, classTime) > 0
  }

  const getExpectedRefund = (booking: BookingWithDetails): { amount: number; isLateCancel: boolean } => {
    const hoursUntil = getHoursUntilClass(booking.class.date, booking.class.time)
    if (hoursUntil >= 48) {
      return { amount: booking.payment_amount, isLateCancel: false }
    }
    const refundType = booking.class.late_cancel_refund_type
    const refundValue = booking.class.late_cancel_refund_value
    if (!refundType || refundValue == null) {
      return { amount: 0, isLateCancel: true }
    }
    if (refundType === 'percentage') {
      return { amount: Math.round(booking.payment_amount * (refundValue / 100) * 100) / 100, isLateCancel: true }
    }
    if (refundType === 'fixed') {
      return { amount: Math.min(refundValue, booking.payment_amount), isLateCancel: true }
    }
    return { amount: 0, isLateCancel: true }
  }

  const handleCancelBooking = (booking: BookingWithDetails) => {
    const { amount, isLateCancel } = getExpectedRefund(booking)
    setCancelDialog({
      open: true,
      booking,
      title: booking.class.title,
      refundAmount: amount,
      isLateCancel,
    })
  }

  const confirmCancelBooking = async () => {
    const { booking } = cancelDialog
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

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel booking')
      }

      await fetchBookings()

      if (result.refundAmount > 0) {
        setCancelResultDialog({ open: true, message: `Booking cancelled successfully. A refund of $${result.refundAmount.toFixed(2)} will be processed. You will receive a confirmation email shortly.`, isError: false })
      } else {
        setCancelResultDialog({ open: true, message: 'Booking cancelled successfully. You will receive a confirmation email shortly.', isError: false })
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error)
      setCancelResultDialog({ open: true, message: error.message || 'Failed to cancel booking. Please try again or contact support.', isError: true })
    } finally {
      setCancellingBookingId(null)
    }
  }

  // Prevent hydration mismatch by not rendering interactive elements until mounted
  if (!isMounted) {
    return (
      <header className="bg-cocinarte-navy shadow-xl w-full fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1600px] mx-auto pl-0 pr-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 justify-start">
              <Link href="/" className="flex items-center group">
                <Image 
                  src="/cocinarte/cocinarteLogo.png" 
                  alt="Cocinarte Logo" 
                  width={200} 
                  height={64} 
                  className="object-contain object-left h-12 sm:h-14 lg:h-20 max-w-[100px] sm:max-w-[120px] lg:max-w-[200px]" 
                />
              </Link>
            </div>

            {/* Desktop Navigation - Centered */}
            <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
              <Link
                href="#calendar"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                Calendar
              </Link>
              <Link
                href="#about"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                About
              </Link>
              <Link
                href="#classes"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                Classes
              </Link>
              <Link
                href="#faq"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              >
                FAQ
              </Link>
              <div className="relative">
                <button
                  className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black flex items-center gap-1"
                >
                  Camps
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <button
                  className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black flex items-center gap-1"
                >
                  More
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <Link href="https://www.instagram.com/cocinartepdx/" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 lg:p-3">
                  <Instagram className="h-5 w-5 lg:h-6 lg:w-6 text-cocinarte-white" />
                </Link>
                <Link href="https://www.facebook.com/profile.php?id=61580541556926" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 lg:p-3">
                  <Facebook className="h-5 w-5 lg:h-6 lg:w-6 text-cocinarte-white" />
                </Link>
              </div>
              <Link href="https://www.casitaazuleducation.com/" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-cocinarte-yellow hover:bg-cocinarte-orange text-cocinarte-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-semibold"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Discover More
                </Button>
              </Link>
              <Button
                size="lg"
                className="bg-white hover:bg-cocinarte-blue/90 text-cocinarte-navy rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button
                size="lg"
                className="bg-cocinarte-red hover:bg-cocinarte-orange text-cocinarte-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base"
              >
                <Link href="#calendar">Book Now</Link>
              </Button>
            </div>

            {/* Mobile Menu Button - Static for SSR */}
            <button
              className="lg:hidden p-2 rounded-xl bg-cocinarte-orange text-cocinarte-black hover:bg-cocinarte-yellow transition-colors duration-200"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-cocinarte-navy shadow-xl w-full fixed top-0 left-0 right-0 z-50 ">
      <div className="max-w-[1600px] mx-auto pl-0 pr-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24 ">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 justify-start">
            <Link href="/" className="flex items-center group">
              <Image 
                src="/cocinarte/cocinarteLogo.png" 
                alt="Cocinarte Logo" 
                width={200} 
                height={64} 
                className="object-contain object-left h-12 sm:h-14 lg:h-20 max-w-[100px] sm:max-w-[120px] lg:max-w-[200px]" 
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            <Link
              href="#calendar"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              Calendar
            </Link>
            <Link
              href="#about"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              About
            </Link>
            <Link
              href="#classes"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              Classes
            </Link>
            <Link
              href="#faq"
              className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
            >
              FAQ
            </Link>
            {/* Camps Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCampsDropdownOpen(true)}
              onMouseLeave={() => setIsCampsDropdownOpen(false)}
            >
              <button
                type="button"
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black flex items-center gap-1"
              >
                Camps
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCampsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCampsDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-cocinarte-navy rounded-xl shadow-xl border border-cocinarte-orange/20 overflow-hidden min-w-[280px] z-[100]">
                  <Link
                    href="/camps"
                    onClick={() => setIsCampsDropdownOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black transition-all duration-200"
                  >
                    Spring Break Camp (March 23–27)
                  </Link>
                  <Link
                    href="/camps/summer-intensive"
                    onClick={() => setIsCampsDropdownOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black transition-all duration-200"
                  >
                    Summer Intensive Cooking Camp
                  </Link>
                </div>
              )}
            </div>
            {/* More Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsMoreDropdownOpen(true)}
              onMouseLeave={() => setIsMoreDropdownOpen(false)}
            >
              <button
                className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black flex items-center gap-1"
              >
                More
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMoreDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-cocinarte-navy rounded-xl shadow-xl border border-cocinarte-orange/20 overflow-hidden min-w-[180px] z-50">
                  <Link
                    href="#birthday-parties"
                    className="block px-4 py-3 text-sm font-semibold text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black transition-all duration-200"
                  >
                    Birthday Parties
                  </Link>
                  <Link
                    href="#private-events"
                    className="block px-4 py-3 text-sm font-semibold text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black transition-all duration-200"
                  >
                    Private Events
                  </Link>
                  <button
                    onClick={() => {
                      setIsGiftCardOpen(true)
                      setIsMoreDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black transition-all duration-200 flex items-center gap-2"
                  >
                    <Gift className="h-4 w-4" />
                    Gift Cards
                  </button>
                  <Link
                    href="/blog"
                    className="block px-4 py-3 text-sm font-semibold text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black transition-all duration-200"
                  >
                    Blog
                  </Link>
                </div>
              )}
            </div>
          </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <Link href="https://www.instagram.com/cocinartepdx/" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 lg:p-3">
                  <Instagram className="h-5 w-5 lg:h-6 lg:w-6 text-cocinarte-white" />
                </Link>
                <Link href="https://www.facebook.com/profile.php?id=61580541556926" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 lg:p-3">
                  <Facebook className="h-5 w-5 lg:h-6 lg:w-6 text-cocinarte-white" />
                </Link>
              </div>

              {/* Discover More Button */}
              <Link href="https://www.casitaazuleducation.com/" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-cocinarte-yellow hover:bg-cocinarte-orange text-cocinarte-black rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-semibold"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Discover More
                </Button>
              </Link>

              {/* My Account Button */}
              <Button
                size="lg"
                onClick={handleAccountClick}
                className="bg-white hover:bg-cocinarte-blue/90 text-cocinarte-navy rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base"
              >
                <User className="h-4 w-4 mr-2" />
                {user ? 'My Account' : 'Sign In'}
              </Button>

              <Button
                size="lg"
                onClick={() => {
                  setBookingInitialStep('class-selection')
                  setIsBookingOpen(true)
                }}
                className="bg-cocinarte-red hover:bg-cocinarte-orange text-cocinarte-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base"
              >
                Book Now
              </Button>
            </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl bg-cocinarte-orange text-cocinarte-black hover:bg-cocinarte-yellow transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'} fixed top-[64px] sm:top-[80px] left-0 right-0 bg-cocinarte-navy shadow-2xl border-t border-cocinarte-blue z-40`}>
          <nav className="px-4 py-4 space-y-2">
            <Link
              href="#calendar"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Calendar
            </Link>
            <Link
              href="#about"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="#classes"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Classes
            </Link>
            <Link
              href="#birthday-parties"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Birthday Parties
            </Link>
            <Link
              href="#private-events"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Private Events
            </Link>
            <Link
              href="/blog"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            {/* Camps Section */}
            <div className="px-3 py-2">
              <span className="text-xs font-semibold text-cocinarte-orange uppercase tracking-wide">Camps</span>
            </div>
            <Link
              href="/camps"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black ml-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Spring Break Camp (March 23–27)
            </Link>
            <Link
              href="/camps/summer-intensive"
              className="block px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black ml-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Summer Intensive Cooking Camp
            </Link>
            <Link
              href="#faq"
              className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <button
              className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-cocinarte-white hover:bg-cocinarte-orange hover:text-cocinarte-black w-full text-left"
              onClick={() => {
                setIsGiftCardOpen(true)
                setIsMenuOpen(false)
              }}
            >
              <Gift className="h-4 w-4" />
              Gift Cards
            </button>
            <div className="space-y-2 pt-2">
              <Link
                href="https://www.casitaazuleducation.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="w-full block"
              >
                <Button className="w-full bg-cocinarte-yellow hover:bg-cocinarte-orange text-cocinarte-black font-medium py-3 text-sm rounded-xl shadow-lg transition-all duration-200">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Discover More
                </Button>
              </Link>
              <Button
                onClick={() => {
                  handleAccountClick();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-white hover:bg-cocinarte-blue/90 text-cocinarte-navy font-medium py-3 text-sm rounded-xl shadow-lg transition-all duration-200"
              >
                <User className="w-4 h-4 mr-2" />
                {user ? 'My Account' : 'Sign In'}
              </Button>
              <Button
                onClick={() => {
                  setBookingInitialStep('class-selection')
                  setIsBookingOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full bg-cocinarte-red hover:bg-cocinarte-orange text-cocinarte-white font-medium py-3 text-sm rounded-xl shadow-lg transition-all duration-200"
              >
                Book Now
              </Button>
            </div>
            <div className="flex space-x-2 pt-2">
              <Button className="flex-1 bg-cocinarte-yellow hover:bg-cocinarte-orange text-cocinarte-black font-medium py-3 text-sm rounded-xl shadow-lg transition-all duration-200">
                <Link href="https://www.instagram.com/cocinartepdx/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Link>
              </Button>
              <Button className="flex-1 bg-cocinarte-yellow hover:bg-cocinarte-orange text-cocinarte-black font-medium py-3 text-sm rounded-xl shadow-lg transition-all duration-200">
                <Link href="https://www.facebook.com/profile.php?id=61580541556926" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
      <div className="fixed top-1/2 -right-[50px] z-50 transform -translate-y-1/2 w-fit transform -rotate-90">
      {/* Main CTA Button - Rotated 90 degrees */}
      <div className="relative">
        <Button
          size="lg"
          onClick={() => {
            setBookingInitialStep('class-selection')
            setIsBookingOpen(true)
          }}
          className="bg-cocinarte-red hover:bg-golden text-white shadow-lg hover:shadow-xl transition-all duration-200 font-questa px-[60px] py-4 text-sm font-semibold  origin-center whitespace-nowrap rounded-none"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          <span className="transform -rotate-90">Book Now</span>
        </Button>
      </div>
    </div>
    
    {/* Booking Popup */}
    <CocinarteBookingPopup
      isOpen={isBookingOpen}
      onClose={() => setIsBookingOpen(false)}
      initialStep={bookingInitialStep}
    />
    
    {/* Account Popup */}
    <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-cocinarte-navy text-white p-6 rounded-t-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <User className="h-8 w-8" />
              </div>
              My Account
            </DialogTitle>
            <DialogDescription className="text-white/90 text-lg">
              View your account information and manage your profile
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6">

        {loadingStudent ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-slate-600">Loading account information...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Account Information */}
            <div className="space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-600">Email Address</span>
                        <p className="font-semibold text-slate-800">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-600">Account Status</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="bg-green-100 text-green-800 px-3 py-1">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
      
                    
                    {studentInfo && (
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                        <div className="bg-cocinarte-red/10 p-2 rounded-lg">
                          <User className="h-4 w-4 text-cocinarte-red" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-slate-600">Parent Name</span>
                          <p className="font-semibold text-slate-800">{studentInfo.parent_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Student Information */}
            <div className="space-y-6">
              {studentInfo ? (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <div className="bg-cocinarte-red/10 p-2 rounded-lg">
                            <ChefHat className="h-5 w-5 text-cocinarte-red" />
                          </div>
                          Student Information
                        </CardTitle>
                        
                      </div>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditClick}
                          className="text-cocinarte-red border-cocinarte-red hover:bg-cocinarte-red hover:text-white"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-parent-name" className="text-sm font-semibold text-slate-700">Parent Name *</Label>
                            <Input
                              id="edit-parent-name"
                              value={editForm.parent_name}
                              onChange={(e) => setEditForm({...editForm, parent_name: e.target.value})}
                              placeholder="Enter parent's full name"
                              className="h-12"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-phone" className="text-sm font-semibold text-slate-700">Phone Number</Label>
                            <Input
                              id="edit-phone"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              placeholder="Enter phone number"
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-address" className="text-sm font-semibold text-slate-700">Address</Label>
                            <Input
                              id="edit-address"
                              value={editForm.address}
                              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                              placeholder="Enter full address"
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Child Name</Label>
                            <Input
                              value={studentInfo.child_name}
                              disabled
                              className="bg-slate-50 h-12"
                            />
                            <p className="text-xs text-slate-500">Child name cannot be changed</p>
                          </div>
                        </div>
                        
                        {updateError && (
                          <Alert variant="destructive">
                            <AlertDescription>{updateError}</AlertDescription>
                          </Alert>
                        )}

                        {updateMessage && (
                          <Alert>
                            <AlertDescription>{updateMessage}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="flex-1 h-12"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateStudent}
                            disabled={updateLoading || !editForm.parent_name.trim()}
                            className="flex-1 h-12 bg-cocinarte-red hover:bg-cocinarte-red/90 text-white"
                          >
                            {updateLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Updating...
                              </div>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                          <div className="bg-cocinarte-orange/10 p-2 rounded-lg">
                            <ChefHat className="h-4 w-4 text-cocinarte-orange" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-slate-600">Child Name</span>
                            <p className="font-semibold text-slate-800">{studentInfo.child_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Phone className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-slate-600">Phone</span>
                            <p className="font-semibold text-slate-800">{studentInfo.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <MapPin className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-slate-600">Address</span>
                            <p className="font-semibold text-slate-800">{studentInfo.address || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-slate-200 shadow-sm">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">No Student Profile</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                      You haven't created a student profile yet. Book a class to get started!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Booked Classes Section */}
        <div className="mt-8">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <div className="bg-cocinarte-navy/10 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-cocinarte-navy" />
                </div>
                Booked Classes
              </CardTitle>
              <CardDescription className="text-slate-600">
                Your upcoming cooking class bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cocinarte-navy"></div>
                  <span className="ml-2 text-slate-600">Loading bookings...</span>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const canCancel = canCancelBooking(booking.class.date, booking.class.time)
                    const isCancelled = booking.booking_status === 'cancelled'

                    return (
                      <div key={booking.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="bg-cocinarte-red/10 p-2 rounded-lg">
                          <ChefHat className="h-5 w-5 text-cocinarte-red" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{booking.class.title}</h4>
                              <p className="text-sm text-slate-600">
                                {new Date(booking.class.date).toLocaleDateString()} at {booking.class.time}
                              </p>
                              <div className="mt-2 text-sm text-slate-500">
                                Duration: {booking.class.classDuration} minutes
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-right">
                                <p className="font-bold text-cocinarte-navy">${booking.payment_amount}</p>
                                <Badge
                                  variant={booking.booking_status === 'confirmed' ? 'default' : 'secondary'}
                                  className={
                                    booking.booking_status === 'confirmed'
                                      ? 'bg-green-100 text-green-800'
                                      : booking.booking_status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }
                                >
                                  {booking.booking_status}
                                </Badge>
                              </div>
                              {!isCancelled && canCancel && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelBooking(booking)}
                                  disabled={cancellingBookingId === booking.id}
                                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                                  title="Cancel booking"
                                >
                                  {cancellingBookingId === booking.id ? (
                                    <div className="flex items-center gap-1">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                      <span className="text-xs">Cancelling...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3 mr-1" />
                                      <span className="text-xs">Cancel</span>
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No Bookings Yet</h3>
                  <p className="text-slate-600">
                    You haven't booked any cooking classes yet. Book your first class to get started!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons - Full Width */}
        <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 mt-8">
          <Button 
            variant="outline" 
            onClick={() => setIsAccountOpen(false)}
            size="lg"
            className="px-8"
          >
            Close
          </Button>
          <Button 
            onClick={handleSignOut}
            size="lg"
            className="bg-cocinarte-red hover:bg-cocinarte-red/90 text-white px-8"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* Auth Popup */}
    <CocinarteAuthPopup
      isOpen={isAuthOpen}
      onClose={() => setIsAuthOpen(false)}
    />

    {/* Gift Card Purchase Popup */}
    <Dialog open={isGiftCardOpen} onOpenChange={(open) => {
      setIsGiftCardOpen(open)
      // Remove popup param from URL when closing
      if (!open && searchParams.get('popup') === 'giftcard') {
        router.replace(pathname, { scroll: false })
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Gift className="h-6 w-6 text-cocinarte-orange" />
            Purchase a Gift Card
          </DialogTitle>
          <DialogDescription>
            Give the gift of cooking! Send a Cocinarte gift card to someone special.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <GiftCardPurchase onSuccess={() => {
            setTimeout(() => setIsGiftCardOpen(false), 3000)
          }} />
        </div>
      </DialogContent>
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
    </header>
  )
}

// Wrap with Suspense to handle useSearchParams during static generation
export default function CocinarteHeader() {
  return (
    <Suspense fallback={
      <header className="bg-cocinarte-navy shadow-xl w-full fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1600px] mx-auto pl-0 pr-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
            <div className="flex items-center flex-shrink-0 justify-start">
              <div className="h-12 sm:h-14 lg:h-20 w-[100px] sm:w-[120px] lg:w-[200px]" />
            </div>
          </div>
        </div>
      </header>
    }>
      <CocinarteHeaderInner />
    </Suspense>
  )
}
