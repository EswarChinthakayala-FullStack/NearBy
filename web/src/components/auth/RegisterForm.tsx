import React, { useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/common/Icon'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { PasswordInput } from './PasswordInput'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { LoadingButton } from './LoadingButton'
import { registerSchema, type RegisterSchemaType } from '@/lib/validators'
import { useRegister } from '@/hooks/useAuth'
import { cardShake } from '@/lib/motion-variants'
import { toast } from 'sonner'

export interface RegisterFormProps {
  onSuccess?: () => void
  className?: string
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, className = '' }) => {
  const navigate = useNavigate()
  const [shouldShake, setShouldShake] = useState(false)

  const registerMutation = useRegister()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    },
  })

  const passwordValue = useWatch({ control, name: 'password' }) || ''

  const onSubmit = (data: RegisterSchemaType) => {
    if (!navigator.onLine) {
      toast.error('No internet connection. Please reconnect and try again.')
      return
    }

    registerMutation.mutate(
      {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      },
      {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess()
          } else {
            navigate('/login')
          }
        },
        onError: () => {
          setShouldShake(true)
          setTimeout(() => setShouldShake(false), 500)
        },
      }
    )
  }

  const isLoading = registerMutation.isPending || isSubmitting

  return (
    <motion.form
      variants={cardShake}
      initial="initial"
      animate={shouldShake ? 'shake' : 'initial'}
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-3.5 ${className}`}
    >
      <OfflineBanner className="mb-1" />

      {/* Row 1: Full Name & Email Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Full Name Input */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-bold text-foreground">
            <Icon name="profile" size="xs" className="text-muted-foreground" />
            <Label htmlFor="register-name" className="text-xs font-bold text-foreground">
              Full Name
            </Label>
          </div>
          <Controller
            name="full_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="register-name"
                type="text"
                placeholder="Sarah Jenkins"
                autoFocus
                disabled={isLoading}
                className="rounded-sm border-border/70 bg-background/80 focus:bg-background text-xs h-9 px-3"
              />
            )}
          />
          {errors.full_name && (
            <p className="text-[11px] text-destructive font-medium mt-0.5">{errors.full_name.message}</p>
          )}
        </div>

        {/* Email Input */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-bold text-foreground">
            <Icon name="mail" size="xs" className="text-muted-foreground" />
            <Label htmlFor="register-email" className="text-xs font-bold text-foreground">
              Email Address
            </Label>
          </div>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="register-email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                disabled={isLoading}
                className="rounded-sm border-border/70 bg-background/80 focus:bg-background text-xs h-9 px-3"
              />
            )}
          />
          {errors.email && (
            <p className="text-[11px] text-destructive font-medium mt-0.5">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Phone Number Input (Optional) */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-xs font-bold text-foreground">
          <Icon name="location" size="xs" className="text-muted-foreground" />
          <Label htmlFor="register-phone" className="text-xs font-bold text-foreground">
            Phone Number <span className="text-[10px] text-muted-foreground font-mono font-normal">(Optional)</span>
          </Label>
        </div>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="register-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              disabled={isLoading}
              className="rounded-sm border-border/70 bg-background/80 focus:bg-background text-xs h-9 px-3"
            />
          )}
        />
        {errors.phone && (
          <p className="text-[11px] text-destructive font-medium mt-0.5">{errors.phone.message}</p>
        )}
      </div>

      {/* Row 2: Password & Confirm Password Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Password Input */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-bold text-foreground">
            <Icon name="lock" size="xs" className="text-muted-foreground" />
            <Label htmlFor="register-password" className="text-xs font-bold text-foreground">
              Password
            </Label>
          </div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                id="register-password"
                placeholder="Min. 8 chars"
                autoComplete="new-password"
                disabled={isLoading}
                error={!!errors.password}
                className="h-9 text-xs"
              />
            )}
          />
          {errors.password && (
            <p className="text-[11px] text-destructive font-medium mt-0.5">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-bold text-foreground">
            <Icon name="lock" size="xs" className="text-muted-foreground" />
            <Label htmlFor="register-confirm-password" className="text-xs font-bold text-foreground">
              Confirm Password
            </Label>
          </div>
          <Controller
            name="confirm_password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                id="register-confirm-password"
                placeholder="Re-enter password"
                autoComplete="new-password"
                disabled={isLoading}
                error={!!errors.confirm_password}
                className="h-9 text-xs"
              />
            )}
          />
          {errors.confirm_password && (
            <p className="text-[11px] text-destructive font-medium mt-0.5">{errors.confirm_password.message}</p>
          )}
        </div>
      </div>

      <PasswordStrengthIndicator password={passwordValue} />

      {/* Terms Notice */}
      <p className="text-[10px] text-muted-foreground leading-tight pt-0.5">
        By registering, you agree to Nearby's Terms of Service and Privacy Policy.
      </p>

      {/* Submit Loading Action Button */}
      <LoadingButton
        type="submit"
        isLoading={isLoading}
        loadingText="Creating Account..."
        icon="sparkles"
        iconPosition="right"
        className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground h-9 text-xs shadow-md hover:shadow-lg mt-1"
      >
        Create Account
      </LoadingButton>
    </motion.form>
  )
}

export default RegisterForm
