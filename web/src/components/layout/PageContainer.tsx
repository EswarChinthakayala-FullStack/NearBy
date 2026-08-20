import React from 'react'

export interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`mx-auto w-full max-w-[1600px] px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 space-y-8 animate-in fade-in duration-300 ${className}`}>
      {children}
    </div>
  )
}

export default PageContainer
