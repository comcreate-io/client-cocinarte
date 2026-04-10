'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Clase, CreateClaseData } from '@/lib/types/clases'
import { ClasesClientService } from '@/lib/supabase/clases-client'

interface ClassFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingClass?: Clase | null
}

export function ClassForm({ isOpen, onClose, onSuccess, editingClass }: ClassFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Initialize form data based on editing class
  const getInitialFormData = (): CreateClaseData => {
    if (editingClass) {
      return {
        title: editingClass.title,
        description: editingClass.description || '',
        date: editingClass.date,
        time: editingClass.time,
        minStudents: editingClass.minStudents,
        maxStudents: editingClass.maxStudents,
        enrolled: editingClass.enrolled || 0,
        price: editingClass.price,
        classDuration: editingClass.classDuration,
        class_type: editingClass.class_type,
        image_url: editingClass.image_url,
        late_cancel_refund_type: editingClass.late_cancel_refund_type ?? null,
        late_cancel_refund_value: editingClass.late_cancel_refund_value ?? null,
        min_age: editingClass.min_age ?? null,
        max_age: editingClass.max_age ?? null,
        requires_parent: editingClass.requires_parent ?? false,
        reserved_spots: editingClass.reserved_spots ?? 0,
      }
    }
    return {
      title: '',
      description: '',
      date: '',
      time: '',
      minStudents: 1,
      maxStudents: 8,
      price: 0,
      classDuration: 60,
      class_type: undefined,
      image_url: null,
      late_cancel_refund_type: null,
      late_cancel_refund_value: null,
      min_age: null,
      max_age: null,
      requires_parent: false,
      reserved_spots: 0,
    }
  }

  const [formData, setFormData] = useState<CreateClaseData>(getInitialFormData())

  // Reset form when editing class changes
  useEffect(() => {
    const initialData = getInitialFormData()
    console.log('Setting form data:', initialData)
    setFormData(initialData)
    setImageFile(null)
    setUploadError(null)
  }, [editingClass])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const clasesService = new ClasesClientService()
      
      if (editingClass) {
        await clasesService.updateClase({
          id: editingClass.id,
          ...formData
        })
      } else {
        // For new classes, explicitly set enrolled to 0
        const createData = {
          ...formData,
          enrolled: 0
        }
        await clasesService.createClase(createData)
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving class:', error)
      alert('Error saving class. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof CreateClaseData, value: string | number | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = async (file: File | null, previewUrl: string | null) => {
    setImageFile(file)
    setUploadError(null)

    if (!file || !previewUrl) {
      // Image was removed
      setFormData(prev => ({
        ...prev,
        image_url: null
      }))
      return
    }

    // Upload to Cloudinary
    setIsUploadingImage(true)
    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: previewUrl, // Send base64 data
          folder: 'coci',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      
      // Store the Cloudinary URL
      setFormData(prev => ({
        ...prev,
        image_url: data.url
      }))
    } catch (error) {
      console.error('Image upload error:', error)
      setUploadError('Failed to upload image. Please try again.')
      setImageFile(null)
      setFormData(prev => ({
        ...prev,
        image_url: null
      }))
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle>
            {editingClass ? 'Edit Cooking Class' : 'Create New Cooking Class'}
          </DialogTitle>
          <DialogDescription>
            {editingClass 
              ? 'Update the details of your cooking class.' 
              : 'Add a new cooking class to your schedule.'
            }
          </DialogDescription>
        </DialogHeader>
        <form key={editingClass?.id || 'new'} onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Class Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Kids Cooking Basics"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe what students will learn..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Class Image</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={handleImageChange}
                maxSizeMB={5}
                disabled={isUploadingImage}
              />
              {isUploadingImage && (
                <p className="text-sm text-muted-foreground">
                  Uploading image to Cloudinary...
                </p>
              )}
              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="class_type">Class Type</Label>
              <Select
                value={formData.class_type || ''}
                onValueChange={(value) => handleChange('class_type', value as 'Mini Chefcitos' | 'Chefcitos Together' | 'Cocina Creativa' | 'Private Event')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mini Chefcitos">Mini Chefcitos</SelectItem>
                  <SelectItem value="Chefcitos Together">Chefcitos Together</SelectItem>
                  <SelectItem value="Cocina Creativa">Cocina Creativa</SelectItem>
                  <SelectItem value="Private Event">Private Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={`grid gap-4 ${editingClass ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <div className="grid gap-2">
                <Label htmlFor="minStudents">Min Students</Label>
                <Input
                  id="minStudents"
                  type="number"
                  min="1"
                  value={formData.minStudents || ''}
                  onChange={(e) => handleChange('minStudents', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  min="1"
                  value={formData.maxStudents || ''}
                  onChange={(e) => handleChange('maxStudents', parseInt(e.target.value) || 8)}
                  required
                />
              </div>
              {/* Only show enrolled field when editing */}
              {editingClass && (
                <div className="grid gap-2">
                  <Label htmlFor="enrolled">Students Enrolled</Label>
                  <Input
                    id="enrolled"
                    type="number"
                    min="0"
                    max={formData.maxStudents}
                    value={formData.enrolled ?? 0}
                    onChange={(e) => {
                      const next = e.target.value === '' ? 0 : Number(e.target.value)
                      handleChange('enrolled', isNaN(next) ? 0 : next)
                    }}
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reserved_spots">Reserved Spots</Label>
              <Input
                id="reserved_spots"
                type="number"
                min="0"
                value={formData.reserved_spots ?? 0}
                onChange={(e) => {
                  const next = e.target.value === '' ? 0 : Number(e.target.value)
                  handleChange('reserved_spots', isNaN(next) ? 0 : next)
                }}
              />
              <p className="text-xs text-muted-foreground">
                Reduces available spots on the public calendar without needing real bookings. Use for private events or to make a class appear full.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_age">Min Age (years)</Label>
                <Input
                  id="min_age"
                  type="number"
                  min="1"
                  max="18"
                  value={formData.min_age ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseInt(e.target.value)
                    handleChange('min_age', value as any)
                  }}
                  placeholder="Optional"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_age">Max Age (years)</Label>
                <Input
                  id="max_age"
                  type="number"
                  min="1"
                  max="18"
                  value={formData.max_age ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseInt(e.target.value)
                    handleChange('max_age', value as any)
                  }}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
              <Checkbox
                id="requires_parent"
                checked={formData.requires_parent ?? false}
                onCheckedChange={(checked) =>
                  handleChange('requires_parent', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="requires_parent" className="cursor-pointer font-medium text-blue-900">
                  Parent Participation Required
                </Label>
                <p className="text-sm text-blue-700">
                  Check this if a parent/guardian must attend and participate in the class with the child
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="classDuration">Duration (minutes)</Label>
                <Input
                  id="classDuration"
                  type="number"
                  min="15"
                  value={formData.classDuration || ''}
                  onChange={(e) => handleChange('classDuration', parseInt(e.target.value) || 60)}
                  required
                />
              </div>
            </div>

            {/* Late Cancellation Policy */}
            <div className="grid gap-2 border-t pt-4">
              <Label className="text-sm font-semibold">Late Cancellation Policy</Label>
              <p className="text-xs text-muted-foreground">
                Refund for cancellations made less than 48 hours before class. Cancellations 48+ hours before always get a full refund.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="late_cancel_refund_type">Type</Label>
                  <Select
                    value={formData.late_cancel_refund_type || 'none'}
                    onValueChange={(value) => {
                      if (value === 'none') {
                        setFormData(prev => ({
                          ...prev,
                          late_cancel_refund_type: null,
                          late_cancel_refund_value: null,
                        }))
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          late_cancel_refund_type: value as 'percentage' | 'fixed',
                          late_cancel_refund_value: prev.late_cancel_refund_value ?? 0,
                        }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No late refund" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No late refund</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.late_cancel_refund_type && (
                  <div className="grid gap-2">
                    <Label htmlFor="late_cancel_refund_value">
                      {formData.late_cancel_refund_type === 'percentage' ? 'Refund %' : 'Refund $'}
                    </Label>
                    <Input
                      id="late_cancel_refund_value"
                      type="number"
                      step={formData.late_cancel_refund_type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      max={formData.late_cancel_refund_type === 'percentage' ? '100' : undefined}
                      value={formData.late_cancel_refund_value ?? 0}
                      onChange={(e) => handleChange('late_cancel_refund_value', parseFloat(e.target.value) || 0)}
                      placeholder={formData.late_cancel_refund_type === 'percentage' ? '0-100' : '0.00'}
                    />
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 p-6 pt-4 border-t bg-background">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploadingImage}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isUploadingImage}>
              {isUploadingImage ? 'Uploading Image...' : isLoading ? 'Saving...' : (editingClass ? 'Update Class' : 'Create Class')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
