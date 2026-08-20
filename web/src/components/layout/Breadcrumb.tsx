import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'

export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: string
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

const PATH_TITLE_MAP: Record<string, string> = {
  admin: 'Admin Console',
  places: 'Places',
  categories: 'Categories',
  reviews: 'Reviews Moderation',
  users: 'Users Directory',
  sync: 'Sync Jobs',
  logs: 'Activity Audit Logs',
  profile: 'Profile',
  favorites: 'Saved Places',
  trips: 'AI Itineraries',
  settings: 'Settings',
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
  showHome = true,
}) => {
  const location = useLocation()

  // Generate breadcrumb items automatically from URL path if items not provided explicitly
  const computedItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const generated: BreadcrumbItem[] = []

    let currentPath = ''
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`
      const label = PATH_TITLE_MAP[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      generated.push({ label, path: currentPath })
    })

    return generated
  }, [items, location.pathname])

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={`flex items-center gap-1.5 text-xs text-muted-foreground font-mono overflow-x-auto py-1 scrollbar-none ${className}`}
    >
      {showHome && (
        <>
          <Link
            to="/"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Home"
          >
            <Icon name="home" size="xs" />
            <span className="sr-only">Home</span>
          </Link>
          {computedItems.length > 0 && (
            <Icon name="arrow-right" size="xs" className="text-muted-foreground/60 shrink-0" />
          )}
        </>
      )}

      {computedItems.map((item, index) => {
        const isLast = index === computedItems.length - 1

        return (
          <React.Fragment key={item.path || `${item.label}-${index}`}>
            {isLast || !item.path ? (
              <span className="font-bold text-foreground truncate max-w-[200px]" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-foreground hover:underline transition-colors shrink-0"
              >
                {item.label}
              </Link>
            )}

            {!isLast && (
              <Icon name="arrow-right" size="xs" className="text-muted-foreground/60 shrink-0" />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
