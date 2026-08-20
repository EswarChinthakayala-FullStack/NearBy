import React from 'react'
import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Shield01Icon, CheckmarkBadge01Icon, Clock01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'

export const AccountSummary: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 font-heading">
          <HugeiconsIcon icon={Shield01Icon} className="size-4 text-emerald-400" />
          <span>Account Overview</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Account Role</span>
          <Badge variant="accent" className="text-[10px] uppercase font-mono bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
            {user?.role || 'user'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Email Verification</span>
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} className="size-3.5" />
            <span>Verified</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Member Since</span>
          <span className="flex items-center gap-1 font-mono text-muted-foreground">
            <HugeiconsIcon icon={Clock01Icon} className="size-3.5" />
            <span>{user?.created_at ? formatDate(user.created_at) : 'Active Member'}</span>
          </span>
        </div>

        <div className="pt-3 border-t border-border/40 space-y-2">
          <Link
            to="/user/security"
            className="flex items-center justify-between p-2 rounded-sm bg-muted/40 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <span>Security & Password</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </Link>
          <Link
            to="/user/settings"
            className="flex items-center justify-between p-2 rounded-sm bg-muted/40 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <span>Preferences & Settings</span>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountSummary
