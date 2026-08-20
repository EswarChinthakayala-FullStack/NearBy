import React, { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ContainerProps {
  children: ReactNode
  size?: ContainerSize
  className?: string
}

const SIZE_MAP: Record<ContainerSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'xl',
  className = '',
}) => {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', SIZE_MAP[size], className)}>
      {children}
    </div>
  )
}

export default Container
