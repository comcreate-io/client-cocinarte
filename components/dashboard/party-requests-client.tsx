"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle, XCircle, Eye, Calendar, Users, Mail, Phone, Copy, Loader2,
  ChevronDown, ChevronUp, Camera, CameraOff, AlertTriangle, Baby, Shield, User, Download, Pencil, Plus, Ban,
  Send, ArrowLeft, Code, Save, Trash2, AlertCircle, CheckCircle2
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import type { EmailTemplate } from '@/lib/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PartyRequest {
  id: string
  preferred_date: string
  number_of_children: number
  package: string
  parent_name: string
  phone: string
  email: string
  child_name_age: string | null
  special_requests: string | null
  status: 'pending' | 'approved' | 'declined' | 'withdrawn'
  admin_notes: string | null
  dashboard_token: string
  created_at: string
  updated_at: string
}

interface PartyGuestInfo {
  id: string
  child_name: string
  parent_name: string
  parent_email: string
  form_completed_at: string | null
  email_sent_at: string | null
  guest_child_id: string | null
}

interface GuestChildDetails {
  id: string
  child_full_name: string
  child_age: number
  child_preferred_name: string | null
  has_cooking_experience: boolean
  cooking_experience_details: string | null
  allergies: string | null
  dietary_restrictions: string | null
  medical_conditions: string | null
  emergency_medications: string | null
  additional_notes: string | null
  authorized_pickup_persons: string | null
  custody_restrictions: string | null
  media_permission: boolean
  guest_parent_name: string
  guest_parent_phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  liability_consent: boolean
  social_media_consent: boolean
  parent_name_signed: string
  child_name_signed: string
  signed_at: string
}

