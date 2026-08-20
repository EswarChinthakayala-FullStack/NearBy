import React, { useState, forwardRef } from 'react'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  error?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    return (
      <div className="relative flex items-center">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'pr-10 rounded-sm border-border/70 bg-background/80 focus:bg-background text-sm transition-all focus-visible:outline-2 focus-visible:outline-emerald-500',
            error && 'border-destructive focus-visible:ring-destructive/30',
            className
          )}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="absolute right-3 p-1 rounded-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <Icon name={showPassword ? 'eye-off' : 'eye'} size="sm" />
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
