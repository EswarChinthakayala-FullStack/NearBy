import React from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'

export interface EmptyAdminStateProps {
  iconName?: IconName
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyAdminState: React.FC<EmptyAdminStateProps> = ({
  iconName = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-10 rounded-sm border border-dashed border-border/80 bg-card/40 backdrop-blur-sm text-center flex flex-col items-center justify-center space-y-4 my-4 ${className}`}
    >
      <div className="w-14 h-14 rounded-sm bg-secondary/80 text-muted-foreground flex items-center justify-center shadow-inner">
        <Icon name={iconName} size="lg" className="text-muted-foreground" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-base font-bold tracking-tight text-foreground">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="mt-2 rounded-sm bg-primary text-primary-foreground font-semibold shadow-sm hover:shadow transition-all text-xs"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}

export default EmptyAdminState
