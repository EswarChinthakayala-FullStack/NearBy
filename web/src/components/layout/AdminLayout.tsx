import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { OnlineStatus } from './OnlineStatus'
import { UserMenu } from './UserMenu'
import { Separator } from '@/components/ui/separator'

interface AdminLayoutProps {
  children?: React.ReactNode
}

const ADMIN_PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Admin Dashboard', subtitle: 'System metrics, sync controls, and activity overview' },
  '/admin/places': { title: 'Places Management', subtitle: 'Create, edit, and publish tourist attraction records' },
  '/admin/places/new': { title: 'Create New Place', subtitle: 'Add a new tourist attraction entry to the database' },
  '/admin/categories': { title: 'Categories', subtitle: 'Define and organize regional place classification taxonomy' },
  '/admin/reviews': { title: 'Review Moderation', subtitle: 'Approve or reject user-submitted reviews' },
  '/admin/users': { title: 'User Accounts', subtitle: 'Audit registered platform users and role access' },
  '/admin/logs': { title: 'Activity Logs', subtitle: 'Chronological audit trail of administrative operations' },
  '/admin/sync': { title: 'Sync Jobs', subtitle: 'OpenStreetMap and Wikipedia content synchronization' },
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation()

  const pageInfo = ADMIN_PAGE_TITLES[location.pathname] || {
    title: 'Admin Console',
    subtitle: 'Nearby administration panel',
  }

  return (
    <SidebarProvider>
      {/* Universal App Sidebar */}
      <AppSidebar />

      {/* Main Content Area — flush with sidebar, no gaps */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-background text-foreground transition-colors duration-200">
        {/* Professional Top Bar — flush to top edge */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur-xl transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <SidebarTrigger className="h-8 w-8 rounded-sm" />
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <div className="hidden sm:block min-w-0">
              <h2 className="text-sm font-bold text-foreground truncate">{pageInfo.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:block">
              <OnlineStatus className="h-8" />
            </div>
            <ThemeToggle variant="icon-only" className="h-8 w-8 rounded-sm" />
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-auto bg-background text-foreground transition-colors duration-200">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Inner Page Content */}
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default AdminLayout
