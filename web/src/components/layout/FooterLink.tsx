import React from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '@/components/common/Icon'

export interface FooterLinkProps {
  to?: string
  href?: string
  label: string
  icon?: IconName
  external?: boolean
  className?: string
}

export const FooterLink: React.FC<FooterLinkProps> = ({
  to,
  href,
  label,
  icon,
  external = false,
  className = '',
}) => {
  const content = (
    <span className="flex items-center gap-1.5 hover:text-foreground transition-colors group">
      {icon && <Icon name={icon} size="xs" className="text-muted-foreground group-hover:text-foreground" />}
      <span>{label}</span>
      {external && <Icon name="external-link" size="xs" className="opacity-60 group-hover:opacity-100" />}
    </span>
  )

  if (external && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-xs text-muted-foreground hover:text-foreground transition-colors ${className}`}
      >
        {content}
      </a>
    )
  }

  if (to) {
    return (
      <Link to={to} className={`text-xs text-muted-foreground hover:text-foreground transition-colors ${className}`}>
        {content}
      </Link>
    )
  }

  return <span className={`text-xs text-muted-foreground ${className}`}>{label}</span>
}

export default FooterLink
