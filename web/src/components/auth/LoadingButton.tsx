import React from 'react'
import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/common/Icon'

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm'
  isLoading?: boolean
  loadingText?: string
  icon?: IconName
  iconPosition?: 'left' | 'right'
  className?: string
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  isLoading = false,
  loadingText = 'Processing...',
  icon,
  iconPosition = 'right',
  disabled,
  className = '',
  variant,
  size,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      className={`rounded-sm font-semibold transition-all ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Icon name="loading" size="xs" spinning />
          <span>{loadingText}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon && iconPosition === 'left' && <Icon name={icon} size="xs" />}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <Icon name={icon} size="xs" />}
        </span>
      )}
    </Button>
  )
}

export default LoadingButton
