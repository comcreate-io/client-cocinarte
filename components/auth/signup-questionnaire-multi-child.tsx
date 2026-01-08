'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Heart,
  Users,
  Car,
  Camera,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { SignupFormDataMultiChild, ChildData, ParentInformation } from '@/types/student'
import { SignaturePad } from '@/components/consent/signature-pad'
import {
  SOCIAL_MEDIA_CONSENT_TEXT,
  LIABILITY_CONSENT_TEXT,
} from '@/types/consent'

interface ConsentData {
  socialMediaConsent: boolean
  liabilityConsent: boolean
  signatureDataUrl: string | null
}

interface SignupQuestionnaireMultiChildProps {
  onComplete: (data: SignupFormDataMultiChild & { consentData?: Record<string, ConsentData> }) => Promise<{ error: any }>
  loading: boolean
}

export default function SignupQuestionnaireMultiChild({ onComplete, loading }: SignupQuestionnaireMultiChildProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [currentStep, setCurrentStep] = useState<'account' | 'parent-info' | 'children-list' | 'consent' | 'review'>('account')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Account credentials
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Parent information
  const [parentInfo, setParentInfo] = useState<ParentInformation>({
    parent_guardian_names: '',
    parent_phone: '',
    parent_email: '',
    preferred_communication_method: 'email',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    address: '',
  })

  // Children list
  const [children, setChildren] = useState<ChildData[]>([])

  // Child being edited
  const [editingChildIndex, setEditingChildIndex] = useState<number | null>(null)
  const [currentChild, setCurrentChild] = useState<ChildData>({
    child_full_name: '',
    child_age: 0,
    child_preferred_name: '',
    has_cooking_experience: false,
    cooking_experience_details: '',
    allergies: '',
    dietary_restrictions: '',
    medical_conditions: '',
    emergency_medications: '',
    additional_notes: '',
    authorized_pickup_persons: '',
    custody_restrictions: '',
    media_permission: false,
  })

  // Consent data per child (keyed by child index)
  const [consentData, setConsentData] = useState<Record<number, ConsentData>>({})
  const [currentConsentChildIndex, setCurrentConsentChildIndex] = useState(0)

  const steps = ['account', 'parent-info', 'children-list', 'consent', 'review'] as const
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const validateStep = (): boolean => {
    setError('')

    switch (currentStep) {
      case 'account':
        if (!email || !password) {
          setError('Email and password are required')
          return false
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters')
          return false
        }
        if (!termsAccepted) {
          setError('You must accept the Terms and Conditions to continue')
          return false
        }
        break

      case 'parent-info':
        if (!parentInfo.parent_guardian_names) {
          setError('Parent/Guardian name is required')
          return false
        }
        if (!parentInfo.parent_phone) {
          setError('Phone number is required')
          return false
        }
        break

      case 'children-list':
        if (children.length === 0) {
          setError('Please add at least one child')
          return false
        }
        break

      case 'consent':
        // Check if all children have liability consent signed
        for (let i = 0; i < children.length; i++) {
          const consent = consentData[i]
          if (!consent?.liabilityConsent) {
            setError(`Please accept the liability waiver for ${children[i].child_full_name}`)
            return false
          }
          if (!consent?.signatureDataUrl) {
            setError(`Please sign the consent form for ${children[i].child_full_name}`)
            return false
          }
        }
        break
    }

    return true
  }

  const handleNext = () => {
    if (!validateStep()) return

    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
      // Scroll to top of card after step change
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
      // Scroll to top of card after step change
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }

  const handleAddChild = () => {
    if (!currentChild.child_full_name || !currentChild.child_age) {
      setError('Child name and age are required')
      return
    }

    if (editingChildIndex !== null) {
      // Update existing child
      const updated = [...children]
      updated[editingChildIndex] = currentChild
      setChildren(updated)
      setEditingChildIndex(null)
    } else {
      // Add new child
      setChildren([...children, currentChild])
    }

    // Reset form
    setCurrentChild({
      child_full_name: '',
      child_age: 0,
      child_preferred_name: '',
      has_cooking_experience: false,
      cooking_experience_details: '',
      allergies: '',
      dietary_restrictions: '',
      medical_conditions: '',
      emergency_medications: '',
      additional_notes: '',
      authorized_pickup_persons: '',
      custody_restrictions: '',
      media_permission: false,
    })
    setError('')
  }

  const handleEditChild = (index: number) => {
    setCurrentChild(children[index])
    setEditingChildIndex(index)
  }

  const handleDeleteChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  const handleCancelEdit = () => {
    setCurrentChild({
      child_full_name: '',
      child_age: 0,
      child_preferred_name: '',
      has_cooking_experience: false,
      cooking_experience_details: '',
      allergies: '',
      dietary_restrictions: '',
      medical_conditions: '',
      emergency_medications: '',
      additional_notes: '',
      authorized_pickup_persons: '',
      custody_restrictions: '',
      media_permission: false,
    })
    setEditingChildIndex(null)
    setError('')
  }

  const handleConsentUpdate = (childIndex: number, field: keyof ConsentData, value: boolean | string | null) => {
    setConsentData(prev => ({
      ...prev,
      [childIndex]: {
        ...prev[childIndex],
        socialMediaConsent: prev[childIndex]?.socialMediaConsent ?? false,
        liabilityConsent: prev[childIndex]?.liabilityConsent ?? false,
        signatureDataUrl: prev[childIndex]?.signatureDataUrl ?? null,
        [field]: value,
      }
    }))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    // Convert consent data to use child names as keys for the API
    const consentDataByName: Record<string, ConsentData> = {}
    children.forEach((child, index) => {
      const consent = consentData[index]
      if (consent && consent.signatureDataUrl && consent.liabilityConsent) {
        consentDataByName[child.child_full_name] = consent
        console.log(`Adding consent for ${child.child_full_name}:`, {
          socialMediaConsent: consent.socialMediaConsent,
          liabilityConsent: consent.liabilityConsent,
          hasSignature: !!consent.signatureDataUrl
        })
      } else {
        console.log(`No valid consent for ${child.child_full_name}:`, consent)
      }
    })

    console.log('Final consent data being sent:', Object.keys(consentDataByName))

    const formData: SignupFormDataMultiChild & { consentData?: Record<string, ConsentData> } = {
      email,
      password,
      parentInfo: {
        ...parentInfo,
        parent_email: email, // Ensure email matches
      },
      children,
      consentData: consentDataByName,
    }

    const { error } = await onComplete(formData)
    if (error) {
      setError(error.message || 'An error occurred during signup')
    }
  }

  const renderAccountStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-cocinarte-orange" />
          <Input
            id="email"
            type="email"
            placeholder="parent@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-cocinarte-orange" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-cocinarte-orange hover:text-cocinarte-red"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <Checkbox
          id="terms_accepted_account"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="terms_accepted_account"
            className="text-sm font-normal leading-snug cursor-pointer"
          >
            I agree to the{' '}
            <Link
              href="/terms"
              target="_blank"
              className="text-cocinarte-orange hover:text-cocinarte-red underline"
            >
              Terms and Conditions
            </Link>
            {' '}*
          </Label>
        </div>
      </div>
    </div>
  )

  const renderParentInfoStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="parent_guardian_names">Parent/Guardian Name(s) *</Label>
        <Input
          id="parent_guardian_names"
          placeholder="Full name(s)"
          value={parentInfo.parent_guardian_names}
          onChange={(e) =>
            setParentInfo({ ...parentInfo, parent_guardian_names: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent_phone">Phone Number *</Label>
        <Input
          id="parent_phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={parentInfo.parent_phone}
          onChange={(e) =>
            setParentInfo({ ...parentInfo, parent_phone: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Preferred Method of Communication *</Label>
        <RadioGroup
          value={parentInfo.preferred_communication_method}
          onValueChange={(value: 'text' | 'email') =>
            setParentInfo({ ...parentInfo, preferred_communication_method: value })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="text" id="comm-text" />
            <Label htmlFor="comm-text" className="font-normal cursor-pointer">
              Text
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="comm-email" />
            <Label htmlFor="comm-email" className="font-normal cursor-pointer">
              Email
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Full address"
          value={parentInfo.address}
          onChange={(e) =>
            setParentInfo({ ...parentInfo, address: e.target.value })
          }
        />
      </div>

      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-3">Emergency Contact</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
            <Input
              id="emergency_contact_name"
              placeholder="Full name"
              value={parentInfo.emergency_contact_name}
              onChange={(e) =>
                setParentInfo({ ...parentInfo, emergency_contact_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={parentInfo.emergency_contact_phone}
              onChange={(e) =>
                setParentInfo({ ...parentInfo, emergency_contact_phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_relationship">Relationship to Child</Label>
            <Input
              id="emergency_contact_relationship"
              placeholder="e.g., Grandparent, aunt, family friend..."
              value={parentInfo.emergency_contact_relationship}
              onChange={(e) =>
                setParentInfo({ ...parentInfo, emergency_contact_relationship: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderChildrenListStep = () => (
    <div className="space-y-6">
      {/* List of added children */}
      {children.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Added Children ({children.length})</h3>
          <div className="space-y-2">
            {children.map((child, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{child.child_full_name}</p>
                    <p className="text-sm text-gray-600">Age: {child.child_age}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditChild(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteChild(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit child form */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">
          {editingChildIndex !== null ? 'Edit Child' : 'Add Child'}
        </h3>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Child's Full Name *</Label>
              <Input
                placeholder="Full legal name"
                value={currentChild.child_full_name}
                onChange={(e) =>
                  setCurrentChild({ ...currentChild, child_full_name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Age *</Label>
              <Input
                type="number"
                min="1"
                max="18"
                placeholder="Age"
                value={currentChild.child_age || ''}
                onChange={(e) =>
                  setCurrentChild({ ...currentChild, child_age: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Name/Nickname</Label>
            <Input
              placeholder="What should we call them?"
              value={currentChild.child_preferred_name}
              onChange={(e) =>
                setCurrentChild({ ...currentChild, child_preferred_name: e.target.value })
              }
            />
          </div>

          {/* Health & Safety - Collapsed by default, expandable */}
          <details className="border rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Health & Safety Information
            </summary>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Allergies or Food Sensitivities</Label>
                <Textarea
                  placeholder="Please list all allergies..."
                  value={currentChild.allergies}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, allergies: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Dietary Restrictions</Label>
                <Input
                  placeholder="e.g., Vegetarian, vegan, no pork..."
                  value={currentChild.dietary_restrictions}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, dietary_restrictions: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Medical Conditions</Label>
                <Textarea
                  placeholder="Any medical conditions..."
                  value={currentChild.medical_conditions}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, medical_conditions: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Emergency Medications</Label>
                <Input
                  placeholder="e.g., EpiPen, inhaler..."
                  value={currentChild.emergency_medications}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, emergency_medications: e.target.value })
                  }
                />
              </div>
            </div>
          </details>

          {/* Pickup Information - Collapsed */}
          <details className="border rounded-lg p-4">
            <summary className="cursor-pointer font-semibold flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-500" />
              Pick-Up Information
            </summary>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Authorized Pickup Persons</Label>
                <Textarea
                  placeholder="List all people authorized to pick up this child..."
                  value={currentChild.authorized_pickup_persons}
                  onChange={(e) =>
                    setCurrentChild({ ...currentChild, authorized_pickup_persons: e.target.value })
                  }
                />
              </div>
            </div>
          </details>

          <div className="space-y-3 pt-4">
            {/* Primary Save Button */}
            <div className="flex gap-2">
              {editingChildIndex !== null && (
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleAddChild}
                className="flex-1 bg-cocinarte-orange hover:bg-cocinarte-red"
              >
                {editingChildIndex !== null ? 'Save Changes' : 'Save Child'}
              </Button>
            </div>

            {/* Add Another Child Button (smaller, only after saving first child) */}
            {editingChildIndex === null && children.length > 0 && currentChild.child_full_name === '' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Form is already reset, just scroll to top
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="w-full text-sm border-cocinarte-orange text-cocinarte-orange hover:bg-cocinarte-orange/10"
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Another Child
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )

  const renderConsentStep = () => (
    <div className="space-y-6">
      <Alert>
        <Camera className="h-4 w-4" />
        <AlertDescription>
          Please read and sign the consent forms for each child. The liability waiver is required; photo/video permission is optional.
        </AlertDescription>
      </Alert>

      {children.map((child, index) => (
        <Card key={index} className="p-4">
          <h3 className="font-semibold mb-4 text-lg">
            Consent for {child.child_full_name}
          </h3>

          {/* Social Media & Video Consent */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">{SOCIAL_MEDIA_CONSENT_TEXT.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{SOCIAL_MEDIA_CONSENT_TEXT.intro}</p>
            <p className="text-sm text-gray-600 mb-2">{SOCIAL_MEDIA_CONSENT_TEXT.understanding}</p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-2 ml-2">
              {SOCIAL_MEDIA_CONSENT_TEXT.uses.map((use, i) => (
                <li key={i}>{use}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 font-medium mb-2">{SOCIAL_MEDIA_CONSENT_TEXT.privacy}</p>
            <p className="text-sm text-gray-600 mb-4">{SOCIAL_MEDIA_CONSENT_TEXT.revocation}</p>

            <div className="flex items-start space-x-3">
              <Checkbox
                id={`social-media-${index}`}
                checked={consentData[index]?.socialMediaConsent ?? false}
                onCheckedChange={(checked) => handleConsentUpdate(index, 'socialMediaConsent', checked as boolean)}
              />
              <Label htmlFor={`social-media-${index}`} className="text-sm cursor-pointer">
                I give permission for photos and/or videos (Optional)
              </Label>
            </div>
          </div>

          {/* Liability Waiver */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">{LIABILITY_CONSENT_TEXT.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{LIABILITY_CONSENT_TEXT.intro}</p>
            <p className="text-sm text-gray-600 mb-2">{LIABILITY_CONSENT_TEXT.risks}</p>
            <p className="text-sm text-gray-600 mb-2">{LIABILITY_CONSENT_TEXT.release}</p>
            <p className="text-sm text-gray-600 font-medium mb-4">{LIABILITY_CONSENT_TEXT.disclosure}</p>

            <div className="flex items-start space-x-3">
              <Checkbox
                id={`liability-${index}`}
                checked={consentData[index]?.liabilityConsent ?? false}
                onCheckedChange={(checked) => handleConsentUpdate(index, 'liabilityConsent', checked as boolean)}
              />
              <Label htmlFor={`liability-${index}`} className="text-sm cursor-pointer">
                I have read and agree to the Cooking Program Liability Acknowledgment <span className="text-red-500">*</span>
              </Label>
            </div>
          </div>

          {/* Signature */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Electronic Signature <span className="text-red-500">*</span></h4>
            <p className="text-sm text-gray-600 mb-4">
              By signing below, I confirm that I am the parent or legal guardian of {child.child_full_name} and have the authority to provide this consent.
            </p>
            <SignaturePad
              onSignatureChange={(dataUrl) => handleConsentUpdate(index, 'signatureDataUrl', dataUrl)}
            />
            {consentData[index]?.signatureDataUrl && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <Check className="h-4 w-4" /> Signature captured
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <Alert>
        <Check className="h-4 w-4" />
        <AlertDescription>
          Please review your information before submitting.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-cocinarte-orange" />
            Parent Information
          </h3>
          <dl className="space-y-1 text-sm">
            <div>
              <dt className="font-medium inline">Name: </dt>
              <dd className="inline">{parentInfo.parent_guardian_names}</dd>
            </div>
            <div>
              <dt className="font-medium inline">Email: </dt>
              <dd className="inline">{email}</dd>
            </div>
            <div>
              <dt className="font-medium inline">Phone: </dt>
              <dd className="inline">{parentInfo.parent_phone}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-cocinarte-orange" />
            Children ({children.length})
          </h3>
          <div className="space-y-2">
            {children.map((child, index) => (
              <div key={index} className="border-l-2 border-cocinarte-orange pl-3">
                <p className="font-medium">{child.child_full_name}</p>
                <p className="text-sm text-gray-600">Age: {child.child_age}</p>
                {child.allergies && (
                  <p className="text-sm text-red-600">Allergies: {child.allergies}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  return (
    <Card ref={cardRef} className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="mb-4">
          <CardTitle className="text-xl">
            {currentStep === 'account' && 'Create Account'}
            {currentStep === 'parent-info' && 'Parent Information'}
            {currentStep === 'children-list' && 'Add Children'}
            {currentStep === 'consent' && 'Consent & Waivers'}
            {currentStep === 'review' && 'Review & Submit'}
          </CardTitle>
          <CardDescription>
            Step {currentStepIndex + 1} of {steps.length}
          </CardDescription>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === 'account' && renderAccountStep()}
        {currentStep === 'parent-info' && renderParentInfoStep()}
        {currentStep === 'children-list' && renderChildrenListStep()}
        {currentStep === 'consent' && renderConsentStep()}
        {currentStep === 'review' && renderReviewStep()}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {currentStep === 'review' ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-cocinarte-red hover:bg-cocinarte-orange"
            >
              {loading ? 'Creating Account...' : 'Complete Signup'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={loading}
              className="bg-cocinarte-orange hover:bg-cocinarte-red"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
