'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ChefHat, Calendar, Users, CheckCircle, AlertCircle,
  Loader2, Baby, User, FileCheck, RotateCcw, PartyPopper
} from 'lucide-react'
import CocinarteHeader from '@/components/cocinarte/cocinarte-header'
import CocinarteFooter from '@/components/cocinarte/cocinarte-footer'
import { SignaturePad } from '@/components/consent/signature-pad'
import { SOCIAL_MEDIA_CONSENT_TEXT, LIABILITY_CONSENT_TEXT } from '@/types/consent'
import type { GuestFormSubmission, GuestChild } from '@/types/guest-booking'

export default function PartyFormPage() {
  const params = useParams()
  const token = params.token as string

  // Page states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)

  // Data from API
  const [partyGuest, setPartyGuest] = useState<any>(null)
  const [partyDetails, setPartyDetails] = useState<any>(null)
  const [previousChildren, setPreviousChildren] = useState<GuestChild[]>([])
  const [showReuse, setShowReuse] = useState(false)

  // Form fields - Child info
  const [childFullName, setChildFullName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [childPreferredName, setChildPreferredName] = useState('')
  const [hasCookingExperience, setHasCookingExperience] = useState(false)
  const [cookingExperienceDetails, setCookingExperienceDetails] = useState('')

  // Form fields - Health & Safety
  const [allergies, setAllergies] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState('')
  const [medicalConditions, setMedicalConditions] = useState('')
  const [emergencyMedications, setEmergencyMedications] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Form fields - Pick-up & Emergency
  const [authorizedPickupPersons, setAuthorizedPickupPersons] = useState('')
  const [custodyRestrictions, setCustodyRestrictions] = useState('')
  const [guestParentName, setGuestParentName] = useState('')
  const [guestParentPhone, setGuestParentPhone] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('')

  // Form fields - Consent
  const [liabilityConsent, setLiabilityConsent] = useState(false)
  const [socialMediaConsent, setSocialMediaConsent] = useState(false)
  const [mediaPermission, setMediaPermission] = useState(false)
  const [parentNameSigned, setParentNameSigned] = useState('')
  const [childNameSigned, setChildNameSigned] = useState('')
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchFormData()
  }, [token])

  const fetchFormData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/party-form/form-data?token=${token}`)
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to load form')
        return
      }

      if (data.already_completed) {
        setAlreadyCompleted(true)
        setPartyGuest(data.party_guest)
        return
      }

      setPartyGuest(data.party_guest)
      setPartyDetails(data.party_details)
      setPreviousChildren(data.previous_children || [])

      // Pre-fill guest parent name and child name
      setGuestParentName(data.party_guest.parent_name || '')
      setChildFullName(data.party_guest.child_name || '')

      // Show reuse option if previous children exist
      if (data.previous_children && data.previous_children.length > 0) {
        setShowReuse(true)
      }
    } catch (err) {
      console.error('Error fetching form data:', err)
      setError('Failed to load the enrollment form')
    } finally {
      setLoading(false)
    }
  }

  const handleReuseChild = (child: GuestChild) => {
    setChildFullName(child.child_full_name)
    setChildAge(String(child.child_age))
    setChildPreferredName(child.child_preferred_name || '')
    setHasCookingExperience(child.has_cooking_experience)
    setCookingExperienceDetails(child.cooking_experience_details || '')
    setAllergies(child.allergies || '')
    setDietaryRestrictions(child.dietary_restrictions || '')
    setMedicalConditions(child.medical_conditions || '')
    setEmergencyMedications(child.emergency_medications || '')
    setAdditionalNotes(child.additional_notes || '')
    setAuthorizedPickupPersons(child.authorized_pickup_persons || '')
    setCustodyRestrictions(child.custody_restrictions || '')
    setGuestParentName(child.guest_parent_name)
    setGuestParentPhone(child.guest_parent_phone)
    setEmergencyContactName(child.emergency_contact_name)
    setEmergencyContactPhone(child.emergency_contact_phone)
    setEmergencyContactRelationship(child.emergency_contact_relationship)
    setSocialMediaConsent(child.social_media_consent)
    setMediaPermission(child.media_permission)
    setShowReuse(false)
  }

  const handleSubmit = async () => {
    if (!childFullName || !childAge || !guestParentName || !guestParentPhone) {
      setError('Please fill in all required fields')
      return
    }
    if (!liabilityConsent) {
      setError('You must accept the liability waiver to proceed')
      return
    }
    if (!parentNameSigned || !childNameSigned) {
      setError('Please enter both parent and child names for consent')
      return
    }
    if (!signatureDataUrl) {
      setError('Please provide your signature')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const formData: GuestFormSubmission = {
        child_full_name: childFullName,
        child_age: parseInt(childAge),
        child_preferred_name: childPreferredName || undefined,
        has_cooking_experience: hasCookingExperience,
        cooking_experience_details: cookingExperienceDetails || undefined,
        allergies: allergies || undefined,
        dietary_restrictions: dietaryRestrictions || undefined,
        medical_conditions: medicalConditions || undefined,
        emergency_medications: emergencyMedications || undefined,
        additional_notes: additionalNotes || undefined,
        authorized_pickup_persons: authorizedPickupPersons || undefined,
        custody_restrictions: custodyRestrictions || undefined,
        guest_parent_name: guestParentName,
        guest_parent_phone: guestParentPhone,
        emergency_contact_name: emergencyContactName || guestParentName,
        emergency_contact_phone: emergencyContactPhone || guestParentPhone,
        emergency_contact_relationship: emergencyContactRelationship || 'Parent',
        liability_consent: liabilityConsent,
        social_media_consent: socialMediaConsent,
        parent_name_signed: parentNameSigned,
        child_name_signed: childNameSigned,
        signature_data_url: signatureDataUrl,
        media_permission: mediaPermission,
      }

      const res = await fetch('/api/party-form/complete-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_token: token, form_data: formData }),
      })

      const result = await res.json()

      if (!result.success) {
        setError(result.error || 'Failed to submit form')
        return
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Failed to submit the form. Please try again.')
    } finally {
      setSubmitting(false)
    }
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <CocinarteHeader />
        <div className="flex items-center justify-center min-h-[60vh] pt-28 sm:pt-32 px-4">
          <div className="text-center">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-[#1E3A8A] mx-auto mb-4" />
            <p className="text-slate-600 text-base sm:text-lg">Loading enrollment form...</p>
          </div>
        </div>
        <CocinarteFooter />
      </div>
    )
  }

  // Error state
  if (error && !partyGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <CocinarteHeader />
        <div className="flex items-center justify-center min-h-[60vh] pt-28 sm:pt-32 px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Form Not Found</h3>
              <p className="text-slate-600">{error}</p>
            </CardContent>
          </Card>
        </div>
        <CocinarteFooter />
      </div>
    )
  }

  // Already completed state
  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <CocinarteHeader />
        <div className="flex items-center justify-center min-h-[60vh] pt-28 sm:pt-32 px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Form Already Completed</h3>
              <p className="text-slate-600 mb-2">
                This enrollment form for <strong>{partyGuest?.child_name}</strong> has already been submitted.
              </p>
              <p className="text-sm text-slate-500">
                Completed on {partyGuest?.form_completed_at
                  ? new Date(partyGuest.form_completed_at).toLocaleDateString()
                  : ''}
              </p>
            </CardContent>
          </Card>
        </div>
        <CocinarteFooter />
      </div>
    )
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <CocinarteHeader />
        <div className="flex items-center justify-center min-h-[60vh] pt-28 sm:pt-32 pb-12 px-4">
          <Card className="max-w-lg w-full">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Enrollment Complete!</h3>
              <p className="text-slate-600 max-w-md mx-auto mb-4">
                Thank you! {childFullName}'s enrollment information has been submitted successfully.
              </p>
              {partyDetails && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mt-4">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <PartyPopper className="h-4 w-4" />
                    Party Details
                  </h4>
                  <p className="text-sm text-blue-700"><strong>Date:</strong> {formatDate(partyDetails.preferred_date)}</p>
                  <p className="text-sm text-blue-700"><strong>Package:</strong> {getPackageDisplayName(partyDetails.package)}</p>
                  {partyDetails.birthday_child && (
                    <p className="text-sm text-blue-700"><strong>Birthday Child:</strong> {partyDetails.birthday_child}</p>
                  )}
                  <p className="text-sm text-blue-700"><strong>Hosted by:</strong> {partyDetails.host_name}</p>
                </div>
              )}
              <p className="text-sm text-slate-500 mt-6">
                If you have any questions, contact us at info@cocinartepdx.com
              </p>
            </CardContent>
          </Card>
        </div>
        <CocinarteFooter />
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <CocinarteHeader />

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 pt-28 sm:pt-32">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Birthday Party Enrollment</h1>
          <p className="text-sm sm:text-base text-slate-600">
            Invited by <strong>{partyDetails?.host_name}</strong>
          </p>
        </div>

        {/* Party Info */}
        {partyDetails && (
          <Card className="mb-4 sm:mb-6 border-[#1E3A8A]/20">
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-[#1E3A8A]/10 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <PartyPopper className="h-5 w-5 sm:h-6 sm:w-6 text-[#1E3A8A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800">Birthday Party at Cocinarte</h3>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(partyDetails.preferred_date)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ChefHat className="h-4 w-4 flex-shrink-0" />
                      {getPackageDisplayName(partyDetails.package)}
                    </span>
                    {partyDetails.birthday_child && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        Birthday: {partyDetails.birthday_child}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous data offer */}
        {showReuse && previousChildren.length > 0 && (
          <Alert className="mb-6 bg-purple-50 border-purple-200">
            <RotateCcw className="h-4 w-4 text-purple-600" />
            <AlertDescription>
              <p className="font-semibold text-purple-800 mb-2">
                We noticed you've filled out a form for a previous event.
              </p>
              <p className="text-sm text-purple-700 mb-3">
                Would you like to use the same info? You'll still need to sign consent forms.
              </p>
              <div className="space-y-2">
                {previousChildren.map((child) => (
                  <Button
                    key={child.id}
                    variant="outline"
                    size="sm"
                    className="mr-2 border-purple-300 text-purple-700 hover:bg-purple-100"
                    onClick={() => handleReuseChild(child)}
                  >
                    Use info for {child.child_full_name} (age {child.child_age})
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600"
                  onClick={() => setShowReuse(false)}
                >
                  No thanks, I'll fill it out fresh
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Error alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Section 1: Child Information */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Baby className="h-5 w-5 text-[#1E3A8A] flex-shrink-0" />
              Child Information
            </CardTitle>
            <CardDescription>Tell us about the child who will be attending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="childFullName" className="text-sm">Full Name *</Label>
                <Input
                  id="childFullName"
                  value={childFullName}
                  onChange={(e) => setChildFullName(e.target.value)}
                  placeholder="Child's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childAge">Age *</Label>
                <Input
                  id="childAge"
                  type="number"
                  min="1"
                  max="18"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  placeholder="Age"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="childPreferredName">Preferred Name (optional)</Label>
              <Input
                id="childPreferredName"
                value={childPreferredName}
                onChange={(e) => setChildPreferredName(e.target.value)}
                placeholder="Nickname or preferred name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCookingExperience"
                checked={hasCookingExperience}
                onCheckedChange={(checked) => setHasCookingExperience(checked === true)}
              />
              <Label htmlFor="hasCookingExperience" className="text-sm">
                Has previous cooking experience
              </Label>
            </div>
            {hasCookingExperience && (
              <div className="space-y-2">
                <Label htmlFor="cookingExperienceDetails">Cooking Experience Details</Label>
                <Textarea
                  id="cookingExperienceDetails"
                  value={cookingExperienceDetails}
                  onChange={(e) => setCookingExperienceDetails(e.target.value)}
                  placeholder="Describe their cooking experience..."
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Health & Safety */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              Health & Safety
            </CardTitle>
            <CardDescription>Important health information for your child's safety</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="space-y-1.5">
              <Label htmlFor="allergies" className="text-sm">Allergies</Label>
              <Textarea
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="List any food or other allergies..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietaryRestrictions"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                placeholder="Vegetarian, vegan, kosher, halal, etc."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Textarea
                id="medicalConditions"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="Any medical conditions we should know about..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyMedications">Emergency Medications</Label>
              <Input
                id="emergencyMedications"
                value={emergencyMedications}
                onChange={(e) => setEmergencyMedications(e.target.value)}
                placeholder="EpiPen, inhaler, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Anything else we should know..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Pick-up & Emergency Contact */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-5 w-5 text-green-600 flex-shrink-0" />
              Pick-up & Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="guestParentName">Parent/Guardian Name *</Label>
                <Input
                  id="guestParentName"
                  value={guestParentName}
                  onChange={(e) => setGuestParentName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestParentPhone">Phone Number *</Label>
                <Input
                  id="guestParentPhone"
                  value={guestParentPhone}
                  onChange={(e) => setGuestParentPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorizedPickupPersons">Authorized Pick-up Persons</Label>
              <Textarea
                id="authorizedPickupPersons"
                value={authorizedPickupPersons}
                onChange={(e) => setAuthorizedPickupPersons(e.target.value)}
                placeholder="Names of people authorized to pick up your child..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custodyRestrictions">Custody Restrictions</Label>
              <Input
                id="custodyRestrictions"
                value={custodyRestrictions}
                onChange={(e) => setCustodyRestrictions(e.target.value)}
                placeholder="Any custody restrictions we should be aware of"
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-slate-700 mb-3">Emergency Contact (if different from parent)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={emergencyContactRelationship}
                    onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                    placeholder="e.g., Grandparent, Aunt"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Social Media & Video Consent */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">{SOCIAL_MEDIA_CONSENT_TEXT.title}</CardTitle>
            <CardDescription>Optional - you can change this at any time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <p className="text-sm text-muted-foreground">
              {SOCIAL_MEDIA_CONSENT_TEXT.intro}
            </p>
            <p className="text-sm text-muted-foreground">
              {SOCIAL_MEDIA_CONSENT_TEXT.understanding}
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              {SOCIAL_MEDIA_CONSENT_TEXT.uses.map((use, i) => (
                <li key={i}>{use}</li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground font-medium">
              {SOCIAL_MEDIA_CONSENT_TEXT.privacy}
            </p>
            <p className="text-sm text-muted-foreground">
              {SOCIAL_MEDIA_CONSENT_TEXT.revocation}
            </p>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="socialMediaConsent"
                checked={socialMediaConsent}
                onCheckedChange={(checked) => {
                  setSocialMediaConsent(checked === true)
                  setMediaPermission(checked === true)
                }}
              />
              <Label htmlFor="socialMediaConsent" className="text-sm font-medium leading-none cursor-pointer">
                I give permission for my child to participate in photos and/or videos
                <span className="text-muted-foreground font-normal block mt-1">
                  (Optional - you can change this at any time)
                </span>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Liability Waiver */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">{LIABILITY_CONSENT_TEXT.title} <span className="text-destructive">*</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
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

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="liabilityConsent"
                checked={liabilityConsent}
                onCheckedChange={(checked) => setLiabilityConsent(checked === true)}
              />
              <Label htmlFor="liabilityConsent" className="text-sm font-medium leading-none cursor-pointer">
                I have read and agree to the Cooking Program Liability Acknowledgment
                <span className="text-destructive"> *</span>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Electronic Signature */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Electronic Signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentNameSigned">Parent/Guardian Name <span className="text-destructive">*</span></Label>
                <Input
                  id="parentNameSigned"
                  value={parentNameSigned}
                  onChange={(e) => setParentNameSigned(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childNameSigned">Child's Name <span className="text-destructive">*</span></Label>
                <Input
                  id="childNameSigned"
                  value={childNameSigned}
                  onChange={(e) => setChildNameSigned(e.target.value)}
                  placeholder="Enter child's full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Signature <span className="text-destructive">*</span></Label>
              <SignaturePad
                onSignatureChange={(dataUrl) => setSignatureDataUrl(dataUrl)}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              By signing above, I confirm that I am the parent or legal guardian of the child
              named and have the authority to provide this consent. Today's date:{' '}
              {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-center sm:justify-end pb-12">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !liabilityConsent || !signatureDataUrl}
            size="lg"
            className="w-full sm:w-auto px-8 bg-[#F0614F] hover:bg-[#F0614F]/90 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Submit Enrollment Form
              </>
            )}
          </Button>
        </div>
      </div>

      <CocinarteFooter />
    </div>
  )
}
