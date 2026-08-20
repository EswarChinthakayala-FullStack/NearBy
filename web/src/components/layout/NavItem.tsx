import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'

export interface NavItemProps {
  href: string
  label: string
  icon?: IconName
  badge?: string | number
  badgeVariant?: 'default' | 'accent' | 'outline' | 'destructive'
  exact?: boolean
  onClick?: () => void
  collapsed?: boolean
  className?: string
}

export const NavItem: React.FC<NavItemProps> = ({
  href,
  label,
  icon,
  badge,
  badgeVariant = 'accent',
  exact = false,
  onClick,
  collapsed = false,
  className = '',
}) => {
  const location = useLocation()
  const isActive = exact
    ? location.pathname === href
    : location.pathname === href || (href !== '/' && location.pathname.startsWith(`${href}/`))

  return (
    <Link
      to={href}
      onClick={onClick}
      className={`group relative flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-emerald-500 ${
        isActive
          ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-2xs'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      } ${className}`}
      title={collapsed ? label : undefined}
    >
      {icon && (
        <Icon
          name={icon}
          size="xs"
          className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
            isActive ? 'text-emerald-400' : 'text-muted-foreground group-hover:text-foreground'
          }`}
        />
      )}

      {!collapsed && <span className="truncate">{label}</span>}

      {!collapsed && badge !== undefined && badge !== null && (
        <Badge
          variant={badgeVariant}
          className="ml-auto text-[9px] font-mono px-1.5 py-0.2 shrink-0"
        >
          {badge}
        </Badge>
      )}
    </Link>
  )
}

export default NavItem
