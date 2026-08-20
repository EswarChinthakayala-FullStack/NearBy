import React, { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DividerProps {
  children?: ReactNode
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export const Divider: React.FC<DividerProps> = ({
  children,
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return <div className={cn('w-px h-full bg-border/60 shrink-0 mx-2', className)} />
  }

  if (children) {
    return (
      <div className={cn('relative flex items-center my-4', className)}>
        <div className="flex-grow border-t border-border/60" />
        <span className="flex-shrink mx-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
          {children}
        </span>
        <div className="flex-grow border-t border-border/60" />
      </div>
    )
  }

  return <hr className={cn('my-4 border-t border-border/60 w-full', className)} />
}

export default Divider
