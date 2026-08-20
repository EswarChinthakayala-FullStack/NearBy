import React from 'react'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Icon } from '@/components/common/Icon'
import { UserMenu } from './UserMenu'
import { OnlineStatus } from './OnlineStatus'
import { Breadcrumb } from './Breadcrumb'

interface AdminTopbarProps {
  onToggleMobileSidebar?: () => void
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onToggleMobileSidebar }) => {
  return (
    <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left Breadcrumb & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="flex h-8 w-8 md:hidden items-center justify-center rounded-sm border border-border text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-emerald-500"
          aria-label="Open Admin Menu"
        >
          <Icon name="menu" size="xs" />
        </button>

        <Breadcrumb />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <OnlineStatus />
        <ThemeToggle variant="icon-only" />
        <UserMenu />
      </div>
    </header>
  )
}

export default AdminTopbar
