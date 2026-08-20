import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

export interface AccountStatusBadgeProps {
  type: 'status' | 'verification' | 'role'
  value: boolean | string
  className?: string
}

export const AccountStatusBadge: React.FC<AccountStatusBadgeProps> = ({
  type,
  value,
  className = '',
}) => {
  if (type === 'status') {
    const isActive = Boolean(value)
    return (
      <Badge
        variant={isActive ? 'outline' : 'destructive'}
        className={cn(
          'text-[10px] font-mono uppercase px-2 py-0.5 font-semibold border',
          isActive
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            : 'bg-destructive/10 text-destructive border-destructive/30',
          className
        )}
      >
        <Icon name={isActive ? 'check' : 'close'} size={10} className="mr-1" />
        {isActive ? 'Active Account' : 'Inactive Account'}
      </Badge>
    )
  }

  if (type === 'verification') {
    const isVerified = Boolean(value)
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-[10px] font-mono uppercase px-2 py-0.5 font-semibold border',
          isVerified
            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          className
        )}
      >
        <Icon name={isVerified ? 'check' : 'warning'} size={10} className="mr-1" />
        {isVerified ? 'Email Verified' : 'Unverified Email'}
      </Badge>
    )
  }

  // Role
  const roleStr = String(value || 'user').toLowerCase()
  const isAdmin = roleStr === 'admin'

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-mono uppercase px-2 py-0.5 font-semibold border',
        isAdmin
          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
          : 'bg-secondary text-secondary-foreground border-border/70',
        className
      )}
    >
      <Icon name={isAdmin ? 'admin' : 'profile'} size={10} className="mr-1" />
      {isAdmin ? 'Administrator' : 'Verified Member'}
    </Badge>
  )
}

export default AccountStatusBadge
