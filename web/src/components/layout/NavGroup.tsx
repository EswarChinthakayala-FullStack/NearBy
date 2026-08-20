import React from 'react'

export interface NavGroupProps {
  title?: string
  children: React.ReactNode
  collapsed?: boolean
  className?: string
}

export const NavGroup: React.FC<NavGroupProps> = ({
  title,
  children,
  collapsed = false,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {title && !collapsed && (
        <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 font-mono pt-3 pb-1">
          {title}
        </h4>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export default NavGroup
