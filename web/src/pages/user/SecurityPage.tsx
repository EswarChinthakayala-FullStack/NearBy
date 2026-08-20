import React from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkBadge01Icon,
  ComputerIcon,
  Logout01Icon,
} from '@hugeicons/core-free-icons'
import { PasswordChangeForm } from '@/components/user/PasswordChangeForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

export const SecurityPage: React.FC = () => {
  const { user, logout } = useAuthStore()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Standardized Page Header */}
      <PageHeader
        title="Account Security & Sessions"
        description="Manage your password, active login sessions, and JWT token authentication settings."
        breadcrumbs={[{ label: 'My Account' }, { label: 'Security' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PasswordChangeForm />
        </div>

        <div className="space-y-6">
          {/* Active Session Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 font-heading">
                <HugeiconsIcon icon={ComputerIcon} className="size-4 text-emerald-400" />
                <span>Active Session</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session Status</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <HugeiconsIcon icon={CheckmarkBadge01Icon} className="size-3.5" />
                  <span>Active JWT Session</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-foreground font-bold">#{user?.id || 1}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role Scope</span>
                <span className="font-mono uppercase text-emerald-400 font-bold">{user?.role || 'user'}</span>
              </div>

              <div className="pt-3 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="w-full h-9 rounded-sm text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border-border gap-2 shadow-xs transition-all"
                >
                  <HugeiconsIcon icon={Logout01Icon} className="size-3.5" />
                  <span>Sign Out Current Device</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SecurityPage
