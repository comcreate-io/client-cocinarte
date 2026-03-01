"use client"

import { useState, useEffect } from 'react'
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
  ChevronDown, ChevronUp, Camera, CameraOff, AlertTriangle, Baby, Shield, User, Download, Pencil
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
  status: 'pending' | 'approved' | 'declined'
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
        const { data } = await supabase
          .from('party_guests')
          .select('id, child_name, parent_name, parent_email, form_completed_at, email_sent_at, guest_child_id')
          .eq('party_request_id', request.id)
          .order('created_at', { ascending: true })

        const guests = data || []
        setSelectedGuests(guests)

        // Pre-fetch child details for all completed guests
        const childIds = guests
          .filter(g => g.guest_child_id)
          .map(g => g.guest_child_id as string)

        if (childIds.length > 0) {
          const { data: children } = await supabase
            .from('guest_children')
            .select('id, child_full_name, child_age, child_preferred_name, has_cooking_experience, cooking_experience_details, allergies, dietary_restrictions, medical_conditions, emergency_medications, additional_notes, authorized_pickup_persons, custody_restrictions, media_permission, guest_parent_name, guest_parent_phone, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, liability_consent, social_media_consent, parent_name_signed, child_name_signed, signed_at')
            .in('id', childIds)

          if (children) {
            const details: Record<string, GuestChildDetails> = {}
            for (const child of children) {
              details[child.id] = child
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
      preferred_date: selectedRequest.preferred_date,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Approved</Badge>
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Declined</Badge>
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
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
          </div>
        </div>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadGuestList}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download List
                        </Button>
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
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            )}
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
    </div>
  )
}
