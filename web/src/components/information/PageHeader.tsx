import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({ breadcrumbs, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-muted-foreground py-2 ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 font-medium">
        <li>
          <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Icon name="home" size="xs" />
            <span>Home</span>
          </Link>
        </li>
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1
          return (
            <li key={crumb.label} className="flex items-center gap-1.5">
              <Icon name="arrow-right" size="xs" className="text-muted-foreground/60" />
              {isLast || !crumb.href ? (
                <span className="font-semibold text-foreground truncate max-w-[200px]">{crumb.label}</span>
              ) : (
                <Link to={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
