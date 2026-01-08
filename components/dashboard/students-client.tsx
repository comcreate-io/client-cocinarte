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
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Stats - Stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-auto">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search families..."
            className="pl-9 w-full sm:w-64"
          />
        </div>
        <div className="text-sm text-muted-foreground text-center sm:text-right">
          {filtered.length} {filtered.length === 1 ? 'family' : 'families'} • {filtered.reduce((sum, p) => sum + (p.children?.length || 0), 0)} children
        </div>
      </div>

      {/* Cards Grid - Single column on mobile */}
      <div className="grid gap-3 sm:gap-4 w-full grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
        {filtered.map((parent) => (
          <Card
            key={parent.id}
            className="cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => openDetails(parent)}
          >
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Parent Info */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base sm:text-lg leading-tight">{parent.parent_guardian_names}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{parent.parent_email}</p>
                    {parent.parent_phone && (
                      <p className="text-xs sm:text-sm text-muted-foreground">{parent.parent_phone}</p>
                    )}
                  </div>
                </div>

                {/* Children Info */}
                {parent.children && parent.children.length > 0 && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                      <Baby className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Children ({parent.children.length})
                    </div>
                    <div className="space-y-2">
                      {parent.children.map((child) => (
                        <div key={child.id} className="bg-muted/50 p-2 sm:p-2.5 rounded">
                          {/* Child name and age row */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                            <span className="font-medium">{child.child_full_name}</span>
                            {child.child_preferred_name && (
                              <span className="text-muted-foreground text-xs">({child.child_preferred_name})</span>
                            )}
                            <span className="text-muted-foreground text-xs">• Age {child.child_age}</span>
                          </div>
                          {/* Badges row - wrap on mobile */}
                          <div className="flex gap-1 flex-wrap mt-1.5">
                            {child.consent_form?.liability_consent ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                Waiver
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                No Waiver
                              </Badge>
                            )}
                            {child.consent_form?.social_media_consent && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Badge>
                            )}
                            {child.has_cooking_experience && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <ChefHat className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                Exp
                              </Badge>
                            )}
                            {(child.allergies || child.dietary_restrictions) && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                                <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
        <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Family Details</DialogTitle>
          </DialogHeader>
          {selectedParent && (
            <div className="space-y-4 sm:space-y-6">
              {/* Parent Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Parent/Guardian
                </h3>
                <div className="grid gap-2 sm:gap-3 bg-muted/50 p-3 sm:p-4 rounded-lg">
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Name</div>
                    <div className="font-medium text-sm sm:text-base">{selectedParent.parent_guardian_names}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Email</div>
                    <div className="font-medium text-sm sm:text-base break-all">{selectedParent.parent_email}</div>
                  </div>
                  {selectedParent.parent_phone && (
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium text-sm sm:text-base">{selectedParent.parent_phone}</div>
                    </div>
                  )}
                  {selectedParent.address && (
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Address</div>
                      <div className="font-medium text-sm sm:text-base">{selectedParent.address}</div>
                    </div>
                  )}
                </div>

                {/* Contact buttons - full width on mobile */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {selectedParent.parent_phone && (
                    <>
                      <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                        <a href={`tel:${selectedParent.parent_phone}`} aria-label="Call">
                          <Phone className="h-4 w-4 mr-1.5" /> Call
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                        <a href={`sms:${selectedParent.parent_phone}`} aria-label="SMS">
                          <Phone className="h-4 w-4 mr-1.5" /> SMS
                        </a>
                      </Button>
                    </>
                  )}
                  <Button asChild size="sm" className={`${selectedParent.parent_phone ? 'col-span-2' : 'col-span-2'} sm:w-auto`}>
                    <a href={`mailto:${selectedParent.parent_email}`} aria-label="Email">
                      <Mail className="h-4 w-4 mr-1.5" /> Email
                    </a>
                  </Button>
                </div>
              </div>

              {/* Children Information */}
              {selectedParent.children && selectedParent.children.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                    <Baby className="h-4 w-4 sm:h-5 sm:w-5" />
                    Children ({selectedParent.children.length})
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {selectedParent.children.map((child) => (
                      <Card key={child.id} className="border-2">
                        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-4 space-y-2 sm:space-y-3">
                          <div>
                            <h4 className="font-semibold text-base sm:text-lg">{child.child_full_name}</h4>
                            {child.child_preferred_name && (
                              <p className="text-xs sm:text-sm text-muted-foreground">Preferred: {child.child_preferred_name}</p>
                            )}
                            <p className="text-xs sm:text-sm text-muted-foreground">Age: {child.child_age}</p>
                          </div>

                          {/* Consent Forms Status */}
                          <div className={`border rounded-lg p-2.5 sm:p-3 ${child.consent_form ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                              <FileCheck className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${child.consent_form ? 'text-green-700' : 'text-red-700'}`} />
                              <span className={`text-xs sm:text-sm font-semibold ${child.consent_form ? 'text-green-800' : 'text-red-800'}`}>
                                Consent Forms
                              </span>
                            </div>
                            {child.consent_form ? (
                              <div className="space-y-1 ml-5 sm:ml-6">
                                <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1.5 sm:gap-2">
                                  <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                                  <span className="font-medium">Waiver:</span> Signed
                                </p>
                                <p className="text-xs sm:text-sm text-green-700 flex items-center gap-1.5 sm:gap-2">
                                  <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                                  <span className="font-medium">Photo:</span>{' '}
                                  {child.consent_form.social_media_consent ? 'Yes' : 'No'}
                                </p>
                                <p className="text-[10px] sm:text-xs text-green-600 mt-1.5 sm:mt-2">
                                  Signed by {child.consent_form.parent_name_signed} on{' '}
                                  {new Date(child.consent_form.signed_at).toLocaleDateString()}
                                </p>
                                {child.consent_form && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-[10px] sm:text-xs h-6 sm:h-7 mt-1.5 sm:mt-2 px-2 sm:px-3"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openContractPopup(child)
                                    }}
                                  >
                                    <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    View Contract
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs sm:text-sm text-red-700 ml-5 sm:ml-6">
                                No consent signed yet.
                              </p>
                            )}
                          </div>

                          {/* Cooking Experience */}
                          {child.has_cooking_experience && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <ChefHat className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-700" />
                                <span className="text-xs sm:text-sm font-semibold text-green-800">Has Cooking Experience</span>
                              </div>
                              {child.cooking_experience_details && (
                                <p className="text-xs sm:text-sm text-green-700 ml-5 sm:ml-6">{child.cooking_experience_details}</p>
                              )}
                            </div>
                          )}

                          {/* Health & Safety Information */}
                          {(child.allergies || child.dietary_restrictions || child.medical_conditions || child.emergency_medications) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-700" />
                                <span className="text-xs sm:text-sm font-semibold text-yellow-800">Health & Safety</span>
                              </div>
                              <div className="space-y-1 ml-5 sm:ml-6 text-xs sm:text-sm text-yellow-800">
                                {child.allergies && (
                                  <p><span className="font-medium">Allergies:</span> {child.allergies}</p>
                                )}
                                {child.dietary_restrictions && (
                                  <p><span className="font-medium">Diet:</span> {child.dietary_restrictions}</p>
                                )}
                                {child.medical_conditions && (
                                  <p><span className="font-medium">Medical:</span> {child.medical_conditions}</p>
                                )}
                                {child.emergency_medications && (
                                  <p><span className="font-medium">Meds:</span> {child.emergency_medications}</p>
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
          <DialogFooter className="pt-2 sm:pt-0">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="w-full sm:w-auto">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contract Popup Dialog */}
      <Dialog open={isContractOpen} onOpenChange={setIsContractOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Consent Form Contract</DialogTitle>
          </DialogHeader>
          {selectedChild && selectedChild.consent_form && (
            <div className="space-y-4 sm:space-y-6">
              {/* Child Info */}
              <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">{selectedChild.child_full_name}</h3>
                {selectedChild.child_preferred_name && (
                  <p className="text-xs sm:text-sm text-muted-foreground">Preferred: {selectedChild.child_preferred_name}</p>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground">Age: {selectedChild.child_age}</p>
              </div>

              {/* Social Media Consent Section */}
              <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <span className="leading-tight">{SOCIAL_MEDIA_CONSENT_TEXT.title}</span>
                </h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <p>{SOCIAL_MEDIA_CONSENT_TEXT.intro}</p>
                  <p>{SOCIAL_MEDIA_CONSENT_TEXT.understanding}</p>
                  <ul className="list-disc list-inside ml-1 sm:ml-2 space-y-1">
                    {SOCIAL_MEDIA_CONSENT_TEXT.uses.map((use, index) => (
                      <li key={index}>{use}</li>
                    ))}
                  </ul>
                  <p className="font-medium text-foreground">{SOCIAL_MEDIA_CONSENT_TEXT.privacy}</p>
                  <p>{SOCIAL_MEDIA_CONSENT_TEXT.revocation}</p>
                </div>
                <div className={`mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg ${selectedChild.consent_form.social_media_consent ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className={`text-xs sm:text-sm font-semibold ${selectedChild.consent_form.social_media_consent ? 'text-green-700' : 'text-gray-700'}`}>
                    Social Media: {selectedChild.consent_form.social_media_consent ? 'GRANTED' : 'NOT GRANTED'}
                  </p>
                </div>
              </div>

              {/* Liability Waiver Section */}
              <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  <span className="leading-tight">{LIABILITY_CONSENT_TEXT.title}</span>
                </h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <p>{LIABILITY_CONSENT_TEXT.intro}</p>
                  <p>{LIABILITY_CONSENT_TEXT.risks}</p>
                  <p>{LIABILITY_CONSENT_TEXT.release}</p>
                  <p className="font-medium text-foreground">{LIABILITY_CONSENT_TEXT.disclosure}</p>
                </div>
                <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs sm:text-sm font-semibold text-green-700">
                    Liability Waiver: ACCEPTED
                  </p>
                </div>
              </div>

              {/* Signature Section */}
              <div className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-sm sm:text-lg mb-2 sm:mb-3">Signature</h3>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <p><span className="text-muted-foreground">Parent:</span> <span className="font-medium">{selectedChild.consent_form.parent_name_signed}</span></p>
                  <p><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(selectedChild.consent_form.signed_at).toLocaleDateString()}</span></p>
                </div>
                {selectedChild.consent_form.signature_url && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white border rounded-lg">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">Signature:</p>
                    <img
                      src={selectedChild.consent_form.signature_url}
                      alt="Signature"
                      className="max-h-16 sm:max-h-24 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0">
            <Button
              variant="outline"
              onClick={() => setIsContractOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Close
            </Button>
            {selectedChild && selectedChild.consent_form && (
              <Button
                onClick={() => generatePDF(selectedChild)}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2"
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
