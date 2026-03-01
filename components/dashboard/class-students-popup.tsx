'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clase } from '@/lib/types/clases'
import { createClient } from '@/lib/supabase/client'
import type { EmailTemplate } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Calendar, Clock, Users, Mail, Phone, DollarSign, User, Loader2,
  AlertCircle, Send, CheckCircle2, Camera, CameraOff, FileCheck,
  FileX, AlertTriangle, Tag, CreditCard, Ticket, Download, FileSpreadsheet, FileText,
  Eye, XCircle, Code, Plus, ArrowLeft, Pencil, Save
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
  // Guest booking
  is_guest_booking?: boolean
  guest_parent_name?: string
  guest_parent_email?: string
  guest_form_completed?: boolean
  // Full guest child data (for detail view)
  guest_child_data?: {
    child_full_name?: string
    child_age?: number
    child_preferred_name?: string
    has_cooking_experience?: boolean
    cooking_experience_details?: string
    allergies?: string
    dietary_restrictions?: string
    medical_conditions?: string
    emergency_medications?: string
    additional_notes?: string
    authorized_pickup_persons?: string
    custody_restrictions?: string
    media_permission?: boolean
    guest_parent_name?: string
    guest_parent_phone?: string
    guest_parent_email?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relationship?: string
    liability_consent?: boolean
    social_media_consent?: boolean
    parent_name_signed?: string
    child_name_signed?: string
    signature_url?: string
    signed_at?: string
  }
}

interface ClassStudentsPopupProps {
  clase: Clase | null
  isOpen: boolean
  onClose: () => void
}

interface CampaignProgress {
  total: number
  sent: number
  failed: number
  currentBatch: number
  totalBatches: number
  errors: Array<{ email: string; error: string }>
  status: 'running' | 'completed' | 'failed'
}

