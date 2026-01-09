'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SignaturePad } from './signature-pad'
import {
  SOCIAL_MEDIA_CONSENT_TEXT,
  LIABILITY_CONSENT_TEXT,
} from '@/types/consent'
import { cn } from '@/lib/utils'

interface ConsentFormProps {
  childName: string
  childId: string
  parentId: string
  parentName?: string
  onSubmit: (data: {
    childId: string
    parentId: string
    socialMediaConsent: boolean
    liabilityConsent: boolean
    parentNameSigned: string
    childNameSigned: string
    signatureDataUrl: string
  }) => Promise<void>
  initialSocialMediaConsent?: boolean
  showLiability?: boolean
  className?: string
}

export function ConsentForm({
  childName,
  childId,
  parentId,
  parentName = '',
  onSubmit,
  initialSocialMediaConsent = false,
  showLiability = true,
  className,
}: ConsentFormProps) {
  const [socialMediaConsent, setSocialMediaConsent] = useState(initialSocialMediaConsent)
  const [liabilityConsent, setLiabilityConsent] = useState(false)
  const [parentNameSigned, setParentNameSigned] = useState(parentName)
  const [childNameSigned, setChildNameSigned] = useState(childName)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid =
    (showLiability ? liabilityConsent : true) &&
    parentNameSigned.trim() !== '' &&
    childNameSigned.trim() !== '' &&
    signatureDataUrl !== null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !signatureDataUrl) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        childId,
        parentId,
        socialMediaConsent,
        liabilityConsent: showLiability ? liabilityConsent : true,
        parentNameSigned: parentNameSigned.trim(),
        childNameSigned: childNameSigned.trim(),
        signatureDataUrl,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit consent form')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Social Media & Video Consent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{SOCIAL_MEDIA_CONSENT_TEXT.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {SOCIAL_MEDIA_CONSENT_TEXT.intro}
          </p>
          <p className="text-sm text-muted-foreground">
            {SOCIAL_MEDIA_CONSENT_TEXT.understanding}
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            {SOCIAL_MEDIA_CONSENT_TEXT.uses.map((use, index) => (
              <li key={index}>{use}</li>
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
              id="social-media-consent"
              checked={socialMediaConsent}
              onCheckedChange={(checked) => setSocialMediaConsent(checked === true)}
            />
            <Label
              htmlFor="social-media-consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I give permission for my child to participate in photos and/or videos
              <span className="text-muted-foreground font-normal block mt-1">
                (Optional - you can change this at any time)
              </span>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Liability Waiver */}
      {showLiability && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{LIABILITY_CONSENT_TEXT.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                id="liability-consent"
                checked={liabilityConsent}
                onCheckedChange={(checked) => setLiabilityConsent(checked === true)}
                required
              />
              <Label
                htmlFor="liability-consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I have read and agree to the Cooking Program Liability Acknowledgment
                <span className="text-destructive">*</span>
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Electronic Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parent-name">Parent/Guardian Name <span className="text-destructive">*</span></Label>
              <Input
                id="parent-name"
                value={parentNameSigned}
                onChange={(e) => setParentNameSigned(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="child-name">Child&apos;s Name <span className="text-destructive">*</span></Label>
              <Input
                id="child-name"
                value={childNameSigned}
                onChange={(e) => setChildNameSigned(e.target.value)}
                placeholder="Enter child's full name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Signature <span className="text-destructive">*</span></Label>
            <SignaturePad onSignatureChange={setSignatureDataUrl} />
          </div>

          <p className="text-xs text-muted-foreground">
            By signing above, I confirm that I am the parent or legal guardian of the child
            named and have the authority to provide this consent. Today&apos;s date:{' '}
            {new Date().toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={!isValid || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Sign and Submit Consent Form'}
      </Button>
    </form>
  )
}
