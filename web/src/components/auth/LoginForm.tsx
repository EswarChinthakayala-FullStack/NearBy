import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Icon } from '@/components/common/Icon'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { PasswordInput } from './PasswordInput'
import { LoadingButton } from './LoadingButton'
import { loginSchema, type LoginSchemaType } from '@/lib/validators'
import { useLogin } from '@/hooks/useAuth'
import { cardShake } from '@/lib/motion-variants'
import { toast } from 'sonner'

export interface LoginFormProps {
  onSuccess?: () => void
  className?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, className = '' }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [rememberMe, setRememberMe] = useState(true)
  const [shouldShake, setShouldShake] = useState(false)

  const loginMutation = useLogin()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (data: LoginSchemaType) => {
    if (!navigator.onLine) {
      toast.error('No internet connection. Please reconnect and try again.')
      return
    }

    loginMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: ({ user }) => {
          if (onSuccess) {
            onSuccess()
          } else {
            const redirectParam = searchParams.get('redirect')
            if (redirectParam && redirectParam !== '/' && redirectParam !== '/login') {
              navigate(redirectParam, { replace: true })
            } else if (user.role === 'admin') {
              navigate('/admin', { replace: true })
            } else {
              navigate('/user/dashboard', { replace: true })
            }
          }
        },
        onError: () => {
          // Trigger Card Shake animation on authentication error
          setShouldShake(true)
          setTimeout(() => setShouldShake(false), 500)
        },
      }
    )
  }

  const isLoading = loginMutation.isPending || isSubmitting

  return (
    <motion.form
      variants={cardShake}
      initial="initial"
      animate={shouldShake ? 'shake' : 'initial'}
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 ${className}`}
    >
      <OfflineBanner className="mb-2" />

      {/* Email Input Field */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Icon name="mail" size="xs" className="text-muted-foreground" />
          <Label htmlFor="login-email" className="text-xs font-bold text-foreground">
            Email Address
          </Label>
        </div>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="login-email"
              type="email"
              placeholder="name@example.com"
              autoFocus
              autoComplete="email"
              disabled={isLoading}
              className="rounded-sm border-border/70 bg-background/80 focus:bg-background text-sm"
            />
          )}
        />
        {errors.email && (
          <p className="text-xs text-destructive font-medium mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Input Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Icon name="lock" size="xs" className="text-muted-foreground" />
            <Label htmlFor="login-password" className="text-xs font-bold text-foreground">
              Password
            </Label>
          </div>
          <Link
            to="/forgot-password"
            className="text-xs text-primary font-semibold hover:underline"
            tabIndex={-1}
          >
            Forgot password?
          </Link>
        </div>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordInput
              {...field}
              id="login-password"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              error={!!errors.password}
            />
          )}
        />
        {errors.password && (
          <p className="text-xs text-destructive font-medium mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center space-x-2 pt-1">
        <Checkbox
          id="remember-me"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(!!checked)}
          disabled={isLoading}
        />
        <Label htmlFor="remember-me" className="text-xs text-muted-foreground font-medium cursor-pointer">
          Remember me on this device
        </Label>
      </div>

      {/* Submit Loading Action Button */}
      <LoadingButton
        type="submit"
        isLoading={isLoading}
        loadingText="Signing in..."
        icon="arrow-right"
        iconPosition="right"
        className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground h-10 text-sm shadow-md hover:shadow-lg mt-2"
      >
        Sign In to Nearby
      </LoadingButton>
    </motion.form>
  )
}

export default LoginForm
