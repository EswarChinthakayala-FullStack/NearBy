import React from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/common/Icon'
import PasswordInput from '@/components/auth/PasswordInput'
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator'
import OfflineBanner from '@/components/common/OfflineBanner'
import { useChangePassword } from '@/hooks/useAuthHooks'
import { toast } from 'sonner'

const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'Password cannot exceed 100 characters'),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'New passwords do not match',
    path: ['confirm_password'],
  })

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>

export interface PasswordChangeFormProps {
  onSuccess?: () => void
  className?: string
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSuccess,
  className = '',
}) => {
  const changePasswordMutation = useChangePassword()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const newPasswordValue = useWatch({ control, name: 'new_password' }) || ''

  const onSubmit = (data: PasswordChangeFormData) => {
    if (!navigator.onLine) {
      toast.error('You are currently offline. Please reconnect to update your password.')
      return
    }

    changePasswordMutation.mutate(
      {
        current_password: data.current_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          reset({
            current_password: '',
            new_password: '',
            confirm_password: '',
          })
          if (onSuccess) onSuccess()
        },
      }
    )
  }

  const isLoading = changePasswordMutation.isPending || isSubmitting

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className={`p-6 md:p-8 rounded-sm border border-border/80 bg-card shadow-xs space-y-5 w-full ${className}`}
    >
      <OfflineBanner />

      <div className="space-y-1 border-b border-border/60 pb-3">
        <h4 className="text-base font-bold text-foreground">Change Account Password</h4>
        <p className="text-xs text-muted-foreground">
          Update your password to keep your account secure. Use at least 8 characters with numbers or symbols.
        </p>
      </div>

      {/* Current Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="pwd-current" className="text-xs font-bold text-foreground">
          Current Password <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="current_password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              id="pwd-current"
              placeholder="Enter your current password"
              autoComplete="current-password"
              disabled={isLoading}
              error={!!errors.current_password}
            />
          )}
        />
        {errors.current_password && (
          <p className="text-xs text-destructive font-medium mt-1">{errors.current_password.message}</p>
        )}
      </div>

      {/* New Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="pwd-new" className="text-xs font-bold text-foreground">
          New Password <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="new_password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              id="pwd-new"
              placeholder="Enter your new strong password"
              autoComplete="new-password"
              disabled={isLoading}
              error={!!errors.new_password}
            />
          )}
        />
        {errors.new_password && (
          <p className="text-xs text-destructive font-medium mt-1">{errors.new_password.message}</p>
        )}

        {/* Live Password Strength Indicator */}
        <PasswordStrengthIndicator password={newPasswordValue} />
      </div>

      {/* Confirm New Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="pwd-confirm" className="text-xs font-bold text-foreground">
          Confirm New Password <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="confirm_password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              id="pwd-confirm"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              disabled={isLoading}
              error={!!errors.confirm_password}
            />
          )}
        />
        {errors.confirm_password && (
          <p className="text-xs text-destructive font-medium mt-1">{errors.confirm_password.message}</p>
        )}
      </div>

      {/* Action Submit Control */}
      <div className="flex items-center justify-end pt-4 border-t border-border/60">
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-sm bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold h-9 px-5 shadow-sm hover:shadow transition-all text-xs"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Icon name="loading" size="xs" spinning />
              Updating Password...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Icon name="check" size="xs" />
              Update Password
            </span>
          )}
        </Button>
      </div>
    </motion.form>
  )
}

export default PasswordChangeForm
