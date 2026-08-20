import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Home01Icon,
  UserIcon,
  FavouriteIcon,
  StarIcon,
  Route02Icon,
  Notification01Icon,
  Shield01Icon,
  Settings02Icon,
  InformationCircleIcon,
  Logout01Icon,
  Compass01Icon,
} from '@hugeicons/core-free-icons'
import { useAuthStore } from '@/store/authStore'
import { AppLogo } from '@/components/common/AppLogo'

interface UserSidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onCloseMobile?: () => void
}

export interface NavItem {
  path: string
  label: string
  icon: any
}

export const USER_NAV_ITEMS: NavItem[] = [
  { path: '/user/dashboard', label: 'Dashboard', icon: Home01Icon },
  { path: '/user/profile', label: 'My Profile', icon: UserIcon },
  { path: '/user/favorites', label: 'Favorites', icon: FavouriteIcon },
  { path: '/user/reviews', label: 'My Reviews', icon: StarIcon },
  { path: '/user/trips', label: 'My Trips', icon: Route02Icon },
  { path: '/user/notifications', label: 'Notifications', icon: Notification01Icon },
  { path: '/user/security', label: 'Security', icon: Shield01Icon },
  { path: '/user/settings', label: 'Settings', icon: Settings02Icon },
  { path: '/user/help-center', label: 'Help Center', icon: InformationCircleIcon },
]

export const UserSidebar: React.FC<UserSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    if (onCloseMobile) onCloseMobile()
    navigate('/login')
  }

  return (
    <aside
      className={`h-screen border-r border-border bg-card/95 backdrop-blur-md flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header Branding */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2">
            <AppLogo size="sm" />
          </Link>
        )}

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mx-auto focus-visible:outline-2 focus-visible:outline-emerald-500"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar Collapse"
          >
            <HugeiconsIcon icon={Compass01Icon} className="size-4" />
          </button>
        )}
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {USER_NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border-l-2 border-emerald-500 font-bold shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-semibold'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <HugeiconsIcon icon={item.icon} className="size-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Logout & Footer Profile */}
      <div className="p-3 border-t border-border bg-muted/30 space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <HugeiconsIcon icon={Logout01Icon} className="size-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

        <div className="flex items-center gap-2.5 pt-2 border-t border-border/40">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-emerald-500/20 text-emerald-400 font-bold text-xs font-mono overflow-hidden">
            {user?.avatar_url || user?.avatarUrl ? (
              <img
                src={user.avatar_url || user.avatarUrl || ''}
                alt={user.full_name || user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              (user?.full_name || user?.name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          {!isCollapsed && (
            <div className="space-y-0.5 overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{user?.full_name || user?.name || 'User Account'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'user@nearby.ai'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default UserSidebar
