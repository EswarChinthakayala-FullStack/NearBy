import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AppLogo } from '@/components/common/AppLogo'
import { Icon, type IconName } from '@/components/common/Icon'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'

interface AdminSidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onCloseMobile?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const location = useLocation()
  const { user } = useAuthStore()

  const adminNavItems: { path: string; label: string; icon: IconName }[] = [
    { path: '/admin', label: 'Dashboard', icon: 'admin' },
    { path: '/admin/places', label: 'Places Index', icon: 'places' },
    { path: '/admin/categories', label: 'Categories', icon: 'categories' },
    { path: '/admin/reviews', label: 'Moderation Queue', icon: 'ratings' },
    { path: '/admin/users', label: 'Users Directory', icon: 'profile' },
    { path: '/admin/logs', label: 'Activity Audit Logs', icon: 'clock' },
    { path: '/admin/sync', label: 'Sync Jobs', icon: 'refresh' },
  ]

  return (
    <aside
      className={`h-screen border-r border-border bg-card/95 backdrop-blur-md flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <Link to="/" className="flex items-center gap-2">
            <AppLogo size="sm" />
            <Badge variant="accent" className="text-[9px] uppercase font-mono bg-amber-500/20 text-amber-300">
              Admin
            </Badge>
          </Link>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mx-auto focus-visible:outline-2 focus-visible:outline-emerald-500"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar Collapse"
        >
          <Icon name="menu" size="xs" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border-l-2 border-emerald-500 font-bold shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon name={item.icon} size="xs" className="shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Admin User Footer Profile */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-amber-500/20 text-amber-400 font-bold text-xs font-mono overflow-hidden">
            {user?.avatar_url || user?.avatarUrl ? (
              <img src={user.avatar_url || user.avatarUrl || ''} alt={user.full_name || user.name} className="h-full w-full object-cover" />
            ) : (
              (user?.full_name || user?.name || 'A').charAt(0).toUpperCase()
            )}
          </div>
          {!isCollapsed && (
            <div className="space-y-0.5 overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{user?.full_name || user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'admin@nearby.ai'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
