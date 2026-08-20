import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { HugeiconsIcon } from '@hugeicons/react'
import type { IconSvgElement } from '@hugeicons/react'
import { Search01Icon } from '@hugeicons/core-free-icons'

export interface CommonEmptyStateProps {
  title: string
  description?: string
  icon?: IconSvgElement
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
}

export const CommonEmptyState: React.FC<CommonEmptyStateProps> = ({
  title,
  description,
  icon = Search01Icon,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <Card className={`border-border/80 bg-card p-8 sm:p-12 text-center shadow-sm ${className}`}>
      <CardContent className="space-y-4 max-w-md mx-auto p-0">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xs">
          <HugeiconsIcon icon={icon} className="size-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold font-heading text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground leading-relaxed font-mono">{description}</p>}
        </div>

        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {primaryAction}
            {secondaryAction}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CommonEmptyState
