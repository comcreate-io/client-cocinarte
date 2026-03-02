'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  ChefHat, Calendar, Users, CheckCircle, AlertCircle,
  Loader2, Mail, Copy, Send, UserPlus, PartyPopper, RefreshCw
} from 'lucide-react'
import CocinarteHeader from '@/components/cocinarte/cocinarte-header'
import CocinarteFooter from '@/components/cocinarte/cocinarte-footer'
import type { PartyGuest } from '@/types/party-guest'

export default function PartyDashboardPage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [partyRequest, setPartyRequest] = useState<any>(null)
  const [guests, setGuests] = useState<PartyGuest[]>([])

  // Add guest form
  const [childName, setChildName] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [addingGuest, setAddingGuest] = useState(false)
  const [addGuestError, setAddGuestError] = useState('')
  const [addGuestSuccess, setAddGuestSuccess] = useState('')

  // Invite sending state
  const [sendingInvite, setSendingInvite] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`/api/party-dashboard?token=${token}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to load dashboard')
        return
      }

      setPartyRequest(data.party_request)
      setGuests(data.guests)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError('Failed to load the party dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAddGuest = async () => {
    if (!childName || !parentName || !parentEmail) {
      setAddGuestError('Please fill in all fields')
      return
    }

    setAddingGuest(true)
    setAddGuestError('')
    setAddGuestSuccess('')

    try {
      // Add the guest
      const addRes = await fetch('/api/party-dashboard/add-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_token: token,
          child_name: childName,
          parent_name: parentName,
          parent_email: parentEmail,
        }),
      })

      const addData = await addRes.json()

      if (!addData.success) {
        setAddGuestError(addData.error || 'Failed to add guest')
        return
      }

      // Auto-send invite email
      try {
        await fetch('/api/party-dashboard/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            party_guest_id: addData.guest.id,
            dashboard_token: token,
          }),
        })
      } catch {
        // Email send failure is non-blocking
      }

      // Add the new guest to local state immediately
      setGuests(prev => [...prev, addData.guest])

      // Reset form
      setChildName('')
      setParentName('')
      setParentEmail('')
      setAddGuestSuccess(`${childName} has been added and an invitation email was sent to ${parentEmail}!`)

      // Background refresh to sync latest data (e.g. email_sent_at)
      try {
        const refreshRes = await fetch(`/api/party-dashboard?token=${token}&_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
        })
        const refreshData = await refreshRes.json()
        if (refreshData.success) {
          setGuests(refreshData.guests)
        }
      } catch {
        // Non-blocking refresh
      }
    } catch (err) {
      console.error('Error adding guest:', err)
      setAddGuestError('Failed to add guest. Please try again.')
    } finally {
      setAddingGuest(false)
    }
  }

  const handleResendInvite = async (guest: PartyGuest) => {
    setSendingInvite(guest.id)
    try {
      const res = await fetch('/api/party-dashboard/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          party_guest_id: guest.id,
          dashboard_token: token,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Failed to send invite')
        return
      }

      await fetchDashboardData()
    } catch (err) {
      setError('Failed to send invitation email')
    } finally {
      setSendingInvite(null)
    }
  }

  const handleCopyLink = (guest: PartyGuest) => {
    const formUrl = `${window.location.origin}/party-form/${guest.form_token}`
    navigator.clipboard.writeText(formUrl)
    setCopiedLink(guest.id)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getPackageDisplayName = (pkg: string) => {
    const packageNames: { [key: string]: string } = {
      'art-canvas': 'Art: Canvas Painting',
      'diy-party': 'DIY Party',
      'mini-fiesta': 'Mini Fiesta',
      'deluxe-fiesta': 'Deluxe Fiesta',
      'premium-fiesta': 'Premium Fiesta',
      'vip-package': 'VIP Package',
    }
    return packageNames[pkg] || pkg
  }

  const getGuestStatusBadge = (guest: PartyGuest) => {
    if (guest.form_completed_at) {
      return <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>
    }
    if (guest.email_sent_at) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Email Sent</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Pending</Badge>
  }

  const completedCount = guests.filter(g => g.form_completed_at).length

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <CocinarteHeader />
        <div className="flex items-center justify-center min-h-[60vh] pt-28 sm:pt-32 px-4">
          <div className="text-center">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#1E3A8A] mx-auto mb-4" />
            <p className="text-slate-600 text-base sm:text-lg">Loading party dashboard...</p>
          </div>
        </div>
        <CocinarteFooter />
      </div>
    )
  }

  // Error state
  if (error && !partyRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <CocinarteHeader />
        <div className="flex items-center justify-center min-h-[60vh] pt-28 sm:pt-32 px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">Dashboard Not Found</h3>
              <p className="text-sm sm:text-base text-slate-600">{error}</p>
            </CardContent>
          </Card>
        </div>
        <CocinarteFooter />
      </div>
    )
  }

  const guestLimitReached = guests.length >= (partyRequest?.number_of_children || 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <CocinarteHeader />

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pt-28 sm:pt-32">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <PartyPopper className="h-6 w-6 sm:h-8 sm:w-8 text-[#F0614F] flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Party Guest Dashboard</h1>
            <PartyPopper className="h-6 w-6 sm:h-8 sm:w-8 text-[#F0614F] flex-shrink-0 hidden sm:block" />
          </div>
          <p className="text-sm sm:text-base text-slate-600">
            Manage your guest list and track enrollment forms
          </p>
        </div>

        {/* Party Details Card */}
        {partyRequest && (
          <Card className="mb-4 sm:mb-6 border-[#1E3A8A]/20">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-[#1E3A8A]/10 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-[#1E3A8A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Birthday Party</h3>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(partyRequest.preferred_date)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      {partyRequest.number_of_children} children
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 mt-1 text-sm text-slate-600">
                    <span><strong>Package:</strong> {getPackageDisplayName(partyRequest.package)}</span>
                    {partyRequest.child_name_age && (
                      <span><strong>Birthday Child:</strong> {partyRequest.child_name_age}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enrollment Progress */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  completedCount === partyRequest?.number_of_children && guests.length > 0
                    ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  <CheckCircle className={`h-5 w-5 sm:h-6 sm:w-6 ${
                    completedCount === partyRequest?.number_of_children && guests.length > 0
                      ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-semibold text-slate-800">
                    {completedCount} of {partyRequest?.number_of_children} forms completed
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {guests.length} guest{guests.length !== 1 ? 's' : ''} added
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={fetchDashboardData} className="self-end sm:self-auto">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && partyRequest && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Add Guest Form */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <UserPlus className="h-5 w-5 text-[#1E3A8A] flex-shrink-0" />
              Add a Guest
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {guestLimitReached
                ? `Guest limit reached (${partyRequest?.number_of_children} children maximum)`
                : 'Add a guest child and their parent will receive an enrollment form by email'
              }
            </CardDescription>
          </CardHeader>
          {!guestLimitReached && (
            <CardContent className="px-4 sm:px-6">
              {addGuestError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">{addGuestError}</AlertDescription>
                </Alert>
              )}
              {addGuestSuccess && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-sm">{addGuestSuccess}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div className="space-y-1.5">
                  <Label htmlFor="childName" className="text-sm">Child's Name *</Label>
                  <Input
                    id="childName"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Guest child's name"
                    disabled={addingGuest}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="parentName" className="text-sm">Parent's Name *</Label>
                  <Input
                    id="parentName"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Parent's full name"
                    disabled={addingGuest}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                  <Label htmlFor="parentEmail" className="text-sm">Parent's Email *</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@email.com"
                    disabled={addingGuest}
                  />
                </div>
              </div>
              <Button
                onClick={handleAddGuest}
                disabled={addingGuest || !childName || !parentName || !parentEmail}
                className="w-full sm:w-auto bg-[#F0614F] hover:bg-[#F0614F]/90 text-white"
              >
                {addingGuest ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Guest...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Guest & Send Invite
                  </>
                )}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Guest List */}
        <Card className="mb-8">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-5 w-5 text-[#1E3A8A] flex-shrink-0" />
              Guest List
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {guests.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-slate-500">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm sm:text-base">No guests added yet. Use the form above to add your first guest.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="p-3 sm:p-4 bg-slate-50 rounded-lg border"
                  >
                    {/* Top row: name + badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-slate-800 text-sm sm:text-base">{guest.child_name}</p>
                      {getGuestStatusBadge(guest)}
                    </div>

                    {/* Contact info */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-4 text-xs sm:text-sm text-slate-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 flex-shrink-0" />
                        {guest.parent_name}
                      </span>
                      <span className="flex items-center gap-1 min-w-0">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{guest.parent_email}</span>
                      </span>
                    </div>

                    {guest.form_completed_at && (
                      <p className="text-xs text-green-600 mb-2">
                        Completed {new Date(guest.form_completed_at).toLocaleDateString()}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(guest)}
                        disabled={!!guest.form_completed_at}
                        className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
                      >
                        {copiedLink === guest.id ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      {!guest.form_completed_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendInvite(guest)}
                          disabled={sendingInvite === guest.id}
                          className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
                        >
                          {sendingInvite === guest.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3 mr-1" />
                          )}
                          {guest.email_sent_at ? 'Resend' : 'Send'} Email
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CocinarteFooter />
    </div>
  )
}
