'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ConsentForm } from '@/components/consent/consent-form'
import { ConsentForm as ConsentFormType } from '@/types/consent'
import { FileCheck, Camera, Shield, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

interface ChildWithConsent {
  id: string
  child_full_name: string
  child_preferred_name?: string
  child_age: number
  consent_form: ConsentFormType | null
}

interface ConsentManagementProps {
  parentId: string
  parentName: string
  onUpdate?: () => void
}

export default function ConsentManagement({ parentId, parentName, onUpdate }: ConsentManagementProps) {
  const [children, setChildren] = useState<ChildWithConsent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChild, setSelectedChild] = useState<ChildWithConsent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdatingMedia, setIsUpdatingMedia] = useState<string | null>(null)

  useEffect(() => {
    loadConsentStatus()
  }, [parentId])

  const loadConsentStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/consent/status?parent_id=${parentId}`)
      const data = await response.json()

      if (data.success) {
        setChildren(data.children || [])
      } else {
        setError(data.error || 'Failed to load consent status')
      }
    } catch (err) {
      setError('Failed to load consent status')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignConsent = (child: ChildWithConsent) => {
    setSelectedChild(child)
    setIsDialogOpen(true)
  }

  const handleConsentSubmit = async (data: {
    childId: string
    parentId: string
    socialMediaConsent: boolean
    liabilityConsent: boolean
    parentNameSigned: string
    childNameSigned: string
    signatureDataUrl: string
  }) => {
    const response = await fetch('/api/consent/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id: data.childId,
        parent_id: data.parentId,
        social_media_consent: data.socialMediaConsent,
        liability_consent: data.liabilityConsent,
        parent_name_signed: data.parentNameSigned,
        child_name_signed: data.childNameSigned,
        signature_data_url: data.signatureDataUrl,
      }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to submit consent')
    }

    setIsDialogOpen(false)
    setSelectedChild(null)
    await loadConsentStatus()
    onUpdate?.()
  }

  const handleToggleMediaConsent = async (child: ChildWithConsent) => {
    // If turning on media consent, they need to sign a new form
    if (!child.consent_form?.social_media_consent) {
      handleSignConsent(child)
      return
    }

    // If turning off, we can just revoke and create a new consent without media
    setIsUpdatingMedia(child.id)
    try {
      // Revoke current consent
      await fetch('/api/consent/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: child.id }),
      })

      // We need them to re-sign without media consent
      handleSignConsent(child)
    } catch (err) {
      console.error('Failed to update media consent:', err)
    } finally {
      setIsUpdatingMedia(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-cocinarte-orange" />
            Consent Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cocinarte-orange"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-cocinarte-orange" />
            Consent Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileCheck className="h-5 w-5 text-cocinarte-orange" />
            Consent Forms & Waivers
          </CardTitle>
          <CardDescription className="text-sm">
            Manage photo/video permissions and liability waivers for each child
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {children.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No children registered. Add a child to manage consent forms.
            </p>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-base">
                        {child.child_full_name}
                        {child.child_preferred_name && (
                          <span className="text-muted-foreground font-normal">
                            {' '}({child.child_preferred_name})
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">Age: {child.child_age}</p>
                    </div>

                    {!child.consent_form ? (
                      <Button
                        size="sm"
                        onClick={() => handleSignConsent(child)}
                        className="gap-2"
                      >
                        <FileCheck className="h-4 w-4" />
                        Sign Consent Form
                      </Button>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Signed
                      </Badge>
                    )}
                  </div>

                  {child.consent_form && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                      {/* Liability Waiver Status */}
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Liability Waiver</span>
                        <Badge variant="secondary" className="text-xs">
                          Signed
                        </Badge>
                      </div>

                      {/* Media Permission Toggle */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Photo/Video Permission</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {child.consent_form.social_media_consent ? (
                            <Badge variant="secondary" className="text-xs text-green-600">
                              Allowed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs text-muted-foreground">
                              Not Allowed
                            </Badge>
                          )}
                          <Switch
                            checked={child.consent_form.social_media_consent}
                            onCheckedChange={() => handleToggleMediaConsent(child)}
                            disabled={isUpdatingMedia === child.id}
                          />
                        </div>
                      </div>

                      {/* Signed Date */}
                      <div className="col-span-full text-xs text-muted-foreground">
                        Signed on {new Date(child.consent_form.signed_at).toLocaleDateString()} by {child.consent_form.parent_name_signed}
                      </div>
                    </div>
                  )}

                  {!child.consent_form && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Consent form required before attending classes</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consent Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Consent Form for {selectedChild?.child_full_name}
            </DialogTitle>
            <DialogDescription>
              Please read and sign the consent forms below.
            </DialogDescription>
          </DialogHeader>

          {selectedChild && (
            <ConsentForm
              childName={selectedChild.child_full_name}
              childId={selectedChild.id}
              parentId={parentId}
              parentName={parentName}
              onSubmit={handleConsentSubmit}
              initialSocialMediaConsent={selectedChild.consent_form?.social_media_consent ?? false}
              showLiability={!selectedChild.consent_form?.liability_consent}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
