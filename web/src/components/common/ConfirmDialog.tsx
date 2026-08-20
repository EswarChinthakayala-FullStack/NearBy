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
import { Icon, type IconName } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  variant?: ConfirmDialogVariant
  iconName?: IconName
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  isLoading?: boolean
  className?: string
}

const VARIANT_CONFIG: Record<
  ConfirmDialogVariant,
  { defaultIcon: IconName; iconBg: string; buttonBg: string }
> = {
  danger: {
    defaultIcon: 'delete',
    iconBg: 'bg-destructive/10 text-destructive',
    buttonBg: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    defaultIcon: 'warning',
    iconBg: 'bg-amber-500/10 text-amber-500',
    buttonBg: 'bg-amber-600 text-white hover:bg-amber-700',
  },
  info: {
    defaultIcon: 'info',
    iconBg: 'bg-blue-500/10 text-blue-500',
    buttonBg: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  success: {
    defaultIcon: 'check',
    iconBg: 'bg-emerald-500/10 text-emerald-500',
    buttonBg: 'bg-emerald-600 text-white hover:bg-emerald-700',
  },
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  variant = 'danger',
  iconName,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  className = '',
}) => {
  const config = VARIANT_CONFIG[variant]
  const iconToRender = iconName || config.defaultIcon

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn('rounded-sm border-border/80 bg-background/95 backdrop-blur-lg shadow-xl max-w-md', className)}>
        <AlertDialogHeader className="space-y-2">
          <div className={cn('w-12 h-12 rounded-sm flex items-center justify-center mb-1', config.iconBg)}>
            <Icon name={iconToRender} size="lg" />
          </div>

          <AlertDialogTitle className="text-lg font-bold text-foreground tracking-tight">
            {title}
          </AlertDialogTitle>

          {description && (
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="pt-3">
          <AlertDialogCancel disabled={isLoading} className="rounded-sm text-xs font-semibold h-9">
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className={cn('rounded-sm text-xs font-semibold h-9 px-5 transition-all shadow-sm', config.buttonBg)}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Icon name="loading" size="xs" spinning />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDialog
