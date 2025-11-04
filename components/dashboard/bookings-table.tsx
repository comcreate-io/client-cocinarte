'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookingWithDetails } from '@/lib/types/bookings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, DollarSign, User, AlertCircle, CheckCircle, XCircle, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BookingDetailsPopup } from './booking-details-popup'
import { EditBookingPopup } from './edit-booking-popup'

interface BookingsTableProps {
  userId: string
}

export function BookingsTable({ userId }: BookingsTableProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  
  // Popup states
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [showDetailsPopup, setShowDetailsPopup] = useState(false)
  const [showEditPopup, setShowEditPopup] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [userId])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          class:clases(
            id,
            title,
            date,
            time,
            price,
            classDuration
          ),
          student:students(
            id,
            parent_name,
            child_name,
            email
          )
        `)
        .eq('user_id', userId)
        .order('booking_date', { ascending: false })

      if (error) {
        throw new Error(`Error fetching bookings: ${error.message}`)
      }

      setBookings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.class?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.student?.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.student?.parent_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter
    const matchesPayment = paymentFilter === 'all' || booking.payment_status === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: newStatus })
        .eq('id', bookingId)

      if (error) {
        throw new Error(`Error updating booking: ${error.message}`)
      }

      // Refresh the bookings list
      await fetchBookings()
    } catch (err) {
      console.error('Error updating booking status:', err)
    }
  }

  const handlePaymentUpdate = async (bookingId: string, newPaymentStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: newPaymentStatus })
        .eq('id', bookingId)

      if (error) {
        throw new Error(`Error updating payment status: ${error.message}`)
      }

      // Refresh the bookings list
      await fetchBookings()
    } catch (err) {
      console.error('Error updating payment status:', err)
    }
  }

  // Popup handlers
  const handleViewDetails = (booking: BookingWithDetails) => {
    setSelectedBooking(booking)
    setShowDetailsPopup(true)
  }

  const handleEditBooking = (booking: BookingWithDetails) => {
    setSelectedBooking(booking)
    setShowEditPopup(true)
  }

  const handleCloseDetails = () => {
    setShowDetailsPopup(false)
    setSelectedBooking(null)
  }

  const handleCloseEdit = () => {
    setShowEditPopup(false)
    setSelectedBooking(null)
  }

  const handleSaveEdit = async () => {
    await fetchBookings() // Refresh the data
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings Table</CardTitle>
          <CardDescription>Loading your cooking class bookings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bookings Table</CardTitle>
          <CardDescription>Error loading bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>All Bookings</CardTitle>
        <CardDescription>Manage your cooking class bookings and payments</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search bookings, students, or classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[180px]">
              <DollarSign className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Class & Student</TableHead>
                <TableHead className="min-w-[150px]">Date & Time</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Payment</TableHead>
                <TableHead className="min-w-[100px]">Amount</TableHead>
                <TableHead className="min-w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No bookings found</p>
                      <p className="text-sm text-gray-400">
                        {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'No bookings have been made yet'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    <TableCell className="min-w-[200px]">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{booking.class?.title || 'Unknown Class'}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          {booking.student?.child_name || 'Unknown Student'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Parent: {booking.student?.parent_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {booking.class?.date && format(new Date(booking.class.date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {booking.class?.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Badge className={`${getStatusColor(booking.booking_status)} text-xs`}>
                        {getStatusIcon(booking.booking_status)}
                        <span className="ml-1 capitalize">{booking.booking_status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Badge className={`${getPaymentStatusColor(booking.payment_status)} text-xs`}>
                        {booking.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                        <span className="font-medium text-sm">${booking.payment_amount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Booking
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {booking.booking_status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirm Booking
                            </DropdownMenuItem>
                          )}
                          {booking.booking_status === 'confirmed' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Booking
                            </DropdownMenuItem>
                          )}
                          {booking.payment_status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => handlePaymentUpdate(booking.id, 'completed')}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </CardContent>
    </Card>

    {/* Popup Components */}
    <BookingDetailsPopup
      booking={selectedBooking}
      isOpen={showDetailsPopup}
      onClose={handleCloseDetails}
      onEdit={() => {
        handleCloseDetails() // Close details popup
        handleEditBooking(selectedBooking!) // Open edit popup
      }}
    />
    
    <EditBookingPopup
      booking={selectedBooking}
      isOpen={showEditPopup}
      onClose={handleCloseEdit}
      onSave={handleSaveEdit}
    />
    </>
  )
}
