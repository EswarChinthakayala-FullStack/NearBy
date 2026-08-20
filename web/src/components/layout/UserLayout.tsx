import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { UserTopbar } from './UserTopbar'
import { PageTransition } from '@/components/common/PageTransition'
import { OfflineBanner } from '@/components/common/OfflineBanner'

import { useProfile } from '@/hooks/useAuthHooks'

interface UserLayoutProps {
  children?: React.ReactNode
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  // Sync latest profile & avatar URL from backend
  useProfile()
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Universal App Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <OfflineBanner />

          {/* Sticky Topbar */}
          <UserTopbar onToggleMobileSidebar={() => {}} />

          {/* Page Content Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            <PageTransition>{children || <Outlet />}</PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default UserLayout
