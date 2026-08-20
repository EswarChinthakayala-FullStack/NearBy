import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  Notification01Icon,
  UserIcon,
  Settings02Icon,
  Shield01Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { UserBreadcrumb } from './UserBreadcrumb'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { OnlineStatus } from './OnlineStatus'
import { useAuthStore } from '@/store/authStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UserTopbarProps {
  onToggleMobileSidebar?: () => void
}

export const UserTopbar: React.FC<UserTopbarProps> = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card/90 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Sidebar Trigger & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="h-8 w-8 rounded-sm shrink-0" />
        <Separator orientation="vertical" className="h-5 hidden sm:block shrink-0" />
        <UserBreadcrumb />
      </div>

      {/* Right: Search, Notifications, Online Status, Theme Toggle, User Dropdown */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search Trigger Button */}
        <Link
          to="/places"
          className="hidden sm:flex h-9 items-center gap-2 rounded-sm border border-border bg-muted/30 px-3 text-xs text-muted-foreground hover:border-emerald-500/50 hover:text-foreground transition-all"
        >
          <HugeiconsIcon icon={Search01Icon} className="size-3.5 text-emerald-400" />
          <span>Search destinations...</span>
        </Link>

        {/* Notifications Button */}
        <Link
          to="/user/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-card/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
          title="Notifications"
        >
          <HugeiconsIcon icon={Notification01Icon} className="size-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-emerald-500" />
        </Link>

        {/* Online Status */}
        <div className="hidden lg:block">
          <OnlineStatus className="h-9" />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle variant="icon-only" className="h-9 w-9 rounded-sm" />

        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-card/80 hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 overflow-hidden shadow-xs"
              />
            }
          >
            {user?.avatar_url || user?.avatarUrl ? (
              <img
                src={user.avatar_url || user.avatarUrl || ''}
                alt={user.full_name || user.name}
                className="h-full w-full object-cover rounded-sm"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-sm bg-emerald-500/20 text-emerald-400 font-bold text-xs font-mono">
                {(user?.full_name || user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <div className="p-2 border-b border-border space-y-0.5">
              <p className="text-xs font-bold text-foreground truncate">{user?.full_name || user?.name || 'User Account'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>

            <DropdownMenuItem onClick={() => navigate('/user/profile')}>
              <HugeiconsIcon icon={UserIcon} className="size-3.5 mr-2 text-muted-foreground" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/user/settings')}>
              <HugeiconsIcon icon={Settings02Icon} className="size-3.5 mr-2 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/user/security')}>
              <HugeiconsIcon icon={Shield01Icon} className="size-3.5 mr-2 text-muted-foreground" />
              <span>Security</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="text-rose-400 focus:text-rose-400">
              <HugeiconsIcon icon={Logout01Icon} className="size-3.5 mr-2" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default UserTopbar
