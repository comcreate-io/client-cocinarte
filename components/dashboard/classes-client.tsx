'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Calendar, Users, Clock, DollarSign } from 'lucide-react'
import { Clase } from '@/lib/types/clases'
import { ClassForm } from './class-form'
import { ClassActions } from './class-actions'

interface ClassesClientProps {
  initialClases: Clase[]
}

export function ClassesClient({ initialClases }: ClassesClientProps) {
  const [clases, setClases] = useState<Clase[]>(initialClases)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<Clase | null>(null)

  // Debug: Print all classes to console
  console.log('=== ClassesClient Component Loaded ===')
  console.log('Total classes loaded:', initialClases.length)
  console.log('All classes (detailed):', initialClases)
  console.log('All classes (JSON):', JSON.stringify(initialClases, null, 2))
  console.log('=======================================')

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Helper function to format time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Helper function to get class status
  const getClassStatus = (clase: Clase) => {
    const classDate = new Date(`${clase.date}T${clase.time}`)
    const now = new Date()
    const diffTime = classDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'completed', label: null, variant: null }
    if (diffDays === 0) return { status: 'today', label: 'Today', variant: 'default' as const }
    if (diffDays <= 7) return { status: 'upcoming', label: 'Upcoming', variant: 'secondary' as const }
    return { status: 'scheduled', label: 'Scheduled', variant: 'secondary' as const }
  }

  const handleCreateClass = () => {
    setEditingClass(null)
    setShowForm(true)
  }

  const handleEditClass = (clase: Clase) => {
    setEditingClass(clase)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    // Refresh the page to get updated data
    window.location.reload()
  }

  const handleDeleteSuccess = () => {
    // Refresh the page to get updated data
    window.location.reload()
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cocinarte Classes</h1>
          <p className="text-muted-foreground">
            Manage your Cocinarte cooking classes and workshops.
          </p>
        </div>
        <Button onClick={handleCreateClass}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Cooking Class
        </Button>
      </div>

      {/* Statistics */}
      {clases.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-blue-700" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Classes</p>
                  <p className="text-2xl font-bold text-blue-900">{clases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-700" />
                <div>
                  <p className="text-sm font-medium text-green-700">Upcoming</p>
                  <p className="text-2xl font-bold text-green-900">
                    {(() => {
                      const today = new Date()
                      const todayString = today.toISOString().split('T')[0] // Get today in YYYY-MM-DD format
                      
                      const upcomingClasses = clases.filter(clase => {
                        const isUpcoming = clase.date >= todayString
                        console.log(`Class: ${clase.title}, Date: ${clase.date}, Today: ${todayString}, IsUpcoming: ${isUpcoming}`)
                        return isUpcoming
                      })
                      
                      console.log(`Total classes: ${clases.length}, Upcoming: ${upcomingClasses.length}`)
                      return upcomingClasses.length
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-700" />
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Enrolled</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {clases.reduce((sum, clase) => sum + (clase.enrolled ?? 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-orange-700" />
                <div>
                  <p className="text-sm font-medium text-orange-700">Avg Price</p>
                  <p className="text-2xl font-bold text-orange-900">
                    ${(clases.reduce((sum, clase) => sum + clase.price, 0) / clases.length).toFixed(0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Classes Grid */}
      {clases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't created any cooking classes yet. Create your first class to get started!
            </p>
            <Button onClick={handleCreateClass}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clases.map((clase) => {
            const status = getClassStatus(clase)
            // Parse date properly - handle both date string and time string formats
            const dateStr = clase.date.includes('T') ? clase.date.split('T')[0] : clase.date
            const timeStr = clase.time.includes(':') ? clase.time.split(':').slice(0, 2).join(':') : clase.time
            const classDate = new Date(`${dateStr}T${timeStr}`)
            const isToday = new Date().toDateString() === classDate.toDateString()
            
            return (
              <Card key={clase.id}>
                <CardHeader>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="h-[50px]">{clase.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">   
                       {status.label && <Badge variant={status.variant}>{status.label}</Badge>}
                    </div>
                  </div>
                  <CardDescription>
                    {formatDate(clase.date)} at {formatTime(clase.time)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clase.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 h-[50px]">
                        {clase.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{clase.enrolled ?? 0}/{clase.maxStudents} enrolled ({clase.minStudents}-{clase.maxStudents} capacity)</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>${clase.price.toFixed(2)} per student</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {clase.classDuration} minutes</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {isToday ? 'Today' : 
                         status.status === 'completed' ? 'Completed' : 
                         `In ${Math.ceil((classDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
                      </span>
                    </div>
                    
                    <ClassActions 
                      clase={clase}
                      onEdit={handleEditClass}
                      onDelete={handleDeleteSuccess}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Form Modal */}
      <ClassForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
        editingClass={editingClass}
      />
    </>
  )
}
