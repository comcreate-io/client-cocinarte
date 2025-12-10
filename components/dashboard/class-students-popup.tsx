'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clase } from '@/lib/types/clases'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, Users, Mail, Phone, DollarSign, User, Loader2, AlertCircle, Send, CheckCircle2 } from 'lucide-react'

interface EnrolledStudent {
  id: string
  booking_id: string
  child_name: string
  parent_name: string
  email: string
  phone?: string
  booking_status: string
  payment_status: string
  payment_amount: number
  booking_date: string
  notes?: string
}

interface ClassStudentsPopupProps {
  clase: Clase | null
  isOpen: boolean
  onClose: () => void
}

// Email templates
const EMAIL_TEMPLATES = {
  reminder: {
    name: 'Class Reminder',
    subject: 'Reminder: Upcoming Cooking Class',
    message: `This is a friendly reminder about the upcoming cooking class.\n\nPlease remember to:\n• Arrive 10 minutes early\n• Wear comfortable clothes\n• Bring any required supplies if mentioned\n\nWe're excited to see you there!\n\nBest regards,\nCocinarte Team`
  },
  update: {
    name: 'Important Update',
    subject: 'Important Update About Your Class',
    message: `We have an important update regarding your upcoming cooking class.\n\n[Please add your update here]\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nCocinarte Team`
  },
  supplies: {
    name: 'Supplies Needed',
    subject: 'Supplies Needed for Class',
    message: `Please bring the following supplies to the upcoming class:\n\n• [Item 1]\n• [Item 2]\n• [Item 3]\n\nIf you have any questions about the supplies, please let us know.\n\nBest regards,\nCocinarte Team`
  },
  custom: {
    name: 'Custom Message',
    subject: '',
    message: ''
  }
}

