'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clase } from '@/lib/types/clases'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar, Clock, Users, Mail, Phone, DollarSign, User, Loader2,
  AlertCircle, Send, CheckCircle2, Camera, CameraOff, FileCheck,
  FileX, AlertTriangle, Tag, CreditCard, Ticket, Download, FileSpreadsheet, FileText
} from 'lucide-react'

interface EnrolledStudent {
  id: string
  booking_id: string
  child_name: string
  parent_name: string
  email: string
  phone?: string
  booking_status: string
  payment_status: string
  payment_amount: number
  booking_date: string
  notes?: string
  booking_comments?: string
  extra_children?: number
  // Child details
  child_age?: number
  allergies?: string
  dietary_restrictions?: string
  medical_conditions?: string
  media_permission?: boolean
  // Consent form
  consent_signed?: boolean
  social_media_consent?: boolean
  liability_consent?: boolean
}

interface ClassStudentsPopupProps {
  clase: Clase | null
  isOpen: boolean
  onClose: () => void
}

// Email templates
const EMAIL_TEMPLATES = {
  reminder: {
    name: 'Class Reminder',
    subject: 'Reminder: Upcoming Cooking Class',
    message: `This is a friendly reminder about the upcoming cooking class.\n\nPlease remember to:\n• Arrive 10 minutes early\n• Wear comfortable clothes\n• Bring any required supplies if mentioned\n\nWe're excited to see you there!\n\nBest regards,\nCocinarte Team`
  },
  update: {
    name: 'Important Update',
    subject: 'Important Update About Your Class',
    message: `We have an important update regarding your upcoming cooking class.\n\n[Please add your update here]\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nCocinarte Team`
  },
  supplies: {
    name: 'Supplies Needed',
    subject: 'Supplies Needed for Class',
    message: `Please bring the following supplies to the upcoming class:\n\n• [Item 1]\n• [Item 2]\n• [Item 3]\n\nIf you have any questions about the supplies, please let us know.\n\nBest regards,\nCocinarte Team`
  },
  custom: {
    name: 'Custom Message',
    subject: '',
    message: ''
  }
}

