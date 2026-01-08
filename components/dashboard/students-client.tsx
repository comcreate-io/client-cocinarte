"use client"

import { useMemo, useState, type JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Mail, Phone, Search, Baby, AlertCircle, ChefHat, Camera, Shield, FileCheck, XCircle, Download, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { jsPDF } from 'jspdf'
import {
  SOCIAL_MEDIA_CONSENT_TEXT,
  LIABILITY_CONSENT_TEXT,
} from '@/types/consent'

type ConsentForm = {
  id: string
  social_media_consent: boolean
  liability_consent: boolean
  signed_at: string
  parent_name_signed: string
  signature_url?: string | null
}

type Child = {
  id: string
  child_full_name: string
  child_preferred_name?: string | null
  child_age: number
  allergies?: string | null
  dietary_restrictions?: string | null
  has_cooking_experience?: boolean
  cooking_experience_details?: string | null
  medical_conditions?: string | null
  emergency_medications?: string | null
  consent_form?: ConsentForm | null
}

type Parent = {
  id: string
  user_id: string
  parent_guardian_names: string
  parent_email: string
  parent_phone?: string | null
  address?: string | null
  created_at?: string
  children?: Child[]
}

interface StudentsClientProps {
  initialParents: Parent[]
}

export function StudentsClient({ initialParents }: StudentsClientProps): JSX.Element {
  const [parents, setParents] = useState<Parent[]>(initialParents)
  const [query, setQuery] = useState('')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [isContractOpen, setIsContractOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)

  const filtered = useMemo(() => {
    if (!query) return parents
    const q = query.toLowerCase()
    return parents.filter((p) => {
      const parentMatch = [
        p.parent_guardian_names,
        p.parent_email,
        p.parent_phone || '',
        p.address || ''
      ].join(' ').toLowerCase().includes(q)

      const childMatch = p.children?.some(c =>
        [c.child_full_name, c.child_preferred_name || ''].join(' ').toLowerCase().includes(q)
      )

      return parentMatch || childMatch
    })
  }, [parents, query])

  const openDetails = (parent: Parent) => {
    setSelectedParent(parent)
    setIsDetailsOpen(true)
  }

  const openContractPopup = (child: Child) => {
    setSelectedChild(child)
    setIsContractOpen(true)
  }

  const generatePDF = async (child: Child) => {
    if (!child.consent_form) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    let yPosition = 20

    // Helper function to add wrapped text
    const addWrappedText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, maxWidth)

      // Check if we need a new page
      if (yPosition + (lines.length * (fontSize * 0.4)) > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        yPosition = 20
      }

      doc.text(lines, margin, yPosition)
      yPosition += lines.length * (fontSize * 0.4) + 5
    }

    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Cocinarte - Consent Form', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Child Info
    addWrappedText(`Child: ${child.child_full_name}`, 12, true)
    if (child.child_preferred_name) {
      addWrappedText(`Preferred Name: ${child.child_preferred_name}`, 11)
    }
    addWrappedText(`Age: ${child.child_age} years old`, 11)
    yPosition += 10

    // Social Media Consent Section
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.title, 14, true)
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.intro)
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.understanding)
    SOCIAL_MEDIA_CONSENT_TEXT.uses.forEach(use => {
      addWrappedText(`• ${use}`)
    })
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.privacy)
    addWrappedText(SOCIAL_MEDIA_CONSENT_TEXT.revocation)
    addWrappedText(`Social Media Consent: ${child.consent_form.social_media_consent ? 'GRANTED' : 'NOT GRANTED'}`, 11, true)
    yPosition += 10

    // Liability Consent Section
    addWrappedText(LIABILITY_CONSENT_TEXT.title, 14, true)
    addWrappedText(LIABILITY_CONSENT_TEXT.intro)
    addWrappedText(LIABILITY_CONSENT_TEXT.risks)
    addWrappedText(LIABILITY_CONSENT_TEXT.release)
    addWrappedText(LIABILITY_CONSENT_TEXT.disclosure)
    addWrappedText(`Liability Waiver: ${child.consent_form.liability_consent ? 'ACCEPTED' : 'NOT ACCEPTED'}`, 11, true)
    yPosition += 10

    // Signature Section
    addWrappedText('Signature Information', 14, true)
    addWrappedText(`Parent/Guardian Name: ${child.consent_form.parent_name_signed}`)
    addWrappedText(`Date Signed: ${new Date(child.consent_form.signed_at).toLocaleDateString()}`)
    yPosition += 5

    // Add signature image if available
    if (child.consent_form.signature_url) {
      try {
        // Check if we need a new page for signature
        if (yPosition + 50 > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage()
          yPosition = 20
        }

        addWrappedText('Signature:', 11, true)

        // Fetch and add signature image
        const response = await fetch(child.consent_form.signature_url)
        const blob = await response.blob()
        const reader = new FileReader()

        await new Promise<void>((resolve, reject) => {
          reader.onloadend = () => {
            try {
              const base64data = reader.result as string
              doc.addImage(base64data, 'PNG', margin, yPosition, 80, 30)
              yPosition += 40
              resolve()
            } catch (e) {
              reject(e)
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      } catch (error) {
        console.error('Error adding signature to PDF:', error)
        addWrappedText('(Signature image could not be loaded)')
      }
    }

    // Footer
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.text(`Generated on ${new Date().toLocaleString()}`, margin, doc.internal.pageSize.getHeight() - 10)

    // Save the PDF
    doc.save(`Cocinarte_Consent_${child.child_full_name.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search families and children..."
              className="pl-8 w-64"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'family' : 'families'} • {filtered.reduce((sum, p) => sum + (p.children?.length || 0), 0)} children
        </div>
      </div>

      <div className="grid gap-4 w-full grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
        {filtered.map((parent) => (
          <Card
            key={parent.id}
            className="cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => openDetails(parent)}
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Parent Info */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg">{parent.parent_guardian_names}</p>
                    <p className="text-sm text-muted-foreground truncate">{parent.parent_email}</p>
                    {parent.parent_phone && (
                      <p className="text-sm text-muted-foreground">{parent.parent_phone}</p>
                    )}
                  </div>
                </div>

                {/* Children Info */}
                {parent.children && parent.children.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Baby className="h-4 w-4" />
                      Children ({parent.children.length})
                    </div>
                    <div className="space-y-2">
                      {parent.children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                          <div className="flex-1">
                            <span className="font-medium">{child.child_full_name}</span>
                            {child.child_preferred_name && (
                              <span className="text-muted-foreground ml-1">({child.child_preferred_name})</span>
                            )}
                            <span className="text-muted-foreground ml-2">• Age {child.child_age}</span>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {child.consent_form?.liability_consent ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Waiver
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                <XCircle className="h-3 w-3 mr-1" />
                                No Waiver
                              </Badge>
                            )}
                            {child.consent_form?.social_media_consent && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                <Camera className="h-3 w-3" />
                              </Badge>
                            )}
                            {child.has_cooking_experience && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                <ChefHat className="h-3 w-3 mr-1" />
                                Exp
                              </Badge>
                            )}
                            {(child.allergies || child.dietary_restrictions) && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                                <AlertCircle className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No families found matching your search.</p>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Family Details</DialogTitle>
          </DialogHeader>
          {selectedParent && (
            <div className="space-y-6">
              {/* Parent Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Parent/Guardian Information
                </h3>
                <div className="grid gap-3 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{selectedParent.parent_guardian_names}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{selectedParent.parent_email}</div>
                  </div>
                  {selectedParent.parent_phone && (
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{selectedParent.parent_phone}</div>
                    </div>
                  )}
                  {selectedParent.address && (
                    <div>
                      <div className="text-sm text-muted-foreground">Address</div>
                      <div className="font-medium">{selectedParent.address}</div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedParent.parent_phone && (
                    <>
                      <Button asChild variant="outline" size="sm">
                        <a href={`tel:${selectedParent.parent_phone}`} aria-label="Call">
                          <Phone className="h-4 w-4 mr-2" /> Call
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <a href={`sms:${selectedParent.parent_phone}`} aria-label="SMS">
                          <Phone className="h-4 w-4 mr-2" /> SMS
                        </a>
                      </Button>
                    </>
                  )}
                  <Button asChild size="sm">
                    <a href={`mailto:${selectedParent.parent_email}`} aria-label="Email">
                      <Mail className="h-4 w-4 mr-2" /> Email
                    </a>
                  </Button>
                </div>
              </div>

              {/* Children Information */}
              {selectedParent.children && selectedParent.children.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    Children ({selectedParent.children.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedParent.children.map((child) => (
                      <Card key={child.id} className="border-2">
                        <CardContent className="pt-6 space-y-3">
                          <div>
                            <h4 className="font-semibold text-lg">{child.child_full_name}</h4>
                            {child.child_preferred_name && (
                              <p className="text-sm text-muted-foreground">Preferred name: {child.child_preferred_name}</p>
                            )}
                            <p className="text-sm text-muted-foreground">Age: {child.child_age} years old</p>
                          </div>

                          {/* Consent Forms Status */}
                          <div className={`border rounded-lg p-3 ${child.consent_form ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <FileCheck className={`h-4 w-4 ${child.consent_form ? 'text-green-700' : 'text-red-700'}`} />
                              <span className={`text-sm font-semibold ${child.consent_form ? 'text-green-800' : 'text-red-800'}`}>
                                Consent Forms
                              </span>
                            </div>
                            {child.consent_form ? (
                              <div className="space-y-1 ml-6">
                                <p className="text-sm text-green-700 flex items-center gap-2">
                                  <Shield className="h-3 w-3" />
                                  <span className="font-medium">Liability Waiver:</span> Signed
                                </p>
                                <p className="text-sm text-green-700 flex items-center gap-2">
                                  <Camera className="h-3 w-3" />
                                  <span className="font-medium">Photo/Video:</span>{' '}
                                  {child.consent_form.social_media_consent ? 'Allowed' : 'Not Allowed'}
                                </p>
                                <p className="text-xs text-green-600 mt-2">
                                  Signed by {child.consent_form.parent_name_signed} on{' '}
                                  {new Date(child.consent_form.signed_at).toLocaleDateString()}
                                </p>
                                {child.consent_form && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-7 mt-2"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openContractPopup(child)
                                    }}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Contract
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-red-700 ml-6">
                                No consent forms signed. Parent needs to sign before attending classes.
                              </p>
                            )}
                          </div>

                          {/* Cooking Experience */}
                          {child.has_cooking_experience && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <ChefHat className="h-4 w-4 text-green-700" />
                                <span className="text-sm font-semibold text-green-800">Has Cooking Experience</span>
                              </div>
                              {child.cooking_experience_details && (
                                <p className="text-sm text-green-700 ml-6">{child.cooking_experience_details}</p>
                              )}
                            </div>
                          )}

                          {/* Health & Safety Information */}
                          {(child.allergies || child.dietary_restrictions || child.medical_conditions || child.emergency_medications) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-yellow-700" />
                                <span className="text-sm font-semibold text-yellow-800">Health & Safety Information</span>
                              </div>
                              <div className="space-y-1 ml-6">
                                {child.allergies && (
                                  <p className="text-sm text-yellow-800">
                                    <span className="font-medium">Allergies:</span> {child.allergies}
                                  </p>
                                )}
                                {child.dietary_restrictions && (
                                  <p className="text-sm text-yellow-800">
                                    <span className="font-medium">Dietary Restrictions:</span> {child.dietary_restrictions}
                                  </p>
                                )}
                                {child.medical_conditions && (
                                  <p className="text-sm text-yellow-800">
                                    <span className="font-medium">Medical Conditions:</span> {child.medical_conditions}
                                  </p>
                                )}
                                {child.emergency_medications && (
                                  <p className="text-sm text-yellow-800">
                                    <span className="font-medium">Emergency Medications:</span> {child.emergency_medications}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Popup Dialog */}
      <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consent Form Contract</DialogTitle>
          </DialogHeader>
          {selectedChild && selectedChild.consent_form && (
            <div className="space-y-6">
              {/* Child Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedChild.child_full_name}</h3>
                {selectedChild.child_preferred_name && (
                  <p className="text-sm text-muted-foreground">Preferred Name: {selectedChild.child_preferred_name}</p>
                )}
                <p className="text-sm text-muted-foreground">Age: {selectedChild.child_age} years old</p>
              </div>

              {/* Social Media Consent Section */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  {SOCIAL_MEDIA_CONSENT_TEXT.title}
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>{SOCIAL_MEDIA_CONSENT_TEXT.intro}</p>
                  <p>{SOCIAL_MEDIA_CONSENT_TEXT.understanding}</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    {SOCIAL_MEDIA_CONSENT_TEXT.uses.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
                  </ul>
                  <p className="font-medium text-foreground">{SOCIAL_MEDIA_CONSENT_TEXT.privacy}</p>
                  <p>{SOCIAL_MEDIA_CONSENT_TEXT.revocation}</p>
                </div>
                <div className={`mt-4 p-3 rounded-lg ${selectedChild.consent_form.social_media_consent ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className={`text-sm font-semibold ${selectedChild.consent_form.social_media_consent ? 'text-green-700' : 'text-gray-700'}`}>
                    Social Media Consent: {selectedChild.consent_form.social_media_consent ? 'GRANTED' : 'NOT GRANTED'}
                  </p>
                </div>
              </div>

              {/* Liability Waiver Section */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  {LIABILITY_CONSENT_TEXT.title}
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>{LIABILITY_CONSENT_TEXT.intro}</p>
                  <p>{LIABILITY_CONSENT_TEXT.risks}</p>
                  <p>{LIABILITY_CONSENT_TEXT.release}</p>
                  <p className="font-medium text-foreground">{LIABILITY_CONSENT_TEXT.disclosure}</p>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm font-semibold text-green-700">
                    Liability Waiver: ACCEPTED
                  </p>
                </div>
              </div>

              {/* Signature Section */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Signature</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Parent/Guardian Name:</span> <span className="font-medium">{selectedChild.consent_form.parent_name_signed}</span></p>
                  <p><span className="text-muted-foreground">Date Signed:</span> <span className="font-medium">{new Date(selectedChild.consent_form.signed_at).toLocaleDateString()}</span></p>
                </div>
                {selectedChild.consent_form.signature_url && (
                  <div className="mt-4 p-4 bg-white border rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Signature:</p>
                    <img
                      src={selectedChild.consent_form.signature_url}
                      alt="Signature"
                      className="max-h-24 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsContractOpen(false)}
            >
              Close
            </Button>
            {selectedChild && selectedChild.consent_form && (
              <Button
                onClick={() => generatePDF(selectedChild)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
