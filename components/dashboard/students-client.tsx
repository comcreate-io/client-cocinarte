"use client"

import { useMemo, useState, type JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Mail, Phone, Search, Baby, AlertCircle, ChefHat } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
                          <div className="flex gap-1">
                            {child.has_cooking_experience && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                <ChefHat className="h-3 w-3 mr-1" />
                                Experience
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
    </div>
  )
}