export function ClassStudentsPopup({ clase, isOpen, onClose }: ClassStudentsPopupProps) {
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Email form state
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  useEffect(() => {
    if (isOpen && clase) {
      fetchEnrolledStudents()
    }
  }, [isOpen, clase])

  const fetchEnrolledStudents = async () => {
    if (!clase) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_status,
          payment_status,
          payment_amount,
          booking_date,
          notes,
          booking_comments,
          extra_children,
          student_id,
          child_id,
          students (
            id,
            parent_name,
            child_name,
            email,
            phone
          ),
          children (
            id,
            child_full_name,
            child_age,
            allergies,
            dietary_restrictions,
            medical_conditions,
            media_permission
          )
        `)
        .eq('class_id', clase.id)
        .order('booking_date', { ascending: true })

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
        setError('Failed to load enrolled students')
        return
      }

      // Fetch consent forms for all children in this class
      const childIds = (bookings || [])
        .map((b: any) => b.child_id)
        .filter(Boolean)

      let consentMap: Record<string, any> = {}
      if (childIds.length > 0) {
        const { data: consentForms } = await supabase
          .from('consent_forms')
          .select('child_id, social_media_consent, liability_consent, signed_at')
          .in('child_id', childIds)
          .is('revoked_at', null)
          .order('signed_at', { ascending: false })

        if (consentForms) {
          consentForms.forEach((cf: any) => {
            if (!consentMap[cf.child_id]) {
              consentMap[cf.child_id] = cf
            }
          })
        }
      }

      const enrolledStudents: EnrolledStudent[] = (bookings || []).map((booking: any) => {
        const child = booking.children
        const consent = booking.child_id ? consentMap[booking.child_id] : null

        return {
          id: booking.students?.id || booking.student_id,
          booking_id: booking.id,
          child_name: child?.child_full_name || booking.students?.child_name || 'Unknown',
          parent_name: booking.students?.parent_name || 'Unknown',
          email: booking.students?.email || '',
          phone: booking.students?.phone || '',
          booking_status: booking.booking_status,
          payment_status: booking.payment_status,
          payment_amount: booking.payment_amount,
          booking_date: booking.booking_date,
          notes: booking.notes,
          booking_comments: booking.booking_comments,
          extra_children: booking.extra_children || 0,
          child_age: child?.child_age ?? undefined,
          allergies: child?.allergies || undefined,
          dietary_restrictions: child?.dietary_restrictions || undefined,
          medical_conditions: child?.medical_conditions || undefined,
          media_permission: child?.media_permission ?? undefined,
          consent_signed: !!consent,
          social_media_consent: consent?.social_media_consent ?? undefined,
          liability_consent: consent?.liability_consent ?? undefined,
        }
      })

      setStudents(enrolledStudents)
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while loading students')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey)
    const template = EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES]
    if (template) {
      setEmailSubject(template.subject)
      setEmailMessage(template.message)
    }
  }

  const handleSendEmail = async () => {
    if (!clase || !emailSubject.trim() || !emailMessage.trim()) {
      setEmailError('Please fill in both subject and message')
      return
    }

    setSendingEmail(true)
    setEmailError(null)
    setEmailSuccess(null)

    try {
      const response = await fetch('/api/classes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: clase.id,
          subject: emailSubject,
          message: emailMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails')
      }

      setEmailSuccess(`Successfully sent ${data.stats.sent} email(s)!`)

      setTimeout(() => {
        setShowEmailForm(false)
        setEmailSubject('')
        setEmailMessage('')
        setSelectedTemplate('')
        setEmailSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error sending emails:', err)
      setEmailError(err.message || 'Failed to send emails')
    } finally {
      setSendingEmail(false)
    }
  }

  const resetEmailForm = () => {
    setShowEmailForm(false)
    setEmailSubject('')
    setEmailMessage('')
    setSelectedTemplate('')
    setEmailError(null)
    setEmailSuccess(null)
  }

  const confirmedStudents = students.filter(s => s.booking_status === 'confirmed' || s.booking_status === 'pending')
  const cancelledStudents = students.filter(s => s.booking_status === 'cancelled')
  const totalChildren = confirmedStudents.reduce((sum, s) => sum + 1 + (s.extra_children || 0), 0)
  const totalRevenue = confirmedStudents.reduce((sum, s) => sum + s.payment_amount, 0)

  const getStudentRows = () => {
    return confirmedStudents.map(s => [
      s.child_name,
      s.child_age != null ? String(s.child_age) : '-',
      s.parent_name,
      s.email,
      s.phone || '-',
      s.media_permission === true ? 'Yes' : s.media_permission === false ? 'No' : '-',
      s.consent_signed ? 'Yes' : 'No',
      s.allergies || 'None',
      s.dietary_restrictions || 'None',
      s.medical_conditions || 'None',
      s.booking_comments || '',
      s.payment_status,
      `$${s.payment_amount.toFixed(2)}`,
    ])
  }

  const headers = [
    'Child Name', 'Age', 'Parent', 'Email', 'Phone',
    'Photos OK', 'Forms Signed', 'Allergies', 'Dietary',
    'Medical', 'Comment', 'Payment', 'Amount',
  ]

  const handleDownloadCsv = () => {
    if (!clase || confirmedStudents.length === 0) return

    const escCsv = (val: string) => {
      if (!val) return ''
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    }

    const rows = getStudentRows().map(row => row.map(cell => escCsv(cell)))
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeTitle = clase.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)
    link.href = url
    link.download = `${safeTitle}_students.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPdf = async () => {
    if (!clase || confirmedStudents.length === 0) return

    const jsPDFModule = await import('jspdf')
    const autoTableModule = await import('jspdf-autotable')
    const jsPDF = jsPDFModule.default
    const autoTable = autoTableModule.default

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const safeTitle = clase.title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 60)

    // Title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(safeTitle, 14, 15)

    // Subtitle
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    const dateStr = new Date(clase.date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    doc.text(`${dateStr}  |  ${confirmedStudents.length} enrolled  |  ${totalChildren} children`, 14, 22)
    doc.setTextColor(0)

    // Table
    const rows = getStudentRows()
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 28,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [0, 173, 238], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 28 },  // Child Name
        1: { cellWidth: 10 },  // Age
        2: { cellWidth: 25 },  // Parent
        3: { cellWidth: 35 },  // Email
        4: { cellWidth: 22 },  // Phone
        5: { cellWidth: 14 },  // Photos
        6: { cellWidth: 14 },  // Forms
        7: { cellWidth: 25 },  // Allergies
        8: { cellWidth: 20 },  // Dietary
        9: { cellWidth: 20 },  // Medical
        10: { cellWidth: 30 }, // Comment
        11: { cellWidth: 16 }, // Payment
        12: { cellWidth: 16 }, // Amount
      },
      didParseCell: (data: any) => {
        // Highlight allergy cells in red
        if (data.column.index === 7 && data.cell.raw && data.cell.raw !== 'None') {
          data.cell.styles.textColor = [185, 28, 28]
          data.cell.styles.fontStyle = 'bold'
        }
        // Highlight "No" for photos/forms
        if ((data.column.index === 5 || data.column.index === 6) && data.cell.raw === 'No') {
          data.cell.styles.textColor = [185, 28, 28]
        }
      },
    })

    const fileName = clase.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)
    doc.save(`${fileName}_students.pdf`)
  }

  if (!clase) return null

  const formatDate = (dateString: string) => {
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

  const getPaymentLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Paid'
      case 'held': return 'Held'
      case 'pending': return 'Pending'
      case 'failed': return 'Failed'
      case 'refunded': return 'Refunded'
      default: return status
    }
  }

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'held': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'refunded': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Extract relevant details from booking notes
  const getNoteDetails = (notes: string) => {
    const details: { label: string; icon: typeof Tag }[] = []
    const couponMatch = notes.match(/Coupon\s+(\w+)\s+applied\s*\(([^)]+)\)/)
    const giftCardMatch = notes.match(/Gift card used:\s*(\$[\d.]+)/)
    const extraChildrenMatch = notes.match(/Children attending\s*\((\d+)\):\s*([^.]+)/)
    if (couponMatch) details.push({ label: `Coupon ${couponMatch[1]} (${couponMatch[2]})`, icon: Ticket })
    if (giftCardMatch) details.push({ label: `Gift card ${giftCardMatch[1]}`, icon: CreditCard })
    if (extraChildrenMatch) details.push({ label: `${extraChildrenMatch[2].trim()}`, icon: Users })
    return details
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold">{clase.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-slate-500">Date</p>
                <p className="text-sm font-medium text-slate-800">
                  {new Date(clase.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-slate-500">Time</p>
                <p className="text-sm font-medium text-slate-800">{formatTime(clase.time)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-slate-500">Enrolled</p>
                <p className="text-sm font-medium text-slate-800">{totalChildren}/{clase.maxStudents}</p>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-slate-500">Revenue</p>
                <p className="text-sm font-medium text-green-700">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="border-t" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              <span className="ml-3 text-slate-500">Loading students...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Users className="h-10 w-10 mb-3" />
              <p className="font-medium">No students enrolled yet</p>
              <p className="text-sm mt-1">Students will appear here once they book.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Enrolled Students */}
              {confirmedStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <h3 className="text-sm font-semibold text-slate-600">
                      {confirmedStudents.length} Enrolled
                    </h3>
                  </div>

                  {confirmedStudents.map((student, index) => {
                    const noteDetails = student.notes ? getNoteDetails(student.notes) : []
                    const hasHealthInfo = student.allergies || student.dietary_restrictions || student.medical_conditions

                    return (
                      <div key={student.booking_id} className="border rounded-lg overflow-hidden">
                        {/* Student Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center h-7 w-7 rounded-full bg-white border text-xs font-bold text-slate-500">
                              {index + 1}
                            </span>
                            <div>
                              <h4 className="font-semibold text-slate-900">{student.child_name}</h4>
                              <p className="text-xs text-slate-500">Parent: {student.parent_name}</p>
                            </div>
                            {student.extra_children != null && student.extra_children > 0 && (
                              <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                                +{student.extra_children} extra
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getPaymentColor(student.payment_status)} border-0 text-xs`}>
                              {getPaymentLabel(student.payment_status)}
                            </Badge>
                            <span className="text-sm font-semibold text-slate-700">
                              ${student.payment_amount.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Student Body */}
                        <div className="px-4 py-3 space-y-3">
                          {/* Contact Row */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                            <a href={`mailto:${student.email}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                              <Mail className="h-3.5 w-3.5" />
                              {student.email}
                            </a>
                            {student.phone && (
                              <a href={`tel:${student.phone}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                <Phone className="h-3.5 w-3.5" />
                                {student.phone}
                              </a>
                            )}
                          </div>

                          {/* Status Badges Row */}
                          <div className="flex flex-wrap gap-1.5">
                            {student.media_permission !== undefined && (
                              student.media_permission ? (
                                <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50/50 text-xs gap-1 font-normal">
                                  <Camera className="h-3 w-3" /> Photos OK
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50/50 text-xs gap-1 font-normal">
                                  <CameraOff className="h-3 w-3" /> No Photos
                                </Badge>
                              )
                            )}
                            {student.consent_signed ? (
                              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50/50 text-xs gap-1 font-normal">
                                <FileCheck className="h-3 w-3" /> Forms Signed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50/50 text-xs gap-1 font-normal">
                                <FileX className="h-3 w-3" /> Forms Not Signed
                              </Badge>
                            )}
                            {student.allergies && (
                              <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50/50 text-xs gap-1 font-normal">
                                <AlertTriangle className="h-3 w-3" /> Allergies
                              </Badge>
                            )}
                          </div>

                          {/* Note Details (coupon, gift card) */}
                          {noteDetails.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {noteDetails.map((detail, i) => {
                                const Icon = detail.icon
                                return (
                                  <Badge key={i} variant="outline" className="text-slate-600 border-slate-200 text-xs gap-1 font-normal">
                                    <Icon className="h-3 w-3" /> {detail.label}
                                  </Badge>
                                )
                              })}
                            </div>
                          )}

                          {/* Health Info */}
                          {hasHealthInfo && (
                            <div className="bg-red-50 border border-red-100 rounded-md px-3 py-2 text-sm space-y-0.5">
                              {student.allergies && (
                                <p className="text-red-800"><span className="font-semibold">Allergies:</span> {student.allergies}</p>
                              )}
                              {student.dietary_restrictions && (
                                <p className="text-red-800"><span className="font-semibold">Dietary:</span> {student.dietary_restrictions}</p>
                              )}
                              {student.medical_conditions && (
                                <p className="text-red-800"><span className="font-semibold">Medical:</span> {student.medical_conditions}</p>
                              )}
                            </div>
                          )}

                          {/* Parent Comment */}
                          {student.booking_comments && (
                            <div className="bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                              <p className="text-xs font-medium text-amber-700 mb-0.5">Parent Comment</p>
                              <p className="text-sm text-amber-900">{student.booking_comments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Cancelled Students */}
              {cancelledStudents.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <h3 className="text-sm font-semibold text-slate-600">
                      {cancelledStudents.length} Cancelled
                    </h3>
                  </div>

                  {cancelledStudents.map((student) => (
                    <div key={student.booking_id} className="border border-slate-200 rounded-lg px-4 py-3 opacity-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-700">{student.child_name}</p>
                          <p className="text-xs text-slate-400">Parent: {student.parent_name} &middot; {student.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-700 border-0 text-xs">Cancelled</Badge>
                          <Badge className={`${getPaymentColor(student.payment_status)} border-0 text-xs`}>
                            {getPaymentLabel(student.payment_status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t px-6 py-3 flex justify-between items-center bg-slate-50/50">
          <div className="flex gap-2">
            {confirmedStudents.length > 0 && (
              <>
                <Button
                  size="sm"
                  onClick={() => setShowEmailForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email All
                </Button>
                <div className="relative">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download List
                  </Button>
                  {showDownloadMenu && (
                    <div className="absolute bottom-full left-0 mb-1 bg-white border rounded-lg shadow-lg py-1 w-44 z-50">
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        onClick={() => { handleDownloadCsv(); setShowDownloadMenu(false) }}
                      >
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        Download as CSV
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                        onClick={() => { handleDownloadPdf(); setShowDownloadMenu(false) }}
                      >
                        <FileText className="h-4 w-4 text-red-600" />
                        Download as PDF
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Email Form Dialog */}
      <Dialog open={showEmailForm} onOpenChange={resetEmailForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Email to All Enrolled Students
            </DialogTitle>
            <DialogDescription>
              Send an email to all {confirmedStudents.length} enrolled student{confirmedStudents.length !== 1 ? 's' : ''} in {clase.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or write custom..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Each email will be personalized with the student's name.
              </p>
            </div>

            {emailError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {emailError}
              </div>
            )}
            {emailSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle2 className="h-4 w-4" />
                {emailSuccess}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={resetEmailForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {confirmedStudents.length} Student{confirmedStudents.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
