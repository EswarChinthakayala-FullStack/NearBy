import React from 'react'
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
import { Icon } from '@/components/common/Icon'

export interface DeleteReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

export const DeleteReviewDialog: React.FC<DeleteReviewDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-sm border-border/80 bg-background/95 backdrop-blur-lg">
        <AlertDialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-sm bg-destructive/10 text-destructive flex items-center justify-center mb-1">
            <Icon name="delete" size="md" />
          </div>
          <AlertDialogTitle className="text-lg font-bold">Delete Review</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            Are you sure you want to permanently delete your review? This action cannot be undone and will update the location's total rating metrics.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-2">
          <AlertDialogCancel disabled={isDeleting} className="rounded-sm text-xs font-semibold">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className="rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <Icon name="loading" size="xs" spinning />
                Deleting...
              </span>
            ) : (
              'Delete Review'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteReviewDialog
