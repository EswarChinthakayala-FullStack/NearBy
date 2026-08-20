import React from 'react'

export const CardGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 ${className}`}>
    {children}
  </div>
)

export const FormGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
    {children}
  </div>
)

export const StatsGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
    {children}
  </div>
)

export interface DetailGridProps {
  main: React.ReactNode
  sidebar: React.ReactNode
  className?: string
}

export const DetailGrid: React.FC<DetailGridProps> = ({ main, sidebar, className = '' }) => (
  <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${className}`}>
    <div className="lg:col-span-8 space-y-6">{main}</div>
    <div className="lg:col-span-4 space-y-6 sticky top-24 h-fit">{sidebar}</div>
  </div>
)
