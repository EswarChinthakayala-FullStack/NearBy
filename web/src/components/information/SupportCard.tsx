import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'

export interface SupportCardProps {
  title?: string
  description?: string
  buttonText?: string
  className?: string
}

export const SupportCard: React.FC<SupportCardProps> = ({
  title = 'Need Assistance or Have Questions?',
  description = 'Our technical architecture and compliance support team is available 24/7 to clarify implementation details, security audits, or enterprise SLA agreements.',
  buttonText = 'Contact Engineering Support',
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-sm border border-primary/30 bg-gradient-to-br from-card via-card/95 to-primary/5 p-5 shadow-sm backdrop-blur-md space-y-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-md">
          <Icon name="user" size="md" />
        </div>
        <div>
          <h4 className="text-sm font-bold font-heading text-foreground tracking-tight">{title}</h4>
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
            Enterprise Help & Compliance Desk
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

      <div className="pt-1 flex flex-col gap-2 w-full">
        <Button variant="default" size="default" className="h-9 px-3 text-xs font-semibold gap-2 w-full justify-center">
          <Icon name="notifications" size="xs" />
          <span className="truncate">{buttonText}</span>
        </Button>
        <Link to="/system-status" className="w-full">
          <Button variant="outline" size="default" className="h-9 px-3 text-xs font-semibold gap-2 w-full justify-center">
            <Icon name="external-link" size="xs" />
            <span className="truncate">View Platform Status</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
