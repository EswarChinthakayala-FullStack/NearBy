import React from 'react'

export interface FooterSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
        {title}
      </h4>
      <ul className="space-y-2 text-xs text-muted-foreground">{children}</ul>
    </div>
  )
}

export default FooterSection