export function ClassStudentsPopup({ clase, isOpen, onClose }: ClassStudentsPopupProps) {
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Email form state
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && clase) {
      fetchEnrolledStudents()
    }
  }, [isOpen, clase])

  const fetchEnrolledStudents = async () => {
    if (!clase) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Fetch bookings with student information for this class
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_status,
          payment_status,
          payment_amount,
          booking_date,
          notes,
          student_id,
          students (
            id,
            parent_name,
            child_name,
            email,
            phone
          )
        `)
        .eq('class_id', clase.id)
        .order('booking_date', { ascending: true })

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError)
        setError('Failed to load enrolled students')
        return
      }

      // Transform the data
      const enrolledStudents: EnrolledStudent[] = (bookings || []).map((booking: any) => ({
        id: booking.students?.id || booking.student_id,
        booking_id: booking.id,
        child_name: booking.students?.child_name || 'Unknown',
        parent_name: booking.students?.parent_name || 'Unknown',
        email: booking.students?.email || '',
        phone: booking.students?.phone || '',
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        payment_amount: booking.payment_amount,
        booking_date: booking.booking_date,
        notes: booking.notes
      }))

      setStudents(enrolledStudents)
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while loading students')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey)
    const template = EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES]
    if (template) {
      setEmailSubject(template.subject)
      setEmailMessage(template.message)
    }
  }

  const handleSendEmail = async () => {
    if (!clase || !emailSubject.trim() || !emailMessage.trim()) {
      setEmailError('Please fill in both subject and message')
      return
    }

    setSendingEmail(true)
    setEmailError(null)
    setEmailSuccess(null)

    try {
      const response = await fetch('/api/classes/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: clase.id,
          subject: emailSubject,
          message: emailMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails')
      }

      setEmailSuccess(`Successfully sent ${data.stats.sent} email(s)!`)

      // Reset form after success
      setTimeout(() => {
        setShowEmailForm(false)
        setEmailSubject('')
        setEmailMessage('')
        setSelectedTemplate('')
        setEmailSuccess(null)
      }, 3000)
    } catch (err: any) {
      console.error('Error sending emails:', err)
      setEmailError(err.message || 'Failed to send emails')
    } finally {
      setSendingEmail(false)
    }
  }

  const resetEmailForm = () => {
    setShowEmailForm(false)
    setEmailSubject('')
    setEmailMessage('')
    setSelectedTemplate('')
    setEmailError(null)
    setEmailSuccess(null)
  }

  if (!clase) return null

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'held':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const confirmedStudents = students.filter(s => s.booking_status === 'confirmed' || s.booking_status === 'pending')
  const cancelledStudents = students.filter(s => s.booking_status === 'cancelled')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
          <DialogTitle className="text-xl">{clase.title}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-4 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(clase.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(clase.time)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {confirmedStudents.length}/{clase.maxStudents} enrolled
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              ${clase.price}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading students...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-red-500">
              <AlertCircle className="h-6 w-6 mr-2" />
              {error}
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No students enrolled yet</p>
              <p className="text-sm">Students will appear here once they book this class.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Confirmed/Pending Students */}
              {confirmedStudents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                      {confirmedStudents.length} Enrolled
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {confirmedStudents.map((student, index) => (
                      <Card key={student.booking_id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground font-medium">#{index + 1}</span>
                                <h4 className="font-semibold text-lg">{student.child_name}</h4>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>Parent: {student.parent_name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <a href={`mailto:${student.email}`} className="text-blue-600 hover:underline">
                                  {student.email}
                                </a>
                              </div>
                              {student.phone && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <a href={`tel:${student.phone}`} className="text-blue-600 hover:underline">
                                    {student.phone}
                                  </a>
                                </div>
                              )}
                              {student.notes && (
                                <p className="text-sm text-muted-foreground mt-2 italic">
                                  Note: {student.notes}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                              <Badge className={getStatusColor(student.booking_status)}>
                                {student.booking_status}
                              </Badge>
                              <Badge className={getPaymentStatusColor(student.payment_status)}>
                                {student.payment_status === 'held' ? 'Payment Held' : student.payment_status}
                              </Badge>
                              <span className="text-sm font-medium">
                                ${student.payment_amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancelled Students */}
              {cancelledStudents.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">
                      {cancelledStudents.length} Cancelled
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {cancelledStudents.map((student) => (
                      <Card key={student.booking_id} className="border-l-4 border-l-red-300 opacity-60">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="font-semibold">{student.child_name}</h4>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>Parent: {student.parent_name}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{student.email}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                              <Badge className={getStatusColor(student.booking_status)}>
                                {student.booking_status}
                              </Badge>
                              <Badge className={getPaymentStatusColor(student.payment_status)}>
                                {student.payment_status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="border-t pt-4 mt-6">
                <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">
                      Total Enrolled: <strong>{confirmedStudents.length}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Available Spots: <strong>{clase.maxStudents - confirmedStudents.length}</strong>
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    Expected Revenue: <strong className="text-green-600">
                      ${(confirmedStudents.reduce((sum, s) => sum + s.payment_amount, 0)).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t p-4 flex justify-between items-center">
          <div>
            {confirmedStudents.length > 0 && (
              <Button
                variant="default"
                onClick={() => setShowEmailForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email to All
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Email Form Dialog - Separate Popup */}
      <Dialog open={showEmailForm} onOpenChange={resetEmailForm}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Email to All Enrolled Students
            </DialogTitle>
            <DialogDescription>
              Send an email to all {confirmedStudents.length} enrolled student{confirmedStudents.length !== 1 ? 's' : ''} in {clase.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label htmlFor="template">Email Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or write custom..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                    <SelectItem key={key} value={key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Each email will be personalized with the student's name.
              </p>
            </div>

            {/* Error/Success Messages */}
            {emailError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {emailError}
              </div>
            )}
            {emailSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle2 className="h-4 w-4" />
                {emailSuccess}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={resetEmailForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to {confirmedStudents.length} Student{confirmedStudents.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
