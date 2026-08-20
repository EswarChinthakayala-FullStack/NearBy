import React from 'react'

export interface SocialDividerProps {
  label?: string
  className?: string
}

export const SocialDivider: React.FC<SocialDividerProps> = ({
  label = 'or continue with',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center my-6 ${className}`}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border/60" />
      </div>
      <div className="relative px-3 bg-card text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}

export default SocialDivider
