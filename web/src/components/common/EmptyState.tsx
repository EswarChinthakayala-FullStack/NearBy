import React from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { GridPattern } from './svg/GridPattern'

export type EmptyStateVariant =
  | 'no-results'
  | 'no-favorites'
  | 'no-reviews'
  | 'no-places'
  | 'offline'
  | 'access-denied'
  | 'generic'

export interface EmptyStateProps {
  variant?: EmptyStateVariant
  iconName?: IconName
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  showBackgroundPattern?: boolean
  className?: string
}

const VARIANT_ICON_MAP: Record<EmptyStateVariant, IconName> = {
  'no-results': 'search',
  'no-favorites': 'favorite',
  'no-reviews': 'ratings',
  'no-places': 'places',
  offline: 'offline',
  'access-denied': 'shield',
  generic: 'empty',
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'generic',
  iconName,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  showBackgroundPattern = true,
  className = '',
}) => {
  const iconToRender = iconName || VARIANT_ICON_MAP[variant] || 'empty'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative p-8 md:p-12 rounded-sm border border-dashed border-border/80 bg-card/40 backdrop-blur-sm text-center flex flex-col items-center justify-center space-y-4 my-4 overflow-hidden ${className}`}
    >
      {/* Background SVG Grid Pattern */}
      {showBackgroundPattern && <GridPattern className="text-border/30" />}

      {/* Icon Badge */}
      <div className="relative z-10 w-16 h-16 rounded-sm bg-secondary/80 text-primary flex items-center justify-center shadow-inner border border-border/60">
        <Icon name={iconToRender} size="xl" />
      </div>

      {/* Content Text */}
      <div className="relative z-10 space-y-1.5 max-w-md">
        <h4 className="text-base md:text-lg font-bold tracking-tight text-foreground">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed font-normal">{description}</p>
        )}
      </div>

      {/* Action Controls */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="relative z-10 flex items-center gap-3 pt-2 flex-wrap justify-center">
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
              className="rounded-sm text-xs font-semibold h-9 px-4"
            >
              {secondaryActionLabel}
            </Button>
          )}

          {actionLabel && onAction && (
            <Button
              variant="default"
              size="sm"
              onClick={onAction}
              className="rounded-sm bg-primary text-primary-foreground font-semibold h-9 px-5 shadow-sm hover:shadow transition-all text-xs"
            >
              <Icon name="sparkles" size="xs" className="mr-1.5" />
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default EmptyState
