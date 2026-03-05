'use client'

import { useState } from 'react'
import { BookingWithDetails } from '@/lib/types/bookings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, DollarSign, User, Users, Mail, Phone, MapPin, ChefHat } from 'lucide-react'
import { format } from 'date-fns'

interface BookingDetailsPopupProps {
  booking: BookingWithDetails | null
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
}

export function BookingDetailsPopup({ booking, isOpen, onClose, onEdit }: BookingDetailsPopupProps) {
  if (!booking) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
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
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Complete information about this cooking class booking
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-4">
          {/* Class Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <ChefHat className="h-4 w-4 mr-2" />
                Class Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <h3 className="font-semibold text-lg">{booking.class?.title || 'Unknown Class'}</h3>
                <p className="text-muted-foreground">Cooking Class</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {booking.class?.date && format(new Date(booking.class.date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">Date</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{booking.class?.time}</p>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">${booking.class?.price}</p>
                  <p className="text-xs text-muted-foreground">Class Price</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{booking.class?.classDuration} minutes</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <User className="h-4 w-4 mr-2" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <h3 className="font-semibold">{booking.student?.child_name || 'Unknown Student'}</h3>
                <p className="text-muted-foreground">Student Name</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">{booking.student?.parent_name}</p>
                <p className="text-xs text-muted-foreground">Parent/Guardian</p>
              </div>

              {booking.accompanying_parent_name && (
                <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-900">Accompanying Parent</p>
                  </div>
                  <p className="text-sm font-medium text-blue-800">{booking.accompanying_parent_name}</p>
                  <p className="text-xs text-blue-600 mt-1">Will attend and participate in the class</p>
                </div>
              )}

              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{booking.student?.email}</p>
                  <p className="text-xs text-muted-foreground">Contact Email</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Booking Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Booking Status</span>
                  <Badge className={getStatusColor(booking.booking_status)}>
                    {booking.booking_status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Status</span>
                  <Badge className={getPaymentStatusColor(booking.payment_status)}>
                    {booking.payment_status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="text-sm font-semibold">${booking.payment_amount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Method</span>
                  <span className="text-sm">{booking.payment_method}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium">Booking Date</span>
                <span className="text-sm">
                  {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {booking.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm">{booking.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => {
              onClose() // Close the details popup
              onEdit?.() // Open the edit popup
            }}>
              Edit Booking
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
