'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, XCircle, CheckCircle } from 'lucide-react'
import { Clase } from '@/lib/types/clases'
import { ClasesClientService } from '@/lib/supabase/clases-client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface CancellationResult {
  totalBookings: number
  emailsSent: number
  paymentsCanceled: number
  giftCardsRefunded: number
}

interface ClassActionsProps {
  clase: Clase
  onEdit: (clase: Clase) => void
  onDelete: () => void
  onCancel?: () => void
  isCancelled?: boolean
  enrolledCount?: number
}

export function ClassActions({ clase, onEdit, onDelete, onCancel, isCancelled, enrolledCount = 0 }: ClassActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [cancellationResult, setCancellationResult] = useState<CancellationResult | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const clasesService = new ClasesClientService()
      await clasesService.deleteClase(clase.id)
      onDelete()
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Error deleting class. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleCancelClass = async () => {
    setIsCancelling(true)
    try {
      const response = await fetch('/api/cancel-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: clase.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel class')
      }

      const result = await response.json()
      console.log('Class cancellation result:', result)

      // Store the result and show success dialog
      setCancellationResult({
        totalBookings: result.summary?.totalBookings || 0,
        emailsSent: result.summary?.emailsSent || 0,
        paymentsCanceled: result.summary?.paymentsCanceled || 0,
        giftCardsRefunded: result.summary?.giftCardsRefunded || 0,
      })
      setShowCancelDialog(false)
      setShowSuccessDialog(true)
    } catch (error) {
      console.error('Error cancelling class:', error)
      alert('Error cancelling class. Please try again.')
      setShowCancelDialog(false)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccessDialog(false)
    setCancellationResult(null)
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <>
      <div className="flex space-x-2 pt-2 flex-wrap gap-y-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(clase)}>
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        {isCancelled ? (
          <div className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Cancel Class
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the cooking class "{clase.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this class?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the class "{clase.title}".
              {enrolledCount > 0 && (
                <>
                  <br /><br />
                  <strong className="text-orange-600">
                    {enrolledCount} student{enrolledCount !== 1 ? 's' : ''} enrolled
                  </strong>
                  <br />
                  All enrolled students will be notified via email and any held payments will be released.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Class</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelClass}
              disabled={isCancelling}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Class'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              Class Cancelled Successfully
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>The class "{clase.title}" has been cancelled.</p>
                {cancellationResult && (
                  <div className="bg-gray-50 p-3 rounded-md space-y-1 text-sm">
                    <p><strong>Summary:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>{cancellationResult.totalBookings} booking{cancellationResult.totalBookings !== 1 ? 's' : ''} cancelled</li>
                      <li>{cancellationResult.emailsSent} cancellation email{cancellationResult.emailsSent !== 1 ? 's' : ''} sent</li>
                      {cancellationResult.paymentsCanceled > 0 && (
                        <li>{cancellationResult.paymentsCanceled} held payment{cancellationResult.paymentsCanceled !== 1 ? 's' : ''} released</li>
                      )}
                      {cancellationResult.giftCardsRefunded > 0 && (
                        <li>{cancellationResult.giftCardsRefunded} gift card refund{cancellationResult.giftCardsRefunded !== 1 ? 's' : ''} processed</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSuccessClose}
              className="bg-green-600 hover:bg-green-700"
            >
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
