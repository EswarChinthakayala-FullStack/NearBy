import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Home01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

const ROUTE_LABELS: Record<string, string> = {
  '/user/dashboard': 'Dashboard',
  '/user/profile': 'My Profile',
  '/user/favorites': 'Favorites',
  '/user/reviews': 'My Reviews',
  '/user/trips': 'My Trips',
  '/user/notifications': 'Notifications',
  '/user/security': 'Security',
  '/user/settings': 'Settings',
  '/user/help-center': 'Help Center',
}

export const UserBreadcrumb: React.FC = () => {
  const location = useLocation()
  const currentPath = location.pathname

  const label = ROUTE_LABELS[currentPath] || 'User Portal'

  return (
    <nav aria-label="User Portal Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
      <Link
        to="/user/dashboard"
        className="flex items-center gap-1 hover:text-emerald-400 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
      >
        <HugeiconsIcon icon={Home01Icon} className="size-3.5" />
        <span>Portal</span>
      </Link>

      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-muted-foreground/50 shrink-0" />

      <span className="font-bold text-foreground truncate">{label}</span>
    </nav>
  )
}

export default UserBreadcrumb