function getDefaultTemplate() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px;">
        <h1 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hello {{first_name}}!</h1>
        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
          This is your email content. Edit this template to create your custom email.
        </p>
        <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #F0614F; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px;">
          Call to Action
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; background-color: #f8f8f8; text-align: center;">
        <p style="margin: 0; color: #999999; font-size: 12px;">
          &copy; 2024 Cocinarte PDX. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function ClassStudentsPopup({ clase, isOpen, onClose }: ClassStudentsPopupProps) {
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedGuestId, setExpandedGuestId] = useState<string | null>(null)

  // Template & email state
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)

  // Campaign state
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [activityLog, setActivityLog] = useState<Array<{ time: string; message: string; type: 'info' | 'success' | 'error' }>>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  // Test email state
  const [testEmail, setTestEmail] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testError, setTestError] = useState<string | null>(null)
  const [testSuccess, setTestSuccess] = useState(false)

  // Editor state
  const [editorMode, setEditorMode] = useState<'list' | 'editor'>('list')
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [editorName, setEditorName] = useState('')
  const [editorSubject, setEditorSubject] = useState('')
  const [editorHtml, setEditorHtml] = useState('')
  const [showEditorPreview, setShowEditorPreview] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)

  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [cancellingStudentId, setCancellingStudentId] = useState<string | null>(null)

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
          is_guest_booking,
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
          ),
          guest_bookings (
            guest_parent_name,
            guest_parent_email,
            guest_child_name,
            form_completed_at,
            guest_children (
              child_full_name,
              child_age,
              child_preferred_name,
              has_cooking_experience,
              cooking_experience_details,
              allergies,
              dietary_restrictions,
              medical_conditions,
              emergency_medications,
              additional_notes,
              authorized_pickup_persons,
              custody_restrictions,
              media_permission,
              guest_parent_name,
              guest_parent_phone,
              guest_parent_email,
              emergency_contact_name,
              emergency_contact_phone,
              emergency_contact_relationship,
              liability_consent,
              social_media_consent,
              parent_name_signed,
              child_name_signed,
              signature_url,
              signed_at
            )
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
        const guestBooking = booking.guest_bookings?.[0] || null
        // guest_children is a single object (many-to-one FK), not an array
        const guestChild = guestBooking?.guest_children || null

        // Detect guest booking from either the flag or the existence of a guest_bookings record
        const isGuest = booking.is_guest_booking === true || !!guestBooking

        return {
          id: booking.students?.id || booking.student_id,
          booking_id: booking.id,
          child_name: guestBooking?.guest_child_name || child?.child_full_name || booking.students?.child_name || 'Unknown',
          parent_name: guestBooking?.guest_parent_name || booking.students?.parent_name || 'Unknown',
          email: guestBooking?.guest_parent_email || booking.students?.email || '',
          phone: guestChild?.guest_parent_phone || booking.students?.phone || '',
          booking_status: booking.booking_status,
          payment_status: booking.payment_status,
          payment_amount: booking.payment_amount,
          booking_date: booking.booking_date,
          notes: booking.notes,
          booking_comments: booking.booking_comments,
          extra_children: booking.extra_children || 0,
          child_age: guestChild?.child_age ?? child?.child_age ?? undefined,
          allergies: guestChild?.allergies || child?.allergies || undefined,
          dietary_restrictions: guestChild?.dietary_restrictions || child?.dietary_restrictions || undefined,
          medical_conditions: guestChild?.medical_conditions || child?.medical_conditions || undefined,
          media_permission: guestChild?.media_permission ?? child?.media_permission ?? undefined,
          consent_signed: isGuest
            ? !!guestChild?.liability_consent
            : !!consent,
          social_media_consent: isGuest
            ? guestChild?.social_media_consent ?? undefined
            : consent?.social_media_consent ?? undefined,
          liability_consent: isGuest
            ? guestChild?.liability_consent ?? undefined
            : consent?.liability_consent ?? undefined,
          is_guest_booking: isGuest,
          guest_parent_name: guestBooking?.guest_parent_name,
          guest_parent_email: guestBooking?.guest_parent_email,
          guest_form_completed: !!guestBooking?.form_completed_at,
          guest_child_data: guestChild || undefined,
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

  const fetchTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('email_templates')
        .select('*')
        .order('updated_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching templates:', fetchError)
        return
      }
      setTemplates(data || [])
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleOpenEmailDialog = () => {
    setShowEmailDialog(true)
    fetchTemplates()
  }

  const resetCampaignState = () => {
    setCampaignProgress(null)
    setIsSending(false)
    setActivityLog([])
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  const resetTestState = () => {
    setTestEmail('')
    setTestError(null)
    setTestSuccess(false)
    setIsSendingTest(false)
  }

  const resetEditorState = () => {
    setEditorMode('list')
    setEditingTemplate(null)
    setEditorName('')
    setEditorSubject('')
    setEditorHtml('')
    setShowEditorPreview(false)
    setIsSavingTemplate(false)
    setEditorError(null)
  }

  const resetEmailDialog = () => {
    setShowEmailDialog(false)
    setSelectedTemplate(null)
    resetCampaignState()
    resetEditorState()
  }

  const getUniqueRecipients = () => {
    const seen = new Set<string>()
    const recipients: Array<{ email: string; first_name: string; last_name: string }> = []
    for (const s of confirmedStudents) {
      const email = s.email.toLowerCase().trim()
      if (email && !seen.has(email)) {
        seen.add(email)
        const parts = s.parent_name.split(' ')
        recipients.push({
          email: s.email,
          first_name: parts[0] || '',
          last_name: parts.slice(1).join(' ') || '',
        })
      }
    }
    return recipients
  }

  const buildClassContext = () => {
    if (!clase) return undefined
    const dateObj = new Date(clase.date + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    // Parse time string (HH:MM:SS) into a readable format
    const [hours, minutes] = (clase.time || '').split(':').map(Number)
    const timeDate = new Date(2000, 0, 1, hours || 0, minutes || 0)
    const formattedTime = timeDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    return {
      class_name: clase.title,
      class_date: formattedDate,
      class_time: formattedTime,
      class_description: clase.description || '',
      class_type: clase.class_type || '',
      class_price: `$${clase.price.toFixed(2)}`,
    }
  }

  const startCampaign = async (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsSending(true)
    setActivityLog([{ time: new Date().toLocaleTimeString(), message: 'Starting campaign...', type: 'info' }])

    const recipients = getUniqueRecipients()
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          recipients,
          classContext: buildClassContext(),
        }),
        signal: abortControllerRef.current.signal,
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Failed to start campaign')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: CampaignProgress = JSON.parse(line.slice(6))
              setCampaignProgress(data)

              if (data.status === 'running') {
                setActivityLog(prev => [
                  ...prev,
                  {
                    time: new Date().toLocaleTimeString(),
                    message: `Processing batch ${data.currentBatch}/${data.totalBatches} (${data.sent + data.failed}/${data.total})`,
                    type: 'info'
                  }
                ])
              } else if (data.status === 'completed') {
                setActivityLog(prev => [
                  ...prev,
                  {
                    time: new Date().toLocaleTimeString(),
                    message: `Campaign completed! ${data.sent} sent, ${data.failed} failed`,
                    type: data.failed > 0 ? 'error' : 'success'
                  }
                ])
              } else if (data.status === 'failed') {
                setActivityLog(prev => [
                  ...prev,
                  {
                    time: new Date().toLocaleTimeString(),
                    message: `Campaign failed: ${data.errors[0]?.error || 'Unknown error'}`,
                    type: 'error'
                  }
                ])
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setActivityLog(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString(), message: `Error: ${error.message}`, type: 'error' }
        ])
      }
    } finally {
      setIsSending(false)
    }
  }

  const sendTestEmail = async () => {
    if (!selectedTemplate || !testEmail) return

    setIsSendingTest(true)
    setTestError(null)
    setTestSuccess(false)

    try {
      const response = await fetch(`/api/emails/templates/${selectedTemplate.id}/send-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, classContext: buildClassContext() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }

      setTestSuccess(true)
    } catch (error) {
      setTestError(error instanceof Error ? error.message : 'Failed to send test email')
    } finally {
      setIsSendingTest(false)
    }
  }

  const openNewTemplate = () => {
    setEditingTemplate(null)
    setEditorName('')
    setEditorSubject('')
    setEditorHtml(getDefaultTemplate())
    setShowEditorPreview(false)
    setEditorError(null)
    setEditorMode('editor')
  }

  const openEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setEditorName(template.name)
    setEditorSubject(template.subject)
    setEditorHtml(template.html_content)
    setShowEditorPreview(false)
    setEditorError(null)
    setEditorMode('editor')
  }

  const handleSaveTemplate = async () => {
    if (!editorName.trim()) {
      setEditorError('Template name is required')
      return
    }
    if (!editorSubject.trim()) {
      setEditorError('Subject line is required')
      return
    }
    if (!editorHtml.trim()) {
      setEditorError('HTML content is required')
      return
    }

    setIsSavingTemplate(true)
    setEditorError(null)

    try {
      const url = editingTemplate
        ? `/api/emails/templates/${editingTemplate.id}`
        : '/api/emails/templates'
      const method = editingTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editorName.trim(),
          subject: editorSubject.trim(),
          html_content: editorHtml,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save template')
      }

      await fetchTemplates()
      resetEditorState()
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Failed to save template')
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const handleCancelStudent = async (student: EnrolledStudent) => {
    if (!clase) return

    const now = new Date()
    const classDateTime = new Date(`${clase.date}T${clase.time}`)
    const hoursUntil = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    const isLateCancel = hoursUntil < 48

    let refundEstimate = 0
    if (hoursUntil >= 48) {
      refundEstimate = student.payment_amount
    } else if (clase.late_cancel_refund_type && clase.late_cancel_refund_value != null) {
      if (clase.late_cancel_refund_type === 'percentage') {
        refundEstimate = Math.round(student.payment_amount * (clase.late_cancel_refund_value / 100) * 100) / 100
      } else if (clase.late_cancel_refund_type === 'fixed') {
        refundEstimate = Math.min(clase.late_cancel_refund_value, student.payment_amount)
      }
    }

    let msg = `Cancel booking for ${student.child_name} (Parent: ${student.parent_name})?\n\n`
    if (!isLateCancel) {
      msg += `Full refund of $${refundEstimate.toFixed(2)} will be issued.`
    } else if (refundEstimate > 0) {
      msg += `Late cancellation — refund of $${refundEstimate.toFixed(2)} will be issued.`
    } else {
      msg += `Late cancellation — no refund will be issued.`
    }

    if (!confirm(msg)) return

    setCancellingStudentId(student.booking_id)
    try {
      const response = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: student.booking_id }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to cancel booking')

      // Refresh student list
      await fetchEnrolledStudents()
    } catch (error: any) {
      console.error('Error cancelling student booking:', error)
      alert(error.message || 'Failed to cancel booking.')
    } finally {
      setCancellingStudentId(null)
    }
  }

  const safeFormatDate = (date: string) => {
    const d = new Date(date)
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
        {/* Header - compact on mobile */}
        <DialogHeader className="flex-shrink-0 px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl font-bold">{clase.title}</DialogTitle>
          <DialogDescription asChild>
            <div>
              {/* Mobile: compact inline stats */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500 sm:hidden">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(clase.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(clase.time)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {totalChildren}/{clase.maxStudents}
                </span>
                <span className="flex items-center gap-1 text-green-700">
                  <DollarSign className="h-3 w-3" />
                  ${totalRevenue.toFixed(2)}
                </span>
              </div>
              {/* Desktop: card stats */}
              <div className="hidden sm:grid grid-cols-4 gap-3 mt-3">
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
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="border-t" />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
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
                            {student.is_guest_booking && (
                              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                                Guest
                              </Badge>
                            )}
                            {student.is_guest_booking && !student.guest_form_completed && (
                              <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                                Form Pending
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
                            <button
                              onClick={() => handleCancelStudent(student)}
                              disabled={cancellingStudentId === student.booking_id}
                              className="ml-1 p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Cancel this booking"
                            >
                              {cancellingStudentId === student.booking_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </button>
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

                          {/* Guest Details Button & Panel */}
                          {student.is_guest_booking && student.guest_form_completed && student.guest_child_data && (
                            <div>
                              <button
                                onClick={() => setExpandedGuestId(expandedGuestId === student.booking_id ? null : student.booking_id)}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {expandedGuestId === student.booking_id ? 'Hide Guest Details' : 'View Guest Registration Details'}
                              </button>

                              {expandedGuestId === student.booking_id && (
                                <div className="mt-2 border border-blue-200 rounded-lg overflow-hidden">
                                  {/* Child Info */}
                                  <div className="bg-blue-50 px-3 py-2">
                                    <h5 className="text-xs font-semibold text-blue-800 flex items-center gap-1">
                                      <User className="h-3 w-3" /> Child Information
                                    </h5>
                                  </div>
                                  <div className="px-3 py-2 text-xs space-y-1">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                      {student.guest_child_data.child_full_name && <p><span className="font-medium text-slate-600">Full Name:</span> {student.guest_child_data.child_full_name}</p>}
                                      {student.guest_child_data.child_age != null && <p><span className="font-medium text-slate-600">Age:</span> {student.guest_child_data.child_age}</p>}
                                      {student.guest_child_data.child_preferred_name && <p><span className="font-medium text-slate-600">Preferred Name:</span> {student.guest_child_data.child_preferred_name}</p>}
                                      <p><span className="font-medium text-slate-600">Cooking Experience:</span> {student.guest_child_data.has_cooking_experience ? 'Yes' : 'No'}</p>
                                    </div>
                                    {student.guest_child_data.cooking_experience_details && (
                                      <p><span className="font-medium text-slate-600">Cooking Experience Details:</span> {student.guest_child_data.cooking_experience_details}</p>
                                    )}
                                  </div>

                                  {/* Health & Safety */}
                                  {(student.guest_child_data.allergies || student.guest_child_data.dietary_restrictions || student.guest_child_data.medical_conditions || student.guest_child_data.emergency_medications) && (
                                    <>
                                      <div className="bg-red-50 px-3 py-2 border-t border-blue-200">
                                        <h5 className="text-xs font-semibold text-red-800 flex items-center gap-1">
                                          <AlertTriangle className="h-3 w-3" /> Health & Safety
                                        </h5>
                                      </div>
                                      <div className="px-3 py-2 text-xs space-y-1">
                                        {student.guest_child_data.allergies && <p><span className="font-semibold text-red-700">Allergies:</span> {student.guest_child_data.allergies}</p>}
                                        {student.guest_child_data.dietary_restrictions && <p><span className="font-semibold text-red-700">Dietary Restrictions:</span> {student.guest_child_data.dietary_restrictions}</p>}
                                        {student.guest_child_data.medical_conditions && <p><span className="font-semibold text-red-700">Medical Conditions:</span> {student.guest_child_data.medical_conditions}</p>}
                                        {student.guest_child_data.emergency_medications && <p><span className="font-semibold text-red-700">Emergency Medications:</span> {student.guest_child_data.emergency_medications}</p>}
                                      </div>
                                    </>
                                  )}

                                  {/* Parent & Emergency Contact */}
                                  <div className="bg-green-50 px-3 py-2 border-t border-blue-200">
                                    <h5 className="text-xs font-semibold text-green-800 flex items-center gap-1">
                                      <Phone className="h-3 w-3" /> Parent & Emergency Contact
                                    </h5>
                                  </div>
                                  <div className="px-3 py-2 text-xs space-y-1">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                      {student.guest_child_data.guest_parent_name && <p><span className="font-medium text-slate-600">Parent Name:</span> {student.guest_child_data.guest_parent_name}</p>}
                                      {student.guest_child_data.guest_parent_phone && <p><span className="font-medium text-slate-600">Parent Phone:</span> {student.guest_child_data.guest_parent_phone}</p>}
                                      {student.guest_child_data.guest_parent_email && <p className="col-span-2"><span className="font-medium text-slate-600">Parent Email:</span> {student.guest_child_data.guest_parent_email}</p>}
                                    </div>
                                    {(student.guest_child_data.emergency_contact_name || student.guest_child_data.emergency_contact_phone) && (
                                      <div className="mt-1 pt-1 border-t border-green-100">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                          {student.guest_child_data.emergency_contact_name && <p><span className="font-medium text-slate-600">Emergency Contact:</span> {student.guest_child_data.emergency_contact_name}</p>}
                                          {student.guest_child_data.emergency_contact_phone && <p><span className="font-medium text-slate-600">Emergency Phone:</span> {student.guest_child_data.emergency_contact_phone}</p>}
                                          {student.guest_child_data.emergency_contact_relationship && <p><span className="font-medium text-slate-600">Relationship:</span> {student.guest_child_data.emergency_contact_relationship}</p>}
                                        </div>
                                      </div>
                                    )}
                                    {(student.guest_child_data.authorized_pickup_persons || student.guest_child_data.custody_restrictions) && (
                                      <div className="mt-1 pt-1 border-t border-green-100">
                                        {student.guest_child_data.authorized_pickup_persons && <p><span className="font-medium text-slate-600">Authorized Pick-up Persons:</span> {student.guest_child_data.authorized_pickup_persons}</p>}
                                        {student.guest_child_data.custody_restrictions && <p><span className="font-medium text-slate-600">Custody Restrictions:</span> {student.guest_child_data.custody_restrictions}</p>}
                                      </div>
                                    )}
                                  </div>

                                  {/* Consent & Signature */}
                                  <div className="bg-purple-50 px-3 py-2 border-t border-blue-200">
                                    <h5 className="text-xs font-semibold text-purple-800 flex items-center gap-1">
                                      <FileCheck className="h-3 w-3" /> Consent & Signature
                                    </h5>
                                  </div>
                                  <div className="px-3 py-2 text-xs space-y-1">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                      <p><span className="font-medium text-slate-600">Liability Consent:</span> {student.guest_child_data.liability_consent ? <span className="text-green-700 font-semibold">Signed</span> : <span className="text-red-600">Not signed</span>}</p>
                                      <p><span className="font-medium text-slate-600">Social Media Consent:</span> {student.guest_child_data.social_media_consent ? <span className="text-green-700 font-semibold">Allowed</span> : <span className="text-slate-500">Not allowed</span>}</p>
                                      <p><span className="font-medium text-slate-600">Media/Photo Permission:</span> {student.guest_child_data.media_permission ? <span className="text-green-700 font-semibold">Granted</span> : <span className="text-slate-500">Not granted</span>}</p>
                                    </div>
                                    <div className="mt-1 pt-1 border-t border-purple-100">
                                      {student.guest_child_data.parent_name_signed && <p><span className="font-medium text-slate-600">Parent Name Signed:</span> {student.guest_child_data.parent_name_signed}</p>}
                                      {student.guest_child_data.child_name_signed && <p><span className="font-medium text-slate-600">Child Name Signed:</span> {student.guest_child_data.child_name_signed}</p>}
                                      {student.guest_child_data.signed_at && <p><span className="font-medium text-slate-600">Signed on:</span> {new Date(student.guest_child_data.signed_at).toLocaleString()}</p>}
                                    </div>
                                    {student.guest_child_data.signature_url && (
                                      <div className="mt-2">
                                        <p className="font-medium text-slate-600 mb-1">Signature:</p>
                                        <img src={student.guest_child_data.signature_url} alt="Signature" className="h-16 border border-slate-200 rounded bg-white p-1" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Additional Notes */}
                                  {student.guest_child_data.additional_notes && (
                                    <>
                                      <div className="bg-slate-50 px-3 py-2 border-t border-blue-200">
                                        <h5 className="text-xs font-semibold text-slate-700">Additional Notes</h5>
                                      </div>
                                      <div className="px-3 py-2 text-xs">
                                        <p className="text-slate-600">{student.guest_child_data.additional_notes}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
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
        <div className="flex-shrink-0 border-t px-4 py-2 sm:px-6 sm:py-3 flex justify-between items-center bg-slate-50/50">
          <div className="flex gap-2">
            {confirmedStudents.length > 0 && (
              <>
                <Button
                  size="sm"
                  onClick={handleOpenEmailDialog}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Email All</span>
                </Button>
                {/* Mobile: direct download buttons */}
                <Button
                  size="sm"
                  variant="outline"
                  className="sm:hidden"
                  onClick={handleDownloadCsv}
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="sm:hidden"
                  onClick={handleDownloadPdf}
                >
                  <FileText className="h-4 w-4 text-red-600" />
                  PDF
                </Button>
                {/* Desktop: dropdown menu */}
                <div className="relative hidden sm:block">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download List
                  </Button>
                  {showDownloadMenu && (
                    <div className="absolute bottom-full left-0 mb-1 bg-white border rounded-lg shadow-lg py-1 w-44 z-[60]">
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

      {/* Email Templates Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={(open) => { if (!open) resetEmailDialog(); setShowEmailDialog(open) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email All Enrolled Students
            </DialogTitle>
            <DialogDescription>
              {campaignProgress
                ? `Sending "${selectedTemplate?.name}" to class students`
                : `Choose a template to send to ${getUniqueRecipients().length} parent${getUniqueRecipients().length !== 1 ? 's' : ''} (${confirmedStudents.length} student${confirmedStudents.length !== 1 ? 's' : ''})`
              }
            </DialogDescription>
          </DialogHeader>

          {campaignProgress ? (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{campaignProgress.sent + campaignProgress.failed} / {campaignProgress.total}</span>
                </div>
                <Progress
                  value={campaignProgress.total > 0 ? ((campaignProgress.sent + campaignProgress.failed) / campaignProgress.total) * 100 : 0}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-100 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{campaignProgress.sent}</p>
                  <p className="text-xs text-slate-500">Sent</p>
                </div>
                <div className="text-center p-3 bg-slate-100 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{campaignProgress.failed}</p>
                  <p className="text-xs text-slate-500">Failed</p>
                </div>
                <div className="text-center p-3 bg-slate-100 rounded-lg">
                  <p className="text-2xl font-bold">{campaignProgress.currentBatch}/{campaignProgress.totalBatches}</p>
                  <p className="text-xs text-slate-500">Batches</p>
                </div>
              </div>

              {/* Status */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                campaignProgress.status === 'completed' ? 'bg-green-50 text-green-700' :
                campaignProgress.status === 'failed' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {campaignProgress.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : campaignProgress.status === 'failed' ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                <span className="font-medium capitalize">{campaignProgress.status}</span>
              </div>

              {/* Activity Log */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Activity Log</p>
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {activityLog.map((log, i) => (
                    <div key={i} className={`px-3 py-2 text-sm border-b last:border-b-0 flex items-start gap-2 ${
                      log.type === 'error' ? 'bg-red-50' :
                      log.type === 'success' ? 'bg-green-50' : ''
                    }`}>
                      <span className="text-slate-400 text-xs whitespace-nowrap">{log.time}</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errors */}
              {campaignProgress.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">Errors ({campaignProgress.errors.length})</p>
                  <div className="border border-red-200 rounded-lg max-h-32 overflow-y-auto">
                    {campaignProgress.errors.map((error, i) => (
                      <div key={i} className="px-3 py-2 text-sm border-b last:border-b-0 bg-red-50">
                        <span className="font-medium">{error.email}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                {campaignProgress.status === 'completed' || campaignProgress.status === 'failed' ? (
                  <Button onClick={resetEmailDialog}>Close</Button>
                ) : (
                  <Button variant="outline" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </Button>
                )}
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-3">
              {editorMode === 'editor' ? (
                /* Inline Template Editor */
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetEditorState}
                      className="flex items-center gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <h3 className="font-medium">
                      {editingTemplate ? 'Edit Template' : 'New Template'}
                    </h3>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Template Name</label>
                      <Input
                        value={editorName}
                        onChange={(e) => setEditorName(e.target.value)}
                        placeholder="e.g., Welcome Email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject Line</label>
                      <Input
                        value={editorSubject}
                        onChange={(e) => setEditorSubject(e.target.value)}
                        placeholder="e.g., Welcome to our newsletter!"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">HTML Content</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowEditorPreview(false)}
                          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                            !showEditorPreview
                              ? 'bg-primary text-white'
                              : 'text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          <Code className="h-4 w-4" />
                          Code
                        </button>
                        <button
                          onClick={() => setShowEditorPreview(true)}
                          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                            showEditorPreview
                              ? 'bg-primary text-white'
                              : 'text-muted-foreground hover:bg-secondary'
                          }`}
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Available variables: {'{{first_name}}'}, {'{{last_name}}'}, {'{{email}}'}, {'{{full_name}}'}, {'{{class_name}}'}, {'{{class_date}}'}, {'{{class_time}}'}, {'{{class_description}}'}, {'{{class_type}}'}, {'{{class_price}}'}
                    </div>

                    {showEditorPreview ? (
                      <div className="border rounded-lg p-4 min-h-[300px] bg-white overflow-auto">
                        <div dangerouslySetInnerHTML={{ __html: editorHtml }} />
                      </div>
                    ) : (
                      <textarea
                        value={editorHtml}
                        onChange={(e) => setEditorHtml(e.target.value)}
                        className="w-full h-[300px] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder="Enter your HTML email template..."
                      />
                    )}
                  </div>

                  {editorError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p className="text-sm">{editorError}</p>
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={resetEditorState}>Cancel</Button>
                    <Button
                      onClick={handleSaveTemplate}
                      disabled={isSavingTemplate}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSavingTemplate ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {editingTemplate ? 'Update Template' : 'Save Template'}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                /* Template List */
                <>
                  <Button
                    size="sm"
                    onClick={openNewTemplate}
                    className="w-full flex items-center justify-center gap-2 border-dashed border-2 bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    New Template
                  </Button>

                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                      <span className="ml-3 text-slate-500">Loading templates...</span>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Mail className="h-10 w-10 mx-auto mb-3" />
                      <p className="font-medium">No email templates yet</p>
                      <p className="text-sm mt-1">Click &quot;New Template&quot; above to create one.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{template.name}</h3>
                            <p className="text-sm text-slate-500 truncate">
                              Subject: {template.subject}
                            </p>
                            <p className="text-xs text-slate-400">
                              Updated: {safeFormatDate(template.updated_at)}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                              onClick={() => startCampaign(template)}
                              disabled={isSending}
                            >
                              <Send className="h-3 w-3" />
                              Send
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditTemplate(template)}
                              className="flex items-center gap-1"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setSelectedTemplate(template); setShowPreviewModal(true) }}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setSelectedTemplate(template); setShowTestModal(true) }}
                              className="flex items-center gap-1"
                            >
                              <Mail className="h-3 w-3" />
                              Test
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={resetEmailDialog}>Close</Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Subject: {selectedTemplate?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg p-4 bg-white min-h-[400px] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: selectedTemplate?.html_content || '' }} />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPreviewModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Modal */}
      <Dialog open={showTestModal} onOpenChange={(open) => { if (!open) resetTestState(); setShowTestModal(open) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to preview &quot;{selectedTemplate?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {testError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{testError}</p>
              </div>
            )}
            {testSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm">Test email sent successfully!</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { resetTestState(); setShowTestModal(false) }}>
              Close
            </Button>
            <Button
              onClick={sendTestEmail}
              disabled={isSendingTest || !testEmail || testSuccess}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
