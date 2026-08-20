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

export interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onConfirm: () => void
  isDeleting?: boolean
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title = 'Confirm Deletion',
  description = 'Are you sure you want to proceed with this deletion? This operation cannot be undone and will permanently remove records from the system database.',
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
          <AlertDialogTitle className="text-lg font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground">
            {description}
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
              'Confirm Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteConfirmationDialog
