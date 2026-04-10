"use client"

import { useMemo, useState, useEffect, type JSX } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Mail, Phone, Search, Baby, AlertCircle, ChefHat, Camera, Shield, FileCheck, XCircle, Download, Eye, Send, Tag, BookOpen, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { jsPDF } from 'jspdf'
import { toast } from 'sonner'
import {
  SOCIAL_MEDIA_CONSENT_TEXT,
  LIABILITY_CONSENT_TEXT,
} from '@/types/consent'

type ConsentForm = {
  id: string
  social_media_consent: boolean
  liability_consent: boolean
  signed_at: string
  parent_name_signed: string
  signature_url?: string | null
}

type Child = {
  id: string
  child_full_name: string
  child_preferred_name?: string | null
  child_age: number
  allergies?: string | null
  dietary_restrictions?: string | null
  has_cooking_experience?: boolean
  cooking_experience_details?: string | null
  medical_conditions?: string | null
  emergency_medications?: string | null
  consent_form?: ConsentForm | null
}

type Parent = {
  id: string
  user_id: string
  parent_guardian_names: string
  parent_email: string
  parent_phone?: string | null
  address?: string | null
  created_at?: string
  children?: Child[]
}

type PastClass = {
  booking_id: string
  class_title: string
  class_date: string
  class_time: string
}

interface StudentsClientProps {
  initialParents: Parent[]
}

export function StudentsClient({ initialParents }: StudentsClientProps): JSX.Element {
  const searchParams = useSearchParams()
  const [parents, setParents] = useState<Parent[]>(initialParents)
  const [query, setQuery] = useState('')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [isContractOpen, setIsContractOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null)
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Class history state
  const [classHistory, setClassHistory] = useState<Record<string, PastClass[]>>({})
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Coupon sending state
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)
  const [coupons, setCoupons] = useState<any[]>([])
  const [selectedCouponId, setSelectedCouponId] = useState('')
  const [isSendingCoupon, setIsSendingCoupon] = useState(false)
  const [loadingCoupons, setLoadingCoupons] = useState(false)

  // Handle student query parameter to auto-open details
  useEffect(() => {
    const studentId = searchParams.get('student')
    const childName = searchParams.get('childName')
    const parentEmail = searchParams.get('parentEmail')

    if (parents.length > 0 && (studentId || (childName && parentEmail))) {
      let parentWithChild = null
      let matchedChildId = null

      // Try to match by child name and parent email (more reliable)
      if (childName && parentEmail) {
        parentWithChild = parents.find(parent =>
          parent.parent_email.toLowerCase() === parentEmail.toLowerCase() &&
          parent.children?.some(child => {
            const match = child.child_full_name.toLowerCase() === childName.toLowerCase()
            if (match) matchedChildId = child.id
            return match
          })
        )
      }

      // Fallback: try to match by student ID (in case IDs do match)
      if (!parentWithChild && studentId) {
        parentWithChild = parents.find(parent =>
          parent.children?.some(child => {
            const match = child.id === studentId
            if (match) matchedChildId = child.id
            return match
          })
        )
      }

      if (parentWithChild && matchedChildId) {
        setHighlightedStudentId(matchedChildId)
        setSelectedParent(parentWithChild)
        setIsDetailsOpen(true)
        if (parentWithChild.children?.length) {
          fetchClassHistory(parentWithChild.children)
        }
      }
    }
  }, [searchParams, parents])

  const fetchClassHistory = async (children: Child[]) => {
    if (!children.length) return
    setLoadingHistory(true)
    try {
      const supabase = createClient()
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'UTC' })
      const childIds = children.map(c => c.id)

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          child_id,
          class:clases (
            title,
            date,
            time
          )
        `)
        .in('child_id', childIds)
        .in('booking_status', ['confirmed', 'completed'])
        .not('class', 'is', null)

      if (error) throw error

      const historyMap: Record<string, PastClass[]> = {}
      for (const childId of childIds) {
        historyMap[childId] = []
      }

      if (data) {
        for (const booking of data) {
          const cls = booking.class as any
          if (cls && cls.date && cls.date < today) {
            historyMap[booking.child_id!]?.push({
              booking_id: booking.id,
              class_title: cls.title,
              class_date: cls.date,
              class_time: cls.time || '',
            })
          }
        }
      }

      // Sort each child's classes by date descending
      for (const childId of childIds) {
        historyMap[childId].sort((a, b) => b.class_date.localeCompare(a.class_date))
      }

      setClassHistory(historyMap)
    } catch (err) {
      console.error('Error fetching class history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const filtered = useMemo(() => {
    if (!query) return parents
    const q = query.toLowerCase()
    return parents.filter((p) => {
      const parentMatch = [
        p.parent_guardian_names,
        p.parent_email,
        p.parent_phone || '',
        p.address || ''
      ].join(' ').toLowerCase().includes(q)

      const childMatch = p.children?.some(c =>
        [c.child_full_name, c.child_preferred_name || ''].join(' ').toLowerCase().includes(q)
      )

      return parentMatch || childMatch
    })
  }, [parents, query])

  const openDetails = (parent: Parent) => {
    setSelectedParent(parent)
    setIsDetailsOpen(true)
    if (parent.children?.length) {
      fetchClassHistory(parent.children)
    }
  }

  const openContractPopup = (child: Child) => {
    setSelectedChild(child)
    setIsContractOpen(true)
  }

  const openEmailComposer = (parent: Parent) => {
    setSelectedParent(parent)
    setEmailSubject('')
    setEmailMessage('')
    setIsEmailComposerOpen(true)
  }

  const sendEmail = async () => {
    if (!selectedParent || !emailSubject.trim() || !emailMessage.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSendingEmail(true)

    try {
      const response = await fetch('/api/send-parent-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedParent.parent_email,
          subject: emailSubject,
          message: emailMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send email')
      }

      toast.success('Email sent successfully!')
      setIsEmailComposerOpen(false)
      setEmailSubject('')
      setEmailMessage('')
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const fetchCoupons = async () => {
    setLoadingCoupons(true)
    try {
      const response = await fetch('/api/coupons')
      const data = await response.json()
      // Filter only available coupons
      const availableCoupons = data.coupons.filter((c: any) => {
        const now = new Date()
        const isNotExpired = !c.expires_at || new Date(c.expires_at) > now
        const hasUsesLeft = !c.max_uses || c.current_uses < c.max_uses
        return isNotExpired && hasUsesLeft
      })
      setCoupons(availableCoupons)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoadingCoupons(false)
    }
  }

  const openCouponDialog = (parent: Parent) => {
    setSelectedParent(parent)
    setSelectedCouponId('')
    setIsCouponDialogOpen(true)
    fetchCoupons()
  }

  const sendCoupon = async () => {
    if (!selectedParent || !selectedCouponId) {
      toast.error('Please select a coupon')
      return
    }

    const selectedCoupon = coupons.find((c) => c.id === selectedCouponId)
    if (!selectedCoupon) {
      toast.error('Selected coupon not found')
      return
    }

    setIsSendingCoupon(true)

    try {
      const response = await fetch('/api/send-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          couponCode: selectedCoupon.code,
          discountType: selectedCoupon.discount_type,
          discountPercentage: selectedCoupon.discount_percentage,
          discountAmount: selectedCoupon.discount_amount,
          recipientEmail: selectedParent.parent_email,
          recipientName: selectedParent.parent_guardian_names,
          expiresAt: selectedCoupon.expires_at,
          maxUses: selectedCoupon.max_uses,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send coupon')
      }

      toast.success('Coupon sent successfully!')
      setIsCouponDialogOpen(false)
      setSelectedCouponId('')
    } catch (error) {
      console.error('Error sending coupon:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send coupon')
    } finally {
      setIsSendingCoupon(false)
    }
  }

  const generatePDF = async (child: Child) => {
    if (!child.consent_form) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    let yPosition = 20

    // Helper function to add wrapped text
    const addWrappedText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, maxWidth)

      // Check if we need a new page
      if (yPosition + (lines.length * (fontSize * 0.4)) > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        yPosition = 20
      }

      doc.text(lines, margin, yPosition)
      yPosition += lines.length * (fontSize * 0.4) + 5
    }

    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Cocinarte - Consent Form', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Child Info
    addWrappedText(`Child: ${child.child_full_name}`, 12, true)
    if (child.child_preferred_name) {
      addWrappedText(`Preferred Name: ${child.child_preferred_name}`, 11)
    }
    addWrappedText(`Age: ${child.child_age} years old`, 11)
    yPosition += 10

    // Social Media Consent Section
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.title, 14, true)
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.intro)
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.understanding)
    SOCIAL_MEDIA_CONSENT_TEXT.uses.forEach(use => {
      addWrappedText(`• ${use}`)
    })
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.privacy)
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.revocation)
    addWrappedText(`Social Media Consent: ${child.consent_form.social_media_consent ? 'GRANTED' : 'NOT GRANTED'}`, 11, true)
    yPosition += 10

    // Liability Consent Section
    addWrappedText(LIABILITY_CONSENT_TEXT.title, 14, true)
    addWrappedText(LIABILITY_CONSENT_TEXT.intro)
    addWrappedText(LIABILITY_CONSENT_TEXT.risks)
    addWrappedText(LIABILITY_CONSENT_TEXT.release)
    addWrappedText(LIABILITY_CONSENT_TEXT.disclosure)
    addWrappedText(`Liability Waiver: ${child.consent_form.liability_consent ? 'ACCEPTED' : 'NOT ACCEPTED'}`, 11, true)
    yPosition += 10

    // Signature Section
    addWrappedText('Signature Information', 14, true)
    addWrappedText(`Parent/Guardian Name: ${child.consent_form.parent_name_signed}`)
    addWrappedText(`Date Signed: ${new Date(child.consent_form.signed_at).toLocaleDateString()}`)
    yPosition += 5

    // Add signature image if available
    if (child.consent_form.signature_url) {
      try {
        // Check if we need a new page for signature
        if (yPosition + 50 > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          yPosition = 20
        }

        addWrappedText('Signature:', 11, true)

        // Fetch and add signature image
        const response = await fetch(child.consent_form.signature_url)
        const blob = await response.blob()
        const reader = new FileReader()

        await new Promise<void>((resolve, reject) => {
          reader.onloadend = () => {
            try {
              const base64data = reader.result as string
              doc.addImage(base64data, 'PNG', margin, yPosition, 80, 30)
              yPosition += 40
              resolve()
            } catch (e) {
              reject(e)
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (error) {
        console.error('Error adding signature to PDF:', error)
        addWrappedText('(Signature image could not be loaded)')
      }
    }

    // Footer
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text(`Generated on ${new Date().toLocaleString()}`, margin, doc.internal.pageSize.getHeight() - 10)

    // Save the PDF
    doc.save(`Cocinarte_Consent_${child.child_full_name.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Stats - Stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-auto">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search families..."
            className="pl-9 w-full sm:w-64"
          />
        </div>
        <div className="text-sm text-muted-foreground text-center sm:text-right">
          {filtered.length} {filtered.length === 1 ? 'family' : 'families'} • {filtered.reduce((sum, p) => sum + (p.children?.length || 0), 0)} children
        </div>
      </div>

      {/* Cards Grid - Single column on mobile */}
      <div className="grid gap-3 sm:gap-4 w-full grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
        {filtered.map((parent) => (
          <Card
            key={parent.id}
            className="cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => openDetails(parent)}
          >
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Parent Info */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base sm:text-lg leading-tight">{parent.parent_guardian_names}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{parent.parent_email}</p>
                    {parent.parent_phone && (
                      <p className="text-xs sm:text-sm text-muted-foreground">{parent.parent_phone}</p>
                    )}
                  </div>
                </div>

                {/* Children Info */}
                {parent.children && parent.children.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                      <Baby className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Children ({parent.children.length})
                    </div>
                    <div className="space-y-2">
                      {parent.children.map((child) => (
                        <div key={child.id} className="bg-muted/50 p-2 sm:p-2.5 rounded">
                          {/* Child name and age row */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                            <span className="font-medium">{child.child_full_name}</span>
                            {child.child_preferred_name && (
                              <span className="text-muted-foreground text-xs">({child.child_preferred_name})</span>
                            )}
                            <span className="text-muted-foreground text-xs">• Age {child.child_age}</span>
                          </div>
                          {/* Badges row - wrap on mobile */}
                          <div className="flex gap-1 flex-wrap mt-1.5">
                            {child.consent_form?.liability_consent ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                Waiver
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                No Waiver
                              </Badge>
                            )}
                            {child.consent_form?.social_media_consent && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Badge>
                            )}
                            {child.has_cooking_experience && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <ChefHat className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                Exp
                              </Badge>
                            )}
                            {(child.allergies || child.dietary_restrictions) && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Badge>
                            )}
                          </div>
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

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No families found matching your search.</p>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Family Details</DialogTitle>
          </DialogHeader>
          {selectedParent && (
            <div className="space-y-4 sm:space-y-6">
              {/* Parent Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Parent/Guardian
                </h3>
                <div className="grid gap-2 sm:gap-3 bg-muted/50 p-3 sm:p-4 rounded-lg">
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Name</div>
                    <div className="font-medium text-sm sm:text-base">{selectedParent.parent_guardian_names}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Email</div>
                    <div className="font-medium text-sm sm:text-base break-all">{selectedParent.parent_email}</div>
                  </div>
                  {selectedParent.parent_phone && (
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium text-sm sm:text-base">{selectedParent.parent_phone}</div>
                    </div>
                  )}
                  {selectedParent.address && (
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Address</div>
                      <div className="font-medium text-sm sm:text-base">{selectedParent.address}</div>
                    </div>
                  )}
                </div>

                {/* Contact buttons - full width on mobile */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {selectedParent.parent_phone && (
                    <>
                      <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                        <a href={`tel:${selectedParent.parent_phone}`} aria-label="Call">
                          <Phone className="h-4 w-4 mr-1.5" /> Call
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                        <a href={`sms:${selectedParent.parent_phone}`} aria-label="SMS">
                          <Phone className="h-4 w-4 mr-1.5" /> SMS
                        </a>
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    className={`${selectedParent.parent_phone ? 'col-span-2' : 'col-span-2'} sm:w-auto`}
                    onClick={(e) => {
                      e.stopPropagation()
                      openEmailComposer(selectedParent)
                    }}
                  >
                    <Mail className="h-4 w-4 mr-1.5" /> Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="col-span-2 sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      openCouponDialog(selectedParent)
                    }}
                  >
                    <Tag className="h-4 w-4 mr-1.5" /> Send Coupon
                  </Button>
                </div>
              </div>

              {/* Children Information */}
              {selectedParent.children && selectedParent.children.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                    <Baby className="h-4 w-4 sm:h-5 sm:w-5" />
                    Children ({selectedParent.children.length})
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedParent.children.map((child) => (
                      <Card
                        key={child.id}
                        className={`border-2 transition-all ${
                          highlightedStudentId === child.id
                            ? 'border-blue-500 bg-blue-50/50 shadow-md'
                            : ''
                        }`}
                      >
                        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 space-y-2 sm:space-y-3">
                          <div>
                            <h4 className="font-semibold text-base sm:text-lg">{child.child_full_name}</h4>
                            {child.child_preferred_name && (
                              <p className="text-xs sm:text-sm text-muted-foreground">Preferred: {child.child_preferred_name}</p>
                            )}
                            <p className="text-xs sm:text-sm text-muted-foreground">Age: {child.child_age}</p>
                          </div>

                          {/* Consent Forms Status */}
                          <div className={`border rounded-lg p-2.5 sm:p-3 ${child.consent_form ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                              <FileCheck className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${child.consent_form ? 'text-green-700' : 'text-red-700'}`} />
                              <span className={`text-xs sm:text-sm font-semibold ${child.consent_form ? 'text-green-800' : 'text-red-800'}`}>
                                Consent Forms
                              </span>
                            </div>
                            {child.consent_form ? (
                              <div className="space-y-1 ml-5 sm:ml-6">
                                <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1.5 sm:gap-2">
                                  <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                                  <span className="font-medium">Waiver:</span> Signed
                                </p>
                                <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1.5 sm:gap-2">
                                  <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                                  <span className="font-medium">Photo:</span>{' '}
                                  {child.consent_form.social_media_consent ? 'Yes' : 'No'}
                                </p>
                                <p className="text-[10px] sm:text-xs text-green-600 mt-1.5 sm:mt-2">
                                  Signed by {child.consent_form.parent_name_signed} on{' '}
                                  {new Date(child.consent_form.signed_at).toLocaleDateString()}
                                </p>
                                {child.consent_form && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] sm:text-xs h-6 sm:h-7 mt-1.5 sm:mt-2 px-2 sm:px-3"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openContractPopup(child)
                                    }}
                                  >
                                    <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    View Contract
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs sm:text-sm text-red-700 ml-5 sm:ml-6">
                                No consent signed yet.
                              </p>
                            )}
                          </div>

                          {/* Cooking Experience */}
                          {child.has_cooking_experience && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <ChefHat className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-700" />
                                <span className="text-xs sm:text-sm font-semibold text-green-800">Has Cooking Experience</span>
                              </div>
                              {child.cooking_experience_details && (
                                <p className="text-xs sm:text-sm text-green-700 ml-5 sm:ml-6">{child.cooking_experience_details}</p>
                              )}
                            </div>
                          )}

                          {/* Health & Safety Information */}
                          {(child.allergies || child.dietary_restrictions || child.medical_conditions || child.emergency_medications) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-700" />
                                <span className="text-xs sm:text-sm font-semibold text-yellow-800">Health & Safety</span>
                              </div>
                              <div className="space-y-1 ml-5 sm:ml-6 text-xs sm:text-sm text-yellow-800">
                                {child.allergies && (
                                  <p><span className="font-medium">Allergies:</span> {child.allergies}</p>
                                )}
                                {child.dietary_restrictions && (
                                  <p><span className="font-medium">Diet:</span> {child.dietary_restrictions}</p>
                                )}
                                {child.medical_conditions && (
                                  <p><span className="font-medium">Medical:</span> {child.medical_conditions}</p>
                                )}
                                {child.emergency_medications && (
                                  <p><span className="font-medium">Meds:</span> {child.emergency_medications}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Class History */}
                          <div className="border rounded-lg p-2.5 sm:p-3 bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                              <span className="text-xs sm:text-sm font-semibold">Past Classes</span>
                            </div>
                            {loadingHistory ? (
                              <p className="text-xs sm:text-sm text-muted-foreground ml-5 sm:ml-6">Loading...</p>
                            ) : (classHistory[child.id] ?? []).length > 0 ? (
                              <div className="ml-5 sm:ml-6 space-y-1">
                                {(classHistory[child.id] ?? []).map((pc) => (
                                  <div key={pc.booking_id} className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground flex-shrink-0" />
                                    <span className="text-muted-foreground">
                                      {new Date(pc.class_date + 'T00:00:00Z').toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        timeZone: 'UTC',
                                      })}
                                    </span>
                                    <span className="font-medium">{pc.class_title}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs sm:text-sm text-muted-foreground ml-5 sm:ml-6">No past classes found.</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="pt-2 sm:pt-0">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="w-full sm:w-auto">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Composer Dialog */}
      <Dialog open={isEmailComposerOpen} onOpenChange={setIsEmailComposerOpen}>
        <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Send Email</DialogTitle>
            <DialogDescription>
              {selectedParent && (
                <span className="text-sm">
                  Sending to: <span className="font-medium">{selectedParent.parent_guardian_names}</span> ({selectedParent.parent_email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                placeholder="Enter email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                disabled={isSendingEmail}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                placeholder="Enter your message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                disabled={isSendingEmail}
                rows={10}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0">
            <Button
              variant="outline"
              onClick={() => setIsEmailComposerOpen(false)}
              disabled={isSendingEmail}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={sendEmail}
              disabled={isSendingEmail || !emailSubject.trim() || !emailMessage.trim()}
              className="w-full sm:w-auto"
            >
              {isSendingEmail ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coupon Sending Dialog */}
      <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Send Coupon</DialogTitle>
            <DialogDescription>
              {selectedParent && (
                <span className="text-sm">
                  Sending to: <span className="font-medium">{selectedParent.parent_guardian_names}</span> ({selectedParent.parent_email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-select">Select Coupon</Label>
              {loadingCoupons ? (
                <div className="flex items-center justify-center py-4">
                  <span className="animate-spin mr-2">⏳</span>
                  Loading coupons...
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No available coupons found
                </div>
              ) : (
                <Select value={selectedCouponId} onValueChange={setSelectedCouponId} disabled={isSendingCoupon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a coupon" />
                  </SelectTrigger>
                  <SelectContent>
                    {coupons.map((coupon) => {
                      const discountDisplay = coupon.discount_type === 'fixed'
                        ? `$${coupon.discount_amount} OFF`
                        : `${coupon.discount_percentage}% OFF`
                      return (
                        <SelectItem key={coupon.id} value={coupon.id}>
                          {coupon.code} - {discountDisplay}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedCouponId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  The coupon will be sent via email with instructions on how to use it.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0">
            <Button
              variant="outline"
              onClick={() => setIsCouponDialogOpen(false)}
              disabled={isSendingCoupon}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={sendCoupon}
              disabled={isSendingCoupon || !selectedCouponId || coupons.length === 0}
              className="w-full sm:w-auto"
            >
              {isSendingCoupon ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Coupon
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Popup Dialog */}
      <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Consent Form Contract</DialogTitle>
          </DialogHeader>
          {selectedChild && selectedChild.consent_form && (
            <div className="space-y-4 sm:space-y-6">
              {/* Child Info */}
              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{selectedChild.child_full_name}</h3>
                {selectedChild.child_preferred_name && (
                  <p className="text-xs sm:text-sm text-muted-foreground">Preferred: {selectedChild.child_preferred_name}</p>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">Age: {selectedChild.child_age}</p>
              </div>

              {/* Social Media Consent Section */}
              <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className="leading-tight">{SOCIAL_MEDIA_CONSENT_TEXT.title}</span>
                </h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <p>{SOCIAL_MEDIA_CONSENT_TEXT.intro}</p>
                  <p>{SOCIAL_MEDIA_CONSENT_TEXT.understanding}</p>
                  <ul className="list-disc list-inside ml-1 sm:ml-2 space-y-1">
                    {SOCIAL_MEDIA_CONSENT_TEXT.uses.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
                  </ul>
                  <p className="font-medium text-foreground">{SOCIAL_MEDIA_CONSENT_TEXT.privacy}</p>
                  <p>{SOCIAL_MEDIA_CONSENT_TEXT.revocation}</p>
                </div>
                <div className={`mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg ${selectedChild.consent_form.social_media_consent ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className={`text-xs sm:text-sm font-semibold ${selectedChild.consent_form.social_media_consent ? 'text-green-700' : 'text-gray-700'}`}>
                    Social Media: {selectedChild.consent_form.social_media_consent ? 'GRANTED' : 'NOT GRANTED'}
                  </p>
                </div>
              </div>

              {/* Liability Waiver Section */}
              <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  <span className="leading-tight">{LIABILITY_CONSENT_TEXT.title}</span>
                </h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <p>{LIABILITY_CONSENT_TEXT.intro}</p>
                  <p>{LIABILITY_CONSENT_TEXT.risks}</p>
                  <p>{LIABILITY_CONSENT_TEXT.release}</p>
                  <p className="font-medium text-foreground">{LIABILITY_CONSENT_TEXT.disclosure}</p>
                </div>
                <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs sm:text-sm font-semibold text-green-700">
                    Liability Waiver: ACCEPTED
                  </p>
                </div>
              </div>

              {/* Signature Section */}
              <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-3">Signature</h3>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <p><span className="text-muted-foreground">Parent:</span> <span className="font-medium">{selectedChild.consent_form.parent_name_signed}</span></p>
                  <p><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(selectedChild.consent_form.signed_at).toLocaleDateString()}</span></p>
                </div>
                {selectedChild.consent_form.signature_url && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white border rounded-lg">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">Signature:</p>
                    <img
                      src={selectedChild.consent_form.signature_url}
                      alt="Signature"
                      className="max-h-16 sm:max-h-24 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0">
            <Button
              variant="outline"
              onClick={() => setIsContractOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Close
            </Button>
            {selectedChild && selectedChild.consent_form && (
              <Button
                onClick={() => generatePDF(selectedChild)}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
