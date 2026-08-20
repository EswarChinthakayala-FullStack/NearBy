import React from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/common/Icon'

export interface RelatedLink {
  title: string
  description: string
  href: string
  iconName: IconName
}

export interface RelatedLinksProps {
  links: RelatedLink[]
  title?: string
  className?: string
}

export const RelatedLinks: React.FC<RelatedLinksProps> = ({
  links,
  title = 'Related Documentation & Platform Resources',
  className = '',
}) => {
  if (links.length === 0) return null

  return (
    <div className={`space-y-4 pt-8 border-t border-border/80 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon name="grid" size="xs" className="text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="group relative rounded-sm border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 p-4 shadow-xs hover:border-primary/50 hover:shadow-md backdrop-blur-md transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
                  <Icon name={link.iconName} size="sm" />
                </div>
                <Icon name="arrow-right" size="xs" className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-sm font-bold font-heading text-foreground group-hover:text-primary transition-colors">{link.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{link.description}</p>
            </div>
            <span className="text-[11px] font-mono text-primary font-semibold flex items-center gap-1 pt-1">
              Explore resource <Icon name="external-link" size="xs" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
