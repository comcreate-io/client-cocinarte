'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  User,
  Heart,
  Car,
  Camera,
  ChefHat,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { Child, ChildData } from '@/types/student'
import { ParentsClientService } from '@/lib/supabase/parents-client'

interface ChildrenManagementProps {
  parentId: string
  onUpdate?: () => void
}

export default function ChildrenManagement({ parentId, onUpdate }: ChildrenManagementProps) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)

  // Form state
  const [formData, setFormData] = useState<ChildData>({
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

  const parentsService = new ParentsClientService()

  useEffect(() => {
    loadChildren()
  }, [parentId])

  const loadChildren = async () => {
    try {
      setLoading(true)
      const childrenData = await parentsService.getChildren(parentId)
      setChildren(childrenData)
    } catch (err: any) {
      setError('Failed to load children')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
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
    setEditingChild(null)
    setError('')
    setSuccess('')
  }

  const handleAddChild = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditChild = (child: Child) => {
    setEditingChild(child)
    setFormData({
      child_full_name: child.child_full_name,
      child_age: child.child_age,
      child_preferred_name: child.child_preferred_name || '',
      has_cooking_experience: child.has_cooking_experience,
      cooking_experience_details: child.cooking_experience_details || '',
      allergies: child.allergies || '',
      dietary_restrictions: child.dietary_restrictions || '',
      medical_conditions: child.medical_conditions || '',
      emergency_medications: child.emergency_medications || '',
      additional_notes: child.additional_notes || '',
      authorized_pickup_persons: child.authorized_pickup_persons || '',
      custody_restrictions: child.custody_restrictions || '',
      media_permission: child.media_permission,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteChild = async (childId: string, childName: string) => {
    if (!confirm(`Are you sure you want to remove ${childName}? This action cannot be undone.`)) {
      return
    }

    try {
      setSaving(true)
      await parentsService.deleteChild(childId)
      setSuccess('Child removed successfully')
      await loadChildren()
      if (onUpdate) onUpdate()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError('Failed to delete child')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    if (!formData.child_full_name || !formData.child_age) {
      setError('Child name and age are required')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (editingChild) {
        // Update existing child
        await parentsService.updateChild(editingChild.id, formData)
        setSuccess('Child updated successfully')
      } else {
        // Add new child
        await parentsService.addChild(parentId, formData)
        setSuccess('Child added successfully')
      }

      await loadChildren()
      if (onUpdate) onUpdate()
      setIsDialogOpen(false)
      resetForm()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save child')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const renderChildCard = (child: Child) => (
    <Card key={child.id} className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-cocinarte-orange/10 p-3 rounded-full">
              <User className="h-6 w-6 text-cocinarte-orange" />
            </div>
            <div>
              <CardTitle className="text-lg">{child.child_full_name}</CardTitle>
              <CardDescription>
                Age: {child.child_age}
                {child.child_preferred_name && ` • Prefers: ${child.child_preferred_name}`}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditChild(child)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteChild(child.id, child.child_full_name)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Experience Badge */}
        {child.has_cooking_experience && (
          <Badge className="bg-green-100 text-green-800">
            <ChefHat className="h-3 w-3 mr-1" />
            Has cooking experience
          </Badge>
        )}

        {/* Health & Safety Info */}
        {(child.allergies || child.dietary_restrictions || child.medical_conditions) && (
          <div className="space-y-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 font-semibold">
              <Heart className="h-4 w-4" />
              Health & Safety Information
            </div>
            {child.allergies && (
              <div className="text-sm">
                <span className="font-semibold">Allergies:</span> {child.allergies}
              </div>
            )}
            {child.dietary_restrictions && (
              <div className="text-sm">
                <span className="font-semibold">Dietary:</span> {child.dietary_restrictions}
              </div>
            )}
            {child.medical_conditions && (
              <div className="text-sm">
                <span className="font-semibold">Medical:</span> {child.medical_conditions}
              </div>
            )}
            {child.emergency_medications && (
              <div className="text-sm text-red-600">
                <span className="font-semibold">Emergency Meds:</span> {child.emergency_medications}
              </div>
            )}
          </div>
        )}

        {/* Pick-up Info */}
        {child.authorized_pickup_persons && (
          <div className="text-sm">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Car className="h-4 w-4 text-blue-600" />
              Authorized Pickup
            </div>
            <p className="text-gray-700">{child.authorized_pickup_persons}</p>
          </div>
        )}

        {/* Media Permission */}
        <div className="flex items-center gap-2 text-sm">
          <Camera className="h-4 w-4 text-purple-600" />
          <span className={child.media_permission ? 'text-green-600' : 'text-gray-600'}>
            {child.media_permission ? 'Media permission granted' : 'No media permission'}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-cocinarte-navy">My Children</h2>
          <p className="text-gray-600">Manage your children's information</p>
        </div>
        <Button
          onClick={handleAddChild}
          className="bg-cocinarte-orange hover:bg-cocinarte-red"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Child
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Children List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cocinarte-orange"></div>
          <span className="ml-2 text-gray-600">Loading children...</span>
        </div>
      ) : children.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Children Added Yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first child to start booking cooking classes!
            </p>
            <Button
              onClick={handleAddChild}
              className="bg-cocinarte-orange hover:bg-cocinarte-red"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.map(child => renderChildCard(child))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingChild ? 'Edit Child' : 'Add New Child'}
            </DialogTitle>
            <DialogDescription>
              {editingChild
                ? 'Update your child\'s information'
                : 'Add a new child to your account'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-cocinarte-orange" />
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="child_full_name">Full Name *</Label>
                  <Input
                    id="child_full_name"
                    value={formData.child_full_name}
                    onChange={(e) => setFormData({ ...formData, child_full_name: e.target.value })}
                    placeholder="Child's full legal name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="child_age">Age *</Label>
                  <Input
                    id="child_age"
                    type="number"
                    min="1"
                    max="18"
                    value={formData.child_age || ''}
                    onChange={(e) => setFormData({ ...formData, child_age: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="child_preferred_name">Preferred Name/Nickname</Label>
                <Input
                  id="child_preferred_name"
                  value={formData.child_preferred_name}
                  onChange={(e) => setFormData({ ...formData, child_preferred_name: e.target.value })}
                  placeholder="What should we call them?"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_cooking_experience"
                  checked={formData.has_cooking_experience}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, has_cooking_experience: checked as boolean })
                  }
                />
                <Label htmlFor="has_cooking_experience" className="cursor-pointer">
                  Has previous cooking experience
                </Label>
              </div>

              {formData.has_cooking_experience && (
                <div className="space-y-2">
                  <Label htmlFor="cooking_experience_details">Experience Details</Label>
                  <Textarea
                    id="cooking_experience_details"
                    value={formData.cooking_experience_details}
                    onChange={(e) => setFormData({ ...formData, cooking_experience_details: e.target.value })}
                    placeholder="Describe their cooking experience..."
                  />
                </div>
              )}
            </div>

            {/* Health & Safety */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Health & Safety
              </h3>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies or Food Sensitivities</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="List all allergies..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                <Input
                  id="dietary_restrictions"
                  value={formData.dietary_restrictions}
                  onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                  placeholder="e.g., Vegetarian, vegan, no pork..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical_conditions">Medical Conditions</Label>
                <Textarea
                  id="medical_conditions"
                  value={formData.medical_conditions}
                  onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                  placeholder="Any medical conditions we should know about..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_medications">Emergency Medications</Label>
                <Input
                  id="emergency_medications"
                  value={formData.emergency_medications}
                  onChange={(e) => setFormData({ ...formData, emergency_medications: e.target.value })}
                  placeholder="e.g., EpiPen, inhaler..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_notes">Additional Notes</Label>
                <Textarea
                  id="additional_notes"
                  value={formData.additional_notes}
                  onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                  placeholder="Anything else we should know..."
                />
              </div>
            </div>

            {/* Pick-up & Media */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-500" />
                Pick-up & Media
              </h3>

              <div className="space-y-2">
                <Label htmlFor="authorized_pickup_persons">Authorized Pickup Persons</Label>
                <Textarea
                  id="authorized_pickup_persons"
                  value={formData.authorized_pickup_persons}
                  onChange={(e) => setFormData({ ...formData, authorized_pickup_persons: e.target.value })}
                  placeholder="List all people authorized to pick up this child..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custody_restrictions">Custody Restrictions</Label>
                <Textarea
                  id="custody_restrictions"
                  value={formData.custody_restrictions}
                  onChange={(e) => setFormData({ ...formData, custody_restrictions: e.target.value })}
                  placeholder="Any custody restrictions or safety notes..."
                />
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox
                  id="media_permission"
                  checked={formData.media_permission}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, media_permission: checked as boolean })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="media_permission" className="cursor-pointer font-medium">
                    Media Permission
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow photos/videos for class portfolios, social media, and promotional materials
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                resetForm()
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-cocinarte-orange hover:bg-cocinarte-red"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                editingChild ? 'Update Child' : 'Add Child'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
