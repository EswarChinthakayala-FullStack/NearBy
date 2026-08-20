import React from 'react'
import { Icon } from '@/components/common/Icon'

export interface LastUpdatedProps {
  dateString?: string
  version?: string
  className?: string
}

export const LastUpdated: React.FC<LastUpdatedProps> = ({
  dateString = 'July 26, 2026',
  version = 'v1.0.0 Enterprise',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-sm border border-border/80 bg-card/60 px-3.5 py-1.5 backdrop-blur-md text-xs text-muted-foreground ${className}`}
    >
      <span className="flex items-center gap-1.5 font-medium text-foreground">
        <Icon name="clock" size="xs" className="text-primary" />
        <span>Last Updated:</span>
        <span className="font-semibold">{dateString}</span>
      </span>
      <span className="h-3 w-px bg-border" />
      <span className="font-mono text-[11px] text-primary font-semibold">{version}</span>
    </div>
  )
}
