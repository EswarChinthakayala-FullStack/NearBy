import React from 'react'

export interface SectionContainerProps {
  children: React.ReactNode
  className?: string
  id?: string
  variant?: 'default' | 'muted' | 'card' | 'glass' | 'none'
  py?: 'sm' | 'md' | 'lg' | 'xl' | 'none'
}

const VARIANT_MAP: Record<string, string> = {
  default: 'bg-background text-foreground',
  muted: 'bg-muted/40 text-foreground border-y border-border/50',
  card: 'bg-card border border-border rounded-sm shadow-xs text-card-foreground',
  glass: 'bg-card/70 backdrop-blur-xl border border-border/70 rounded-sm shadow-sm text-card-foreground',
  none: '',
}

const PY_MAP: Record<string, string> = {
  sm: 'py-6 sm:py-8',
  md: 'py-10 sm:py-12',
  lg: 'py-16 sm:py-20',
  xl: 'py-24 sm:py-32',
  none: '',
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  children,
  className = '',
  id,
  variant = 'none',
  py = 'none',
}) => {
  const variantClass = VARIANT_MAP[variant] || ''
  const pyClass = PY_MAP[py] || ''

  return (
    <section id={id} className={`w-full relative ${variantClass} ${pyClass} ${className}`}>
      {children}
    </section>
  )
}

export default SectionContainer
