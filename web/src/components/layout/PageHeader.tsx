import React from 'react'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export interface BreadcrumbItemType {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItemType[]
  actions?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs = [],
  actions,
  className = '',
}) => {
  return (
    <div className={`min-h-[120px] flex flex-col justify-between space-y-4 border-b border-border/60 pb-6 ${className}`}>
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList className="text-xs font-mono text-muted-foreground">
            <BreadcrumbItem>
              <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            </BreadcrumbItem>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="font-bold text-foreground">{item.label}</BreadcrumbPage>
                    ) : (
                      <Link to={item.href} className="hover:text-emerald-400 transition-colors">{item.label}</Link>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Title, Description & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}

export default PageHeader
