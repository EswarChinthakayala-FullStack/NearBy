import React from 'react'
import { UserLayout } from '@/components/layout/UserLayout'

export interface AILayoutProps {
  children: React.ReactNode
}

export const AILayout: React.FC<AILayoutProps> = ({ children }) => {
  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-300">
        {children}
      </div>
    </UserLayout>
  )
}

export default AILayout
