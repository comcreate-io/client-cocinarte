'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Calendar, Users, Clock, DollarSign } from 'lucide-react'
import { Clase } from '@/lib/types/clases'
import { ClassForm } from './class-form'
import { ClassActions } from './class-actions'
import { ClassStudentsPopup } from './class-students-popup'
import { createClient } from '@/lib/supabase/client'

interface ClassesClientProps {
  initialClases: Clase[]
}

export function ClassesClient({ initialClases }: ClassesClientProps) {
  const [clases, setClases] = useState<Clase[]>(initialClases)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<Clase | null>(null)
  const [enrolledCounts, setEnrolledCounts] = useState<Record<string, number>>({})
  const [cancelledClasses, setCancelledClasses] = useState<Set<string>>(new Set())
  const [chargedClasses, setChargedClasses] = useState<Set<string>>(new Set())
  const [selectedClass, setSelectedClass] = useState<Clase | null>(null)
  const [showStudentsPopup, setShowStudentsPopup] = useState(false)

  // Fetch enrolled counts from bookings and check for cancelled classes
  useEffect(() => {
    const fetchEnrolledCounts = async () => {
      try {
        const supabase = createClient()
        const classIds = clases.map(c => c.id)
        
        if (classIds.length === 0) return
        
        // Fetch bookings for all classes (including extra_children for proper counting)
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('class_id, booking_status, payment_status, extra_children')
          .in('class_id', classIds)

        if (error) {
          console.error('Error fetching enrolled counts:', error)
          return
        }

        // Count enrolled bookings per class (confirmed or pending)
        // Include extra_children in the count for proper capacity tracking
        const counts: Record<string, number> = {}
        const classBookings: Record<string, any[]> = {}

        bookings?.forEach((booking: any) => {
          const classId = booking.class_id

          // Group bookings by class
          if (!classBookings[classId]) {
            classBookings[classId] = []
          }
          classBookings[classId].push(booking)

          // Count only confirmed/pending as enrolled
          // Include extra children in the count (1 booking + extra children = total children)
          if (booking.booking_status === 'confirmed' || booking.booking_status === 'pending') {
            const childCount = 1 + (booking.extra_children || 0)
            counts[classId] = (counts[classId] || 0) + childCount
          }
        })
        
        setEnrolledCounts(counts)
        
        // Check for cancelled classes - if all bookings for a class are cancelled, mark it as cancelled
        const cancelled = new Set<string>()
        Object.entries(classBookings).forEach(([classId, bookingsForClass]) => {
          // If there are bookings and ALL of them are cancelled, the class is cancelled
          if (bookingsForClass.length > 0 && bookingsForClass.every(b => b.booking_status === 'cancelled')) {
            cancelled.add(classId)
          }
        })
        
        setCancelledClasses(cancelled)
        
        // Check for charged classes - if any bookings have payment_status 'completed', the class has been charged
        const charged = new Set<string>()
        Object.entries(classBookings).forEach(([classId, bookingsForClass]) => {
          // If there are bookings and at least one has payment_status 'completed', the class has been charged
          if (bookingsForClass.length > 0 && bookingsForClass.some(b => b.payment_status === 'completed')) {
            charged.add(classId)
          }
        })
        
        setChargedClasses(charged)
        console.log('Enrolled counts loaded:', counts)
        console.log('Cancelled classes:', Array.from(cancelled))
        console.log('Charged classes:', Array.from(charged))
      } catch (error) {
        console.error('Error in fetchEnrolledCounts:', error)
      }
    }
    
    fetchEnrolledCounts()
  }, [clases])

  // Helper function to format date - parse YYYY-MM-DD format correctly
  const formatDate = (dateString: string) => {
    // Parse YYYY-MM-DD format directly to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
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
    // Check if class is cancelled first
    if (cancelledClasses.has(clase.id)) {
      return { status: 'cancelled', label: 'Cancelled', variant: 'destructive' as const }
    }
    
    // Check if class has been charged (payments processed)
    if (chargedClasses.has(clase.id)) {
      return { status: 'charged', label: 'Payment Processed', variant: 'default' as const }
    }
    
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

  const handleClassClick = (clase: Clase) => {
    setSelectedClass(clase)
    setShowStudentsPopup(true)
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
                      const todayString = today.toISOString().split('T')[0]
                      return clases.filter(clase => clase.date >= todayString).length
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
                    {Object.values(enrolledCounts).reduce((sum, count) => sum + count, 0)}
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
              <Card
                key={clase.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-blue-300 min-h-[380px] flex flex-col"
                onClick={() => handleClassClick(clase)}
              >
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
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    {clase.description && (
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {clase.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{enrolledCounts[clase.id] ?? 0}/{clase.maxStudents} enrolled ({clase.minStudents}-{clase.maxStudents} capacity)</span>
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
                  </div>

                  <div onClick={(e) => e.stopPropagation()} className="mt-auto pt-4">
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

      {/* Students Popup */}
      <ClassStudentsPopup
        clase={selectedClass}
        isOpen={showStudentsPopup}
        onClose={() => {
          setShowStudentsPopup(false)
          setSelectedClass(null)
        }}
      />
    </>
  )
}
