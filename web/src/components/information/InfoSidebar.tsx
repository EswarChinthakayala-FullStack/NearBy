import React from 'react'
import { TableOfContents, type TOCItem } from './TableOfContents'
import { SupportCard } from './SupportCard'
import { Icon } from '@/components/common/Icon'

export interface InfoSidebarProps {
  tocItems: TOCItem[]
  readingTimeMinutes?: number
  versionString?: string
  className?: string
}

export const InfoSidebar: React.FC<InfoSidebarProps> = ({
  tocItems,
  readingTimeMinutes = 5,
  versionString = 'v1.0.0 Enterprise',
  className = '',
}) => {
  return (
    <aside className={`space-y-6 sticky top-24 ${className}`}>
      {/* Quick Metadata Box */}
      <div className="rounded-sm border border-border/80 bg-card/60 p-4 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Icon name="clock" size="xs" className="text-primary" />
            <span>{readingTimeMinutes} min read</span>
          </span>
          <span className="font-mono text-[11px] rounded-sm bg-muted px-2 py-0.5 border border-border text-foreground font-semibold">
            {versionString}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon name="check" size="xs" className="text-emerald-400" /> Verified Audit
          </span>
          <span className="flex items-center gap-1">
            <Icon name="shield" size="xs" className="text-teal-400" /> Enterprise SLA
          </span>
        </div>
      </div>

      {/* Table of Contents */}
      {tocItems.length > 0 && <TableOfContents items={tocItems} />}

      {/* Support Card */}
      <SupportCard />
    </aside>
  )
}
