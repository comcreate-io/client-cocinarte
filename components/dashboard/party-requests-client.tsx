"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
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
import { CheckCircle, XCircle, Eye, Calendar, Users, Mail, Phone } from 'lucide-react'
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
  created_at: string
  updated_at: string
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

  const handleViewDetails = (request: PartyRequest) => {
    setSelectedRequest(request)
    setIsDetailsDialogOpen(true)
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
      <div className="border rounded-lg">
        <Table>
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
                  <TableCell>{request.number_of_children}</TableCell>
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
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Party Request Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedRequest && formatDateTime(selectedRequest.created_at)}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
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
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
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
    </div>
  )
}
