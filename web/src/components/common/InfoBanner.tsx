import React, { type ReactNode } from 'react'
import { Icon, type IconName } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

export type InfoBannerVariant = 'info' | 'success' | 'warning' | 'error'

export interface InfoBannerProps {
  title?: string
  children: ReactNode
  variant?: InfoBannerVariant
  iconName?: IconName
  className?: string
}

const VARIANT_CONFIG: Record<
  InfoBannerVariant,
  { defaultIcon: IconName; styles: string }
> = {
  info: {
    defaultIcon: 'info',
    styles: 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200',
  },
  success: {
    defaultIcon: 'success',
    styles: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200',
  },
  warning: {
    defaultIcon: 'warning',
    styles: 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200',
  },
  error: {
    defaultIcon: 'error',
    styles: 'bg-destructive/10 border-destructive/30 text-destructive',
  },
}

export const InfoBanner: React.FC<InfoBannerProps> = ({
  title,
  children,
  variant = 'info',
  iconName,
  className = '',
}) => {
  const config = VARIANT_CONFIG[variant]
  const iconToRender = iconName || config.defaultIcon

  return (
    <div
      className={cn(
        'p-4 rounded-sm border flex items-start gap-3 text-xs leading-relaxed font-medium shadow-sm',
        config.styles,
        className
      )}
      role="alert"
    >
      <Icon name={iconToRender} size="sm" className="mt-0.5 shrink-0" />
      <div className="space-y-0.5">
        {title && <h6 className="font-bold text-foreground">{title}</h6>}
        <div>{children}</div>
      </div>
    </div>
  )
}

export default InfoBanner
