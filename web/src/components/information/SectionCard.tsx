import React from 'react'
import { Icon, type IconName } from '@/components/common/Icon'

export interface SectionCardProps {
  id?: string
  title: string
  subtitle?: string
  iconName?: IconName
  badgeText?: string
  children: React.ReactNode
  className?: string
}

export const SectionCard: React.FC<SectionCardProps> = ({
  id,
  title,
  subtitle,
  iconName,
  badgeText,
  children,
  className = '',
}) => {
  return (
    <section
      id={id}
      className={`relative rounded-sm border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 p-6 sm:p-8 shadow-sm backdrop-blur-md transition-all space-y-6 scroll-mt-24 ${className}`}
    >
      <div className="space-y-2 border-b border-border/60 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {iconName && (
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/20">
                <Icon name={iconName} size="md" />
              </div>
            )}
            <h2 className="text-xl font-bold font-heading text-foreground tracking-tight">{title}</h2>
          </div>
          {badgeText && (
            <span className="inline-flex items-center rounded-sm bg-muted px-2.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground border border-border">
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>}
      </div>

      <div className="space-y-4 text-xs text-foreground leading-relaxed">{children}</div>
    </section>
  )
}
