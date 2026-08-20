import React from 'react'
import { Separator } from '@/components/ui/separator'

export interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  showDivider?: boolean
  className?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
  showDivider = true,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold font-heading tracking-tight text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {showDivider && <Separator className="bg-border/60" />}
    </div>
  )
}

export default SectionHeader