interface EditFormData {
  package: string
  preferred_date: string
  number_of_children: number
  child_name_age: string
  parent_name: string
  email: string
  phone: string
  special_requests: string
  admin_notes: string
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

function getDefaultPartyTemplate() {
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
        <h1 style="margin: 0 0 20px; color: #F0614F; font-size: 24px;">Hello {{first_name}}!</h1>
        <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
          Thank you for joining us at the birthday party! Here is your email content.
        </p>
        <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #F0614F; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px;">
          Call to Action
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; background-color: #f8f8f8; text-align: center;">
        <p style="margin: 0; color: #999999; font-size: 12px;">
          &copy; ${new Date().getFullYear()} Cocinarte PDX. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function PartyRequestsClient() {
  const [requests, setRequests] = useState<PartyRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<PartyRequest[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<PartyRequest | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'decline'>('approve')
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [guestCounts, setGuestCounts] = useState<Record<string, { total: number; completed: number }>>({})
  const [selectedGuests, setSelectedGuests] = useState<PartyGuestInfo[]>([])
  const [guestsLoading, setGuestsLoading] = useState(false)
  const [copiedDashboardLink, setCopiedDashboardLink] = useState<string | null>(null)
  const [expandedGuests, setExpandedGuests] = useState<Set<string>>(new Set())
  const [childDetails, setChildDetails] = useState<Record<string, GuestChildDetails>>({})
  const [childDetailsLoading, setChildDetailsLoading] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [withdrawNotes, setWithdrawNotes] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  // Email state
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailPartyRequest, setEmailPartyRequest] = useState<PartyRequest | null>(null)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [campaignProgress, setCampaignProgress] = useState<CampaignProgress | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [activityLog, setActivityLog] = useState<Array<{ time: string; message: string; type: 'info' | 'success' | 'error' }>>([])
  const abortControllerRef = useRef<AbortController | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testError, setTestError] = useState<string | null>(null)
  const [testSuccess, setTestSuccess] = useState(false)
  const [editorMode, setEditorMode] = useState<'list' | 'editor' | 'quickEmail'>('list')
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [editorName, setEditorName] = useState('')
  const [editorSubject, setEditorSubject] = useState('')
  const [editorHtml, setEditorHtml] = useState('')
  const [showEditorPreview, setShowEditorPreview] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [quickEmailSubject, setQuickEmailSubject] = useState('')
  const [quickEmailMessage, setQuickEmailMessage] = useState('')
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null)

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    package: '',
    preferred_date: '',
    number_of_children: 1,
    child_name_age: '',
    parent_name: '',
    email: '',
    phone: '',
    special_requests: '',
    admin_notes: '',
  })

  const resetCreateForm = () => {
    setCreateFormData({
      package: '',
      preferred_date: '',
      number_of_children: 1,
      child_name_age: '',
      parent_name: '',
      email: '',
      phone: '',
      special_requests: '',
      admin_notes: '',
    })
  }

  const handleCreateParty = async () => {
    if (!createFormData.preferred_date || !createFormData.package || !createFormData.parent_name || !createFormData.email || !createFormData.phone) {
      setError('Please fill in all required fields (date, package, parent name, email, phone)')
      return
    }

    setCreateLoading(true)
    setError('')

    try {
      // Insert directly as approved
      const { data: inserted, error: dbError } = await supabase
        .from('party_requests')
        .insert({
          preferred_date: createFormData.preferred_date,
          number_of_children: createFormData.number_of_children,
          package: createFormData.package,
          parent_name: createFormData.parent_name,
          phone: createFormData.phone,
          email: createFormData.email,
          child_name_age: createFormData.child_name_age || null,
          special_requests: createFormData.special_requests || null,
          admin_notes: createFormData.admin_notes || null,
          status: 'approved',
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Send approval email with dashboard link
      const emailRes = await fetch('/api/party-request-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: inserted.id,
          action: 'approve',
          request: inserted,
          adminNotes: createFormData.admin_notes,
        }),
      })

      if (!emailRes.ok) {
        console.error('Failed to send approval email, but party was created')
      }

      await fetchRequests()
      setIsCreateDialogOpen(false)
      resetCreateForm()
      setSuccessMessage('Party created successfully and approval email sent!')
    } catch (err: any) {
      setError(err.message || 'Failed to create party')
    } finally {
      setCreateLoading(false)
    }
  }

  const supabase = createClient()

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('party_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
      setFilteredRequests(data || [])

      // Fetch guest counts for approved requests
      const approvedIds = (data || []).filter(r => r.status === 'approved').map(r => r.id)
      if (approvedIds.length > 0) {
        const { data: guests } = await supabase
          .from('party_guests')
          .select('party_request_id, form_completed_at')
          .in('party_request_id', approvedIds)

        const counts: Record<string, { total: number; completed: number }> = {}
        for (const g of (guests || [])) {
          if (!counts[g.party_request_id]) {
            counts[g.party_request_id] = { total: 0, completed: 0 }
          }
          counts[g.party_request_id].total++
          if (g.form_completed_at) {
            counts[g.party_request_id].completed++
          }
        }
        setGuestCounts(counts)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch party requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredRequests(requests)
    } else {
      setFilteredRequests(requests.filter(r => r.status === statusFilter))
    }
  }, [statusFilter, requests])

  const handleViewDetails = async (request: PartyRequest) => {
    setSelectedRequest(request)
    setSelectedGuests([])
    setExpandedGuests(new Set())
    setChildDetails({})
    setIsEditing(false)
    setEditFormData(null)
    setIsDetailsDialogOpen(true)

    if (request.status === 'approved') {
      setGuestsLoading(true)
      try {
        const res = await fetch(`/api/admin/party-guests?party_request_id=${request.id}`)
        const result = await res.json()

        if (result.success) {
          setSelectedGuests(result.guests || [])

          if (result.children) {
            const details: Record<string, GuestChildDetails> = {}
            for (const [id, child] of Object.entries(result.children)) {
              details[id] = child as GuestChildDetails
            }
            setChildDetails(details)
          }
        }
      } catch {
        // Non-blocking
      } finally {
        setGuestsLoading(false)
      }
    }
  }

  const toggleGuestExpanded = (guestId: string) => {
    setExpandedGuests(prev => {
      const next = new Set(prev)
      if (next.has(guestId)) {
        next.delete(guestId)
      } else {
        next.add(guestId)
      }
      return next
    })
  }

  const getChildForGuest = (guest: PartyGuestInfo): GuestChildDetails | null => {
    if (!guest.guest_child_id) return null
    return childDetails[guest.guest_child_id] || null
  }

  const handleCopyDashboardLink = (request: PartyRequest) => {
    const url = `${window.location.origin}/party-dashboard/${request.dashboard_token}`
    navigator.clipboard.writeText(url)
    setCopiedDashboardLink(request.id)
    setTimeout(() => setCopiedDashboardLink(null), 2000)
  }

  const handleDownloadGuestList = () => {
    if (!selectedRequest || selectedGuests.length === 0) return

    const headers = [
      'Child Name', 'Age', 'Preferred Name', 'Parent Name', 'Parent Email', 'Parent Phone',
      'Status', 'Allergies', 'Dietary Restrictions', 'Medical Conditions', 'Emergency Medications',
      'Photo Permission', 'Social Media Consent', 'Emergency Contact', 'Emergency Phone',
      'Emergency Relationship', 'Authorized Pickup', 'Custody Restrictions', 'Cooking Experience',
      'Additional Notes', 'Signed By', 'Signed Date'
    ]

    const escCsv = (val: string | null | undefined | boolean | number) => {
      if (val === null || val === undefined) return ''
      const s = String(val)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const rows = selectedGuests.map(guest => {
      const child = getChildForGuest(guest)
      const status = guest.form_completed_at ? 'Completed' : guest.email_sent_at ? 'Email Sent' : 'Pending'

      return [
        escCsv(guest.child_name),
        escCsv(child?.child_age),
        escCsv(child?.child_preferred_name),
        escCsv(guest.parent_name),
        escCsv(guest.parent_email),
        escCsv(child?.guest_parent_phone),
        escCsv(status),
        escCsv(child?.allergies),
        escCsv(child?.dietary_restrictions),
        escCsv(child?.medical_conditions),
        escCsv(child?.emergency_medications),
        escCsv(child?.media_permission ? 'Yes' : child ? 'No' : ''),
        escCsv(child?.social_media_consent ? 'Yes' : child ? 'No' : ''),
        escCsv(child?.emergency_contact_name),
        escCsv(child?.emergency_contact_phone),
        escCsv(child?.emergency_contact_relationship),
        escCsv(child?.authorized_pickup_persons),
        escCsv(child?.custody_restrictions),
        escCsv(child?.has_cooking_experience ? 'Yes' : child ? 'No' : ''),
        escCsv(child?.additional_notes),
        escCsv(child?.parent_name_signed),
        escCsv(child?.signed_at ? new Date(child.signed_at).toLocaleDateString() : ''),
      ].join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const partyDate = new Date(selectedRequest.preferred_date).toISOString().split('T')[0]
    a.href = url
    a.download = `party-guests-${selectedRequest.parent_name.replace(/\s+/g, '-').toLowerCase()}-${partyDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleStartEdit = () => {
    if (!selectedRequest) return
    setEditFormData({
      package: selectedRequest.package,
      preferred_date: selectedRequest.preferred_date ? new Date(selectedRequest.preferred_date).toISOString().split('T')[0] : '',
      number_of_children: selectedRequest.number_of_children,
      child_name_age: selectedRequest.child_name_age || '',
      parent_name: selectedRequest.parent_name,
      email: selectedRequest.email,
      phone: selectedRequest.phone,
      special_requests: selectedRequest.special_requests || '',
      admin_notes: selectedRequest.admin_notes || '',
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData(null)
  }

  const handleSaveEdit = async () => {
    if (!selectedRequest || !editFormData) return

    setSaving(true)
    setError('')

    try {
      const { error: dbError } = await supabase
        .from('party_requests')
        .update({
          package: editFormData.package,
          preferred_date: editFormData.preferred_date,
          number_of_children: editFormData.number_of_children,
          child_name_age: editFormData.child_name_age || null,
          parent_name: editFormData.parent_name,
          email: editFormData.email,
          phone: editFormData.phone,
          special_requests: editFormData.special_requests || null,
          admin_notes: editFormData.admin_notes || null,
        })
        .eq('id', selectedRequest.id)

      if (dbError) throw dbError

      // Update selectedRequest with new values
      setSelectedRequest({
        ...selectedRequest,
        ...editFormData,
        child_name_age: editFormData.child_name_age || null,
        special_requests: editFormData.special_requests || null,
        admin_notes: editFormData.admin_notes || null,
      })

      await fetchRequests()
      setIsEditing(false)
      setEditFormData(null)
      setSuccessMessage('Party request updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenActionDialog = (request: PartyRequest, action: 'approve' | 'decline') => {
    setSelectedRequest(request)
    setActionType(action)
    setAdminNotes(request.admin_notes || '')
    setIsActionDialogOpen(true)
  }

  const handleAction = async () => {
    if (!selectedRequest) return

    setActionLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      // Update status in database
      const { error: dbError } = await supabase
        .from('party_requests')
        .update({
          status: actionType === 'approve' ? 'approved' : 'declined',
          admin_notes: adminNotes
        })
        .eq('id', selectedRequest.id)

      if (dbError) throw dbError

      // Send email notification
      const response = await fetch('/api/party-request-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action: actionType,
          request: selectedRequest,
          adminNotes: adminNotes
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email notification')
      }

      // Refresh requests
      await fetchRequests()

      setIsActionDialogOpen(false)
      setSelectedRequest(null)
      setAdminNotes('')
      setSuccessMessage(`Request ${actionType === 'approve' ? 'approved' : 'declined'} and email sent successfully!`)
    } catch (err: any) {
      setError(err.message || `Failed to ${actionType} request`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenWithdrawDialog = (request: PartyRequest) => {
    setSelectedRequest(request)
    setWithdrawNotes(request.admin_notes || '')
    setIsWithdrawDialogOpen(true)
  }

  const handleWithdrawParty = async () => {
    if (!selectedRequest) return

    setWithdrawLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { error: dbError } = await supabase
        .from('party_requests')
        .update({
          status: 'withdrawn',
          admin_notes: withdrawNotes || null,
        })
        .eq('id', selectedRequest.id)

      if (dbError) throw dbError

      await fetchRequests()
      setIsWithdrawDialogOpen(false)
      setSelectedRequest(null)
      setWithdrawNotes('')
      setSuccessMessage('Party request marked as withdrawn by client.')
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw request')
    } finally {
      setWithdrawLoading(false)
    }
  }

  // Email helper functions
  const getUniquePartyRecipients = () => {
    const seen = new Set<string>()
    const recipients: Array<{ email: string; first_name: string; last_name: string }> = []
    for (const g of selectedGuests) {
      const email = g.parent_email?.toLowerCase().trim()
      if (email && !seen.has(email)) {
        seen.add(email)
        const parts = g.parent_name.split(' ')
        recipients.push({
          email: g.parent_email,
          first_name: parts[0] || '',
          last_name: parts.slice(1).join(' ') || '',
        })
      }
    }
    return recipients
  }

  const buildPartyContext = () => {
    if (!emailPartyRequest) return undefined
    const dateObj = new Date(emailPartyRequest.preferred_date)
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return {
      class_name: `${emailPartyRequest.child_name_age || 'Birthday'} Party`,
      class_date: formattedDate,
      class_time: '',
      class_description: getPackageDisplayName(emailPartyRequest.package),
      class_type: 'Birthday Party',
      class_price: '',
    }
  }

  const fetchTemplates = async () => {
    setLoadingTemplates(true)
    try {
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

  const handleOpenEmailDialog = (request: PartyRequest) => {
    setEmailPartyRequest(request)
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
    setQuickEmailSubject('')
    setQuickEmailMessage('')
  }

  const resetEmailDialog = () => {
    setShowEmailDialog(false)
    setSelectedTemplate(null)
    setEmailPartyRequest(null)
    resetCampaignState()
    resetEditorState()
  }

  const startCampaign = async (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsSending(true)
    setActivityLog([{ time: new Date().toLocaleTimeString(), message: 'Starting campaign...', type: 'info' }])

    const recipients = getUniquePartyRecipients()
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          recipients,
          classContext: buildPartyContext(),
        }),
        signal: abortControllerRef.current.signal,
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('Failed to start campaign')

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
                setActivityLog(prev => [...prev, {
                  time: new Date().toLocaleTimeString(),
                  message: `Processing batch ${data.currentBatch}/${data.totalBatches} (${data.sent + data.failed}/${data.total})`,
                  type: 'info'
                }])
              } else if (data.status === 'completed') {
                setActivityLog(prev => [...prev, {
                  time: new Date().toLocaleTimeString(),
                  message: `Campaign completed! ${data.sent} sent, ${data.failed} failed`,
                  type: data.failed > 0 ? 'error' : 'success'
                }])
              } else if (data.status === 'failed') {
                setActivityLog(prev => [...prev, {
                  time: new Date().toLocaleTimeString(),
                  message: `Campaign failed: ${data.errors[0]?.error || 'Unknown error'}`,
                  type: 'error'
                }])
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setActivityLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Error: ${error.message}`, type: 'error' }])
      }
    } finally {
      setIsSending(false)
    }
  }

  const sendQuickEmail = async () => {
    if (!emailPartyRequest || !quickEmailSubject.trim() || !quickEmailMessage.trim()) return

    setIsSending(true)
    setActivityLog([{ time: new Date().toLocaleTimeString(), message: 'Preparing to send email...', type: 'info' }])

    const recipients = getUniquePartyRecipients()
    setCampaignProgress({
      total: recipients.length,
      sent: 0,
      failed: 0,
      currentBatch: 1,
      totalBatches: 1,
      errors: [],
      status: 'running'
    })

    try {
      const response = await fetch('/api/parties/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyRequestId: emailPartyRequest.id,
          subject: quickEmailSubject,
          message: quickEmailMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to send emails')

      setCampaignProgress({
        total: data.stats.total || recipients.length,
        sent: data.stats.sent || 0,
        failed: data.stats.failed || 0,
        currentBatch: 1,
        totalBatches: 1,
        errors: data.details?.filter((d: any) => !d.success).map((d: any) => ({
          email: d.email || 'unknown',
          error: d.error || 'Unknown error'
        })) || [],
        status: 'completed'
      })

      setActivityLog(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: `Successfully sent ${data.stats.sent} email(s)!`,
        type: 'success'
      }])
    } catch (error: any) {
      setCampaignProgress({
        total: recipients.length,
        sent: 0,
        failed: recipients.length,
        currentBatch: 1,
        totalBatches: 1,
        errors: [{ email: 'all', error: error.message }],
        status: 'failed'
      })

      setActivityLog(prev => [...prev, { time: new Date().toLocaleTimeString(), message: `Error: ${error.message}`, type: 'error' }])
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
        body: JSON.stringify({ email: testEmail, classContext: buildPartyContext() }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to send test email')
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
    setEditorHtml(getDefaultPartyTemplate())
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

  const openQuickEmail = () => {
    setQuickEmailSubject('')
    setQuickEmailMessage('')
    setEditorMode('quickEmail')
  }

  const handleSaveTemplate = async () => {
    if (!editorName.trim()) { setEditorError('Template name is required'); return }
    if (!editorSubject.trim()) { setEditorError('Subject line is required'); return }
    if (!editorHtml.trim()) { setEditorError('HTML content is required'); return }

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
          name: editorName,
          subject: editorSubject,
          html_content: editorHtml,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save template')
      }

      await fetchTemplates()
      resetEditorState()
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setIsSavingTemplate(false)
    }
  }

  const confirmDeleteTemplate = async (template: EmailTemplate) => {
    setDeletingTemplateId(template.id)
    try {
      const response = await fetch(`/api/emails/templates/${template.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete template')
      await fetchTemplates()
    } catch (err) {
      console.error('Error deleting template:', err)
    } finally {
      setDeletingTemplateId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Declined</Badge>
      case 'withdrawn':
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-300">Withdrawn by Client</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPackageDisplayName = (pkg: string) => {
    const packageNames: { [key: string]: string } = {
      'art-canvas': 'Art: Canvas Painting',
      'diy-party': 'DIY Party',
      'mini-fiesta': 'Mini Fiesta',
      'deluxe-fiesta': 'Deluxe Fiesta',
      'premium-fiesta': 'Premium Fiesta',
      'dance-music': 'Dance & Music Party',
      'vip-package': 'VIP Package'
    }
    return packageNames[pkg] || pkg
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading party requests...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Party
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Parent Name</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Children</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No party requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.parent_name}</TableCell>
                  <TableCell>{getPackageDisplayName(request.package)}</TableCell>
                  <TableCell>{formatDate(request.preferred_date)}</TableCell>
                  <TableCell>
                    <span>{request.number_of_children}</span>
                    {request.status === 'approved' && guestCounts[request.id] && (
                      <span className="block text-xs text-muted-foreground">
                        {guestCounts[request.id].completed}/{guestCounts[request.id].total} forms done
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(request.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {request.status === 'approved' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyDashboardLink(request)}
                          >
                            {copiedDashboardLink === request.id ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Dashboard
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700"
                            onClick={() => handleOpenWithdrawDialog(request)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Withdraw
                          </Button>
                        </>
                      )}
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleOpenActionDialog(request, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleOpenActionDialog(request, 'decline')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={(open) => {
        setIsDetailsDialogOpen(open)
        if (!open) {
          setIsEditing(false)
          setEditFormData(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader className="pr-10">
            <DialogTitle>Party Request Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedRequest && formatDateTime(selectedRequest.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="flex justify-end -mt-2">
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel Edit
                </Button>
              )}
            </div>
          )}
          {selectedRequest && !isEditing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Status</h4>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Package</h4>
                  <p>{getPackageDisplayName(selectedRequest.package)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Party Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Preferred Date</h4>
                    <p>{formatDate(selectedRequest.preferred_date)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Number of Children</h4>
                    <p>{selectedRequest.number_of_children}</p>
                  </div>
                  {selectedRequest.child_name_age && (
                    <div className="col-span-2">
                      <h4 className="font-semibold text-sm mb-1">Birthday Child</h4>
                      <p>{selectedRequest.child_name_age}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Parent/Guardian</h4>
                    <p>{selectedRequest.parent_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedRequest.email}`} className="text-blue-600 hover:underline">
                      {selectedRequest.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedRequest.phone}`} className="text-blue-600 hover:underline">
                      {selectedRequest.phone}
                    </a>
                  </div>
                </div>
              </div>

              {selectedRequest.special_requests && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Special Requests</h3>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                    {selectedRequest.special_requests}
                  </p>
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Admin Notes</h3>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                    {selectedRequest.admin_notes}
                  </p>
                </div>
              )}

              {selectedRequest.status === 'approved' && (
                <div className="border-t pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Guest Enrollment Status
                    </h3>
                    <div className="flex items-center gap-2">
                      {selectedGuests.length > 0 && (
                        <>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleOpenEmailDialog(selectedRequest)}
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Email All
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadGuestList}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download List
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyDashboardLink(selectedRequest)}
                      >
                        {copiedDashboardLink === selectedRequest.id ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Dashboard Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {guestsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading guests...
                    </div>
                  ) : selectedGuests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No guests added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedGuests.map((guest) => {
                        const child = getChildForGuest(guest)
                        const isExpanded = expandedGuests.has(guest.id)
                        const hasAllergies = child && (child.allergies || child.dietary_restrictions || child.medical_conditions || child.emergency_medications)

                        return (
                          <div key={guest.id} className="bg-muted rounded overflow-hidden">
                            {/* Guest summary row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 text-sm gap-1 sm:gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="font-medium">{guest.child_name}</span>
                                  <span className="text-muted-foreground text-xs">({guest.parent_name})</span>
                                </div>
                                <span className="block text-muted-foreground text-xs truncate">{guest.parent_email}</span>
                                {/* Inline badges for completed guests */}
                                {child && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {child.media_permission ? (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-green-50 text-green-700 border-green-300">
                                        <Camera className="h-2.5 w-2.5 mr-0.5" />
                                        Photo OK
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-slate-50 text-slate-500 border-slate-300">
                                        <CameraOff className="h-2.5 w-2.5 mr-0.5" />
                                        No Photo
                                      </Badge>
                                    )}
                                    {hasAllergies && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-amber-50 text-amber-700 border-amber-300">
                                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                                        {child.allergies ? 'Allergies' : child.dietary_restrictions ? 'Dietary' : child.medical_conditions ? 'Medical' : 'Meds'}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0">
                                <Badge
                                  variant="outline"
                                  className={
                                    guest.form_completed_at
                                      ? 'bg-green-50 text-green-700 border-green-300'
                                      : guest.email_sent_at
                                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                                      : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                  }
                                >
                                  {guest.form_completed_at ? 'Completed' : guest.email_sent_at ? 'Email Sent' : 'Pending'}
                                </Badge>
                                {guest.form_completed_at && child && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => toggleGuestExpanded(guest.id)}
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-3.5 w-3.5 mr-0.5" />
                                    ) : (
                                      <ChevronDown className="h-3.5 w-3.5 mr-0.5" />
                                    )}
                                    {isExpanded ? 'Less' : 'More'}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Expanded child details */}
                            {isExpanded && child && (
                              <div className="border-t px-3 py-3 space-y-3 text-sm bg-white">
                                {/* Child Info */}
                                <div>
                                  <h5 className="font-semibold text-xs uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                                    <Baby className="h-3 w-3" /> Child Info
                                  </h5>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                                    <div><span className="text-muted-foreground">Name:</span> {child.child_full_name}</div>
                                    <div><span className="text-muted-foreground">Age:</span> {child.child_age}</div>
                                    {child.child_preferred_name && (
                                      <div><span className="text-muted-foreground">Goes by:</span> {child.child_preferred_name}</div>
                                    )}
                                    <div><span className="text-muted-foreground">Cooking exp:</span> {child.has_cooking_experience ? 'Yes' : 'No'}</div>
                                    {child.has_cooking_experience && child.cooking_experience_details && (
                                      <div className="col-span-2"><span className="text-muted-foreground">Details:</span> {child.cooking_experience_details}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Health & Safety */}
                                {hasAllergies && (
                                  <div>
                                    <h5 className="font-semibold text-xs uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" /> Health & Safety
                                    </h5>
                                    <div className="space-y-1 text-sm">
                                      {child.allergies && (
                                        <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                          <span className="font-medium text-amber-800">Allergies:</span>{' '}
                                          <span className="text-amber-700">{child.allergies}</span>
                                        </div>
                                      )}
                                      {child.dietary_restrictions && (
                                        <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1">
                                          <span className="font-medium text-amber-800">Dietary:</span>{' '}
                                          <span className="text-amber-700">{child.dietary_restrictions}</span>
                                        </div>
                                      )}
                                      {child.medical_conditions && (
                                        <div className="bg-red-50 border border-red-200 rounded px-2 py-1">
                                          <span className="font-medium text-red-800">Medical:</span>{' '}
                                          <span className="text-red-700">{child.medical_conditions}</span>
                                        </div>
                                      )}
                                      {child.emergency_medications && (
                                        <div className="bg-red-50 border border-red-200 rounded px-2 py-1">
                                          <span className="font-medium text-red-800">Medications:</span>{' '}
                                          <span className="text-red-700">{child.emergency_medications}</span>
                                        </div>
                                      )}
                                      {child.additional_notes && (
                                        <div><span className="text-muted-foreground">Notes:</span> {child.additional_notes}</div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Parent & Emergency Contact */}
                                <div>
                                  <h5 className="font-semibold text-xs uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                                    <User className="h-3 w-3" /> Parent & Emergency
                                  </h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                    <div><span className="text-muted-foreground">Parent:</span> {child.guest_parent_name}</div>
                                    <div><span className="text-muted-foreground">Phone:</span> {child.guest_parent_phone}</div>
                                    <div><span className="text-muted-foreground">Emergency:</span> {child.emergency_contact_name} ({child.emergency_contact_relationship})</div>
                                    <div><span className="text-muted-foreground">Emerg. phone:</span> {child.emergency_contact_phone}</div>
                                    {child.authorized_pickup_persons && (
                                      <div className="col-span-1 sm:col-span-2"><span className="text-muted-foreground">Pickup:</span> {child.authorized_pickup_persons}</div>
                                    )}
                                    {child.custody_restrictions && (
                                      <div className="col-span-1 sm:col-span-2"><span className="text-muted-foreground">Custody:</span> {child.custody_restrictions}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Consent */}
                                <div>
                                  <h5 className="font-semibold text-xs uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> Consent
                                  </h5>
                                  <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                      <CheckCircle className="h-3 w-3 mr-1" /> Liability Signed
                                    </Badge>
                                    {child.media_permission ? (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                        <Camera className="h-3 w-3 mr-1" /> Photo/Video OK
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-300">
                                        <CameraOff className="h-3 w-3 mr-1" /> No Photo/Video
                                      </Badge>
                                    )}
                                    {child.social_media_consent && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                        Social Media OK
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1.5">
                                    Signed by {child.parent_name_signed} for {child.child_name_signed} on{' '}
                                    {new Date(child.signed_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedGuests.filter(g => g.form_completed_at).length} of {selectedGuests.length} forms completed
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Edit Mode Form */}
          {selectedRequest && isEditing && editFormData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Status</h4>
                  {getStatusBadge(selectedRequest.status)}
                  <p className="text-xs text-muted-foreground mt-1">Use approve/decline to change status</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-package">Package</Label>
                  <Select
                    value={editFormData.package}
                    onValueChange={(value) => setEditFormData({ ...editFormData, package: value })}
                  >
                    <SelectTrigger id="edit-package">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="art-canvas">Art: Canvas Painting</SelectItem>
                      <SelectItem value="mini-fiesta">Mini Fiesta</SelectItem>
                      <SelectItem value="deluxe-fiesta">Deluxe Fiesta</SelectItem>
                      <SelectItem value="premium-fiesta">Premium Fiesta</SelectItem>
                      <SelectItem value="dance-music">Dance & Music Party</SelectItem>
                      <SelectItem value="diy-party">DIY Party</SelectItem>
                      <SelectItem value="vip-package">VIP Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Party Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-date">Preferred Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editFormData.preferred_date}
                      onChange={(e) => setEditFormData({ ...editFormData, preferred_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-children">Number of Children</Label>
                    <Input
                      id="edit-children"
                      type="number"
                      min={1}
                      value={editFormData.number_of_children}
                      onChange={(e) => setEditFormData({ ...editFormData, number_of_children: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="edit-birthday-child">Birthday Child</Label>
                    <Input
                      id="edit-birthday-child"
                      type="text"
                      value={editFormData.child_name_age}
                      onChange={(e) => setEditFormData({ ...editFormData, child_name_age: e.target.value })}
                      placeholder="e.g. Emma, age 7"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-parent">Parent/Guardian Name</Label>
                    <Input
                      id="edit-parent"
                      type="text"
                      value={editFormData.parent_name}
                      onChange={(e) => setEditFormData({ ...editFormData, parent_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-special">Special Requests</Label>
                  <Textarea
                    id="edit-special"
                    value={editFormData.special_requests}
                    onChange={(e) => setEditFormData({ ...editFormData, special_requests: e.target.value })}
                    placeholder="Any special requests..."
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-admin-notes">Admin Notes</Label>
                  <Textarea
                    id="edit-admin-notes"
                    value={editFormData.admin_notes}
                    onChange={(e) => setEditFormData({ ...editFormData, admin_notes: e.target.value })}
                    placeholder="Internal admin notes..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Show guest enrollment read-only even in edit mode */}
              {selectedRequest.status === 'approved' && (
                <div className="border-t pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Guest Enrollment Status
                    </h3>
                  </div>
                  {guestsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading guests...
                    </div>
                  ) : selectedGuests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No guests added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedGuests.map((guest) => (
                        <div key={guest.id} className="bg-muted rounded p-2 text-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{guest.child_name}</span>
                              <span className="text-muted-foreground text-xs ml-1">({guest.parent_name})</span>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                guest.form_completed_at
                                  ? 'bg-green-50 text-green-700 border-green-300'
                                  : guest.email_sent_at
                                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                                  : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                              }
                            >
                              {guest.form_completed_at ? 'Completed' : guest.email_sent_at ? 'Email Sent' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedGuests.filter(g => g.form_completed_at).length} of {selectedGuests.length} forms completed
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {isEditing ? (
              <div className="flex gap-2 w-full justify-end">
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 w-full justify-between">
                <div>
                  {selectedRequest?.status === 'approved' && (
                    <Button
                      variant="outline"
                      className="text-orange-600 hover:text-orange-700"
                      onClick={() => {
                        setIsDetailsDialogOpen(false)
                        handleOpenWithdrawDialog(selectedRequest)
                      }}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Withdraw
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Party Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open)
        if (!open) resetCreateForm()
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle>Create Party</DialogTitle>
            <DialogDescription>
              Create a new party for a client. The party will be created as approved and the client will receive an email with their dashboard link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-package">Package *</Label>
                <Select
                  value={createFormData.package}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, package: value })}
                >
                  <SelectTrigger id="create-package">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="art-canvas">Art: Canvas Painting</SelectItem>
                    <SelectItem value="diy-party">DIY Party</SelectItem>
                    <SelectItem value="mini-fiesta">Mini Fiesta</SelectItem>
                    <SelectItem value="deluxe-fiesta">Deluxe Fiesta</SelectItem>
                    <SelectItem value="premium-fiesta">Premium Fiesta</SelectItem>
                    <SelectItem value="vip-package">VIP Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-date">Preferred Date *</Label>
                <Input
                  id="create-date"
                  type="date"
                  value={createFormData.preferred_date}
                  onChange={(e) => setCreateFormData({ ...createFormData, preferred_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-children">Number of Children</Label>
                <Input
                  id="create-children"
                  type="number"
                  min={1}
                  value={createFormData.number_of_children}
                  onChange={(e) => setCreateFormData({ ...createFormData, number_of_children: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-birthday-child">Birthday Child</Label>
                <Input
                  id="create-birthday-child"
                  type="text"
                  value={createFormData.child_name_age}
                  onChange={(e) => setCreateFormData({ ...createFormData, child_name_age: e.target.value })}
                  placeholder="e.g. Emma, age 7"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-parent">Parent/Guardian Name *</Label>
                  <Input
                    id="create-parent"
                    type="text"
                    value={createFormData.parent_name}
                    onChange={(e) => setCreateFormData({ ...createFormData, parent_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="create-email">Email *</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="create-phone">Phone *</Label>
                    <Input
                      id="create-phone"
                      type="text"
                      value={createFormData.phone}
                      onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-special">Special Requests</Label>
                <Textarea
                  id="create-special"
                  value={createFormData.special_requests}
                  onChange={(e) => setCreateFormData({ ...createFormData, special_requests: e.target.value })}
                  placeholder="Any special requests or dietary restrictions..."
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-admin-notes">Admin Notes</Label>
                <Textarea
                  id="create-admin-notes"
                  value={createFormData.admin_notes}
                  onChange={(e) => setCreateFormData({ ...createFormData, admin_notes: e.target.value })}
                  placeholder="Internal admin notes..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={createLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateParty} disabled={createLoading}>
              {createLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Create & Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Decline'} Party Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && `${actionType === 'approve' ? 'Approve' : 'Decline'} request from ${selectedRequest.parent_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Admin Notes (optional)
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any internal notes or reasons..."
                rows={4}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              An email will be sent to the customer notifying them of your decision.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActionDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={actionLoading}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionLoading ? 'Processing...' : actionType === 'approve' ? 'Approve & Send Email' : 'Decline & Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Party Request</DialogTitle>
            <DialogDescription>
              {selectedRequest && `Mark the request from ${selectedRequest.parent_name} as withdrawn by client. No email will be sent.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason / Notes (optional)
              </label>
              <Textarea
                value={withdrawNotes}
                onChange={(e) => setWithdrawNotes(e.target.value)}
                placeholder="e.g. Client did not follow through with booking, no payment received..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsWithdrawDialogOpen(false)}
              disabled={withdrawLoading}
            >
              Go Back
            </Button>
            <Button
              onClick={handleWithdrawParty}
              disabled={withdrawLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {withdrawLoading ? 'Processing...' : 'Mark as Withdrawn'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email All Guests Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={(open) => { if (!open) resetEmailDialog(); setShowEmailDialog(open) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email All Party Guests
            </DialogTitle>
            <DialogDescription>
              {campaignProgress
                ? `Sending emails to party guests`
                : emailPartyRequest
                ? `Send to ${getUniquePartyRecipients().length} guest parent${getUniquePartyRecipients().length !== 1 ? 's' : ''} (${selectedGuests.length} guest${selectedGuests.length !== 1 ? 's' : ''}) for ${emailPartyRequest.child_name_age || 'Birthday'}'s party`
                : ''
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
                    <Button variant="ghost" size="sm" onClick={resetEditorState} className="flex items-center gap-1">
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
                      <Input value={editorName} onChange={(e) => setEditorName(e.target.value)} placeholder="e.g., Recipe Follow-Up" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject Line</label>
                      <Input value={editorSubject} onChange={(e) => setEditorSubject(e.target.value)} placeholder="e.g., Recipes from the Party!" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">HTML Content</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowEditorPreview(false)}
                          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${!showEditorPreview ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
                        >
                          <Code className="h-4 w-4" />
                          Code
                        </button>
                        <button
                          onClick={() => setShowEditorPreview(true)}
                          className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${showEditorPreview ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary'}`}
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Available variables: {'{{first_name}}'}, {'{{last_name}}'}, {'{{email}}'}, {'{{full_name}}'}, {'{{class_name}}'}, {'{{class_date}}'}, {'{{class_description}}'}
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
                    <Button onClick={handleSaveTemplate} disabled={isSavingTemplate} className="bg-blue-600 hover:bg-blue-700">
                      {isSavingTemplate ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                      ) : (
                        <><Save className="h-4 w-4 mr-2" />{editingTemplate ? 'Update Template' : 'Save Template'}</>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              ) : editorMode === 'quickEmail' ? (
                /* Quick Email Mode */
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={resetEditorState} className="flex items-center gap-1">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <h3 className="font-medium">Quick Email</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject *</label>
                      <Input value={quickEmailSubject} onChange={(e) => setQuickEmailSubject(e.target.value)} placeholder="Enter email subject..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Message *</label>
                      <textarea
                        value={quickEmailMessage}
                        onChange={(e) => setQuickEmailMessage(e.target.value)}
                        placeholder="Write your message here..."
                        rows={10}
                        className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Each email will be personalized with the guest child's name and party details using Cocinarte branding.
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={resetEditorState}>Cancel</Button>
                    <Button
                      onClick={() => sendQuickEmail()}
                      disabled={!quickEmailSubject.trim() || !quickEmailMessage.trim() || isSending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
                      ) : (
                        <><Send className="h-4 w-4 mr-2" />Send to {getUniquePartyRecipients().length} Parent{getUniquePartyRecipients().length !== 1 ? 's' : ''}</>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                /* Template List */
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={openNewTemplate}
                      className="flex items-center justify-center gap-2 border-dashed border-2 bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                      New Template
                    </Button>
                    <Button
                      size="sm"
                      onClick={openQuickEmail}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-4 w-4" />
                      Quick Email
                    </Button>
                  </div>

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
                        <div key={template.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{template.name}</h3>
                            <p className="text-sm text-slate-500 truncate">Subject: {template.subject}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 p-2" onClick={() => startCampaign(template)} disabled={isSending} title="Send to all guests">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openEditTemplate(template)} className="p-2" title="Edit template">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedTemplate(template); setShowPreviewModal(true) }} className="p-2" title="Preview template">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedTemplate(template); setShowTestModal(true) }} className="p-2" title="Send test email">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => confirmDeleteTemplate(template)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              disabled={deletingTemplateId === template.id}
                              title="Delete template"
                            >
                              {deletingTemplateId === template.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
            <DialogDescription>Subject: {selectedTemplate?.subject}</DialogDescription>
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
            <DialogDescription>Send a test email to preview &quot;{selectedTemplate?.name}&quot;</DialogDescription>
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
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{testError}</p>
              </div>
            )}
            {testSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">Test email sent successfully!</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetTestState(); setShowTestModal(false) }}>Cancel</Button>
            <Button onClick={sendTestEmail} disabled={!testEmail || isSendingTest} className="bg-blue-600 hover:bg-blue-700">
              {isSendingTest ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Send Test</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
