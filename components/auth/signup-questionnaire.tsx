'use client'

import { useState } from 'react'
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
  Lock
} from 'lucide-react'
import { SignupFormData, SignupStep } from '@/types/student'

interface SignupQuestionnaireProps {
  onComplete: (data: SignupFormData) => Promise<{ error: any }>
  loading: boolean
}

export default function SignupQuestionnaire({ onComplete, loading }: SignupQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('account')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    childInfo: {
      child_full_name: '',
      child_age: 0,
      child_preferred_name: '',
      has_cooking_experience: false,
      cooking_experience_details: '',
    },
    healthSafety: {
      allergies: '',
      dietary_restrictions: '',
      medical_conditions: '',
      emergency_medications: '',
      additional_notes: '',
    },
    parentInfo: {
      parent_guardian_names: '',
      parent_phone: '',
      parent_email: '',
      preferred_communication_method: 'email',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relationship: '',
    },
    pickupInfo: {
      authorized_pickup_persons: '',
      custody_restrictions: '',
    },
    mediaPermission: {
      media_permission: false,
    },
  })

  const steps: SignupStep[] = [
    'account',
    'child-info',
    'health-safety',
    'parent-info',
    'pickup-info',
    'media-permission',
    'review',
  ]

  const stepTitles: Record<SignupStep, string> = {
    'account': 'Create Account',
    'child-info': 'Child Information',
    'health-safety': 'Health & Safety',
    'parent-info': 'Parent Information',
    'pickup-info': 'Pick-Up Information',
    'media-permission': 'Media Permission',
    'review': 'Review & Submit',
  }

  const stepIcons: Record<SignupStep, React.ReactNode> = {
    'account': <Mail className="w-5 h-5" />,
    'child-info': <User className="w-5 h-5" />,
    'health-safety': <Heart className="w-5 h-5" />,
    'parent-info': <Users className="w-5 h-5" />,
    'pickup-info': <Car className="w-5 h-5" />,
    'media-permission': <Camera className="w-5 h-5" />,
    'review': <Check className="w-5 h-5" />,
  }

  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const validateStep = (): boolean => {
    setError('')

    switch (currentStep) {
      case 'account':
        if (!formData.email || !formData.password) {
          setError('Email and password are required')
          return false
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          return false
        }
        break

      case 'child-info':
        if (!formData.childInfo.child_full_name) {
          setError("Child's full name is required")
          return false
        }
        if (!formData.childInfo.child_age || formData.childInfo.child_age < 1) {
          setError('Please enter a valid age')
          return false
        }
        break

      case 'parent-info':
        if (!formData.parentInfo.parent_guardian_names) {
          setError('Parent/Guardian name is required')
          return false
        }
        if (!formData.parentInfo.parent_phone) {
          setError('Phone number is required')
          return false
        }
        if (!formData.parentInfo.parent_email) {
          setError('Email is required')
          return false
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
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    const { error } = await onComplete(formData)
    if (error) {
      setError(error.message || 'An error occurred during signup')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'account':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-cocinarte-orange" />
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          </div>
        )

      case 'child-info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="child_full_name">Child's Full Name *</Label>
              <Input
                id="child_full_name"
                placeholder="Full legal name"
                value={formData.childInfo.child_full_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    childInfo: { ...formData.childInfo, child_full_name: e.target.value },
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="child_age">Age *</Label>
              <Input
                id="child_age"
                type="number"
                min="1"
                max="18"
                placeholder="Child's age"
                value={formData.childInfo.child_age || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    childInfo: { ...formData.childInfo, child_age: parseInt(e.target.value) || 0 },
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="child_preferred_name">Preferred Name/Nickname</Label>
              <Input
                id="child_preferred_name"
                placeholder="What should we call them?"
                value={formData.childInfo.child_preferred_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    childInfo: { ...formData.childInfo, child_preferred_name: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Does your child have any previous cooking class experience?</Label>
              <RadioGroup
                value={formData.childInfo.has_cooking_experience.toString()}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    childInfo: { ...formData.childInfo, has_cooking_experience: value === 'true' },
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="experience-yes" />
                  <Label htmlFor="experience-yes" className="font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="experience-no" />
                  <Label htmlFor="experience-no" className="font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.childInfo.has_cooking_experience && (
              <div className="space-y-2">
                <Label htmlFor="cooking_experience_details">Tell us about their experience</Label>
                <Textarea
                  id="cooking_experience_details"
                  placeholder="Describe any previous cooking experience..."
                  value={formData.childInfo.cooking_experience_details}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      childInfo: { ...formData.childInfo, cooking_experience_details: e.target.value },
                    })
                  }
                />
              </div>
            )}
          </div>
        )

      case 'health-safety':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies or Food Sensitivities</Label>
              <Textarea
                id="allergies"
                placeholder="Please list all allergies (e.g., peanuts, dairy, shellfish...)"
                value={formData.healthSafety.allergies}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    healthSafety: { ...formData.healthSafety, allergies: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
              <Input
                id="dietary_restrictions"
                placeholder="e.g., Vegetarian, vegan, no pork, gluten-free..."
                value={formData.healthSafety.dietary_restrictions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    healthSafety: { ...formData.healthSafety, dietary_restrictions: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_conditions">Medical Conditions We Should Be Aware Of</Label>
              <Textarea
                id="medical_conditions"
                placeholder="Any medical conditions..."
                value={formData.healthSafety.medical_conditions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    healthSafety: { ...formData.healthSafety, medical_conditions: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_medications">Emergency Medications Needed</Label>
              <Input
                id="emergency_medications"
                placeholder="e.g., EpiPen, inhaler..."
                value={formData.healthSafety.emergency_medications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    healthSafety: { ...formData.healthSafety, emergency_medications: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes">Anything Else Important About Your Child?</Label>
              <Textarea
                id="additional_notes"
                placeholder="Any other information you'd like us to know..."
                value={formData.healthSafety.additional_notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    healthSafety: { ...formData.healthSafety, additional_notes: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )

      case 'parent-info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent_guardian_names">Parent/Guardian Name(s) *</Label>
              <Input
                id="parent_guardian_names"
                placeholder="Full name(s)"
                value={formData.parentInfo.parent_guardian_names}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentInfo: { ...formData.parentInfo, parent_guardian_names: e.target.value },
                  })
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
                value={formData.parentInfo.parent_phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentInfo: { ...formData.parentInfo, parent_phone: e.target.value },
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_email">Email *</Label>
              <Input
                id="parent_email"
                type="email"
                placeholder="parent@example.com"
                value={formData.parentInfo.parent_email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentInfo: { ...formData.parentInfo, parent_email: e.target.value },
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Method of Communication *</Label>
              <RadioGroup
                value={formData.parentInfo.preferred_communication_method}
                onValueChange={(value: 'text' | 'email') =>
                  setFormData({
                    ...formData,
                    parentInfo: { ...formData.parentInfo, preferred_communication_method: value },
                  })
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

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Emergency Contact</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    placeholder="Full name"
                    value={formData.parentInfo.emergency_contact_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentInfo: { ...formData.parentInfo, emergency_contact_name: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.parentInfo.emergency_contact_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentInfo: { ...formData.parentInfo, emergency_contact_phone: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_relationship">Relationship to Child</Label>
                  <Input
                    id="emergency_contact_relationship"
                    placeholder="e.g., Grandparent, aunt, family friend..."
                    value={formData.parentInfo.emergency_contact_relationship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parentInfo: { ...formData.parentInfo, emergency_contact_relationship: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'pickup-info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authorized_pickup_persons">Who is Authorized to Pick Up Your Child?</Label>
              <Textarea
                id="authorized_pickup_persons"
                placeholder="List all people authorized to pick up your child (e.g., Mom - Jane Doe, Dad - John Doe, Aunt - Sarah Smith...)"
                value={formData.pickupInfo.authorized_pickup_persons}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pickupInfo: { ...formData.pickupInfo, authorized_pickup_persons: e.target.value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custody_restrictions">Custody Restrictions or Safety Notes</Label>
              <Textarea
                id="custody_restrictions"
                placeholder="Any custody restrictions or safety information we should be aware of..."
                value={formData.pickupInfo.custody_restrictions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pickupInfo: { ...formData.pickupInfo, custody_restrictions: e.target.value },
                  })
                }
              />
              <p className="text-xs text-gray-500">
                This information is kept confidential and is only used to ensure your child's safety.
              </p>
            </div>
          </div>
        )

      case 'media-permission':
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Photo & Video Permission
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                During class, we take photos and videos to document the children's culinary creations and
                learning experiences. These may be used for:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                <li>Class portfolios shared with parents</li>
                <li>Cocinarte social media (Instagram, Facebook)</li>
                <li>Marketing and promotional materials</li>
                <li>Website and advertising</li>
              </ul>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Checkbox
                id="media_permission"
                checked={formData.mediaPermission.media_permission}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    mediaPermission: { ...formData.mediaPermission, media_permission: checked as boolean },
                  })
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="media_permission"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I give permission for photos/videos of my child
                </Label>
                <p className="text-sm text-muted-foreground">
                  You can update this preference at any time by contacting us.
                </p>
              </div>
            </div>
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Please review your information before submitting. You can go back to edit any section.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-cocinarte-orange" />
                  Child Information
                </h3>
                <dl className="space-y-1 text-sm">
                  <div>
                    <dt className="font-medium inline">Name: </dt>
                    <dd className="inline">{formData.childInfo.child_full_name}</dd>
                  </div>
                  <div>
                    <dt className="font-medium inline">Age: </dt>
                    <dd className="inline">{formData.childInfo.child_age}</dd>
                  </div>
                  {formData.childInfo.child_preferred_name && (
                    <div>
                      <dt className="font-medium inline">Preferred Name: </dt>
                      <dd className="inline">{formData.childInfo.child_preferred_name}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cocinarte-orange" />
                  Parent Information
                </h3>
                <dl className="space-y-1 text-sm">
                  <div>
                    <dt className="font-medium inline">Name: </dt>
                    <dd className="inline">{formData.parentInfo.parent_guardian_names}</dd>
                  </div>
                  <div>
                    <dt className="font-medium inline">Email: </dt>
                    <dd className="inline">{formData.parentInfo.parent_email}</dd>
                  </div>
                  <div>
                    <dt className="font-medium inline">Phone: </dt>
                    <dd className="inline">{formData.parentInfo.parent_phone}</dd>
                  </div>
                </dl>
              </div>

              {(formData.healthSafety.allergies ||
                formData.healthSafety.dietary_restrictions ||
                formData.healthSafety.medical_conditions) && (
                <div className="rounded-lg border p-4 bg-yellow-50">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-yellow-600" />
                    Health & Safety
                  </h3>
                  <dl className="space-y-1 text-sm">
                    {formData.healthSafety.allergies && (
                      <div>
                        <dt className="font-medium">Allergies: </dt>
                        <dd>{formData.healthSafety.allergies}</dd>
                      </div>
                    )}
                    {formData.healthSafety.dietary_restrictions && (
                      <div>
                        <dt className="font-medium">Dietary Restrictions: </dt>
                        <dd>{formData.healthSafety.dietary_restrictions}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cocinarte-orange" />
                  Media Permission
                </h3>
                <p className="text-sm">
                  {formData.mediaPermission.media_permission
                    ? 'Permission granted for photos/videos'
                    : 'No media permission granted'}
                </p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-cocinarte-orange/10">
              {stepIcons[currentStep]}
            </div>
            <div>
              <CardTitle className="text-xl">{stepTitles[currentStep]}</CardTitle>
              <CardDescription>
                Step {currentStepIndex + 1} of {steps.length}
              </CardDescription>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {renderStepContent()}

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
