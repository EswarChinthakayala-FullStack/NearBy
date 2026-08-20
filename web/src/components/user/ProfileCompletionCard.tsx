import React from 'react'
import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  Cancel01Icon,
  UserIcon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

export const ProfileCompletionCard: React.FC = () => {
  const { user } = useAuthStore()

  const checklist = [
    { label: 'Account Registration', completed: true },
    { label: 'Email Verified', completed: !!user?.is_verified },
    { label: 'Full Name Configured', completed: !!user?.full_name },
    { label: 'Profile Avatar Uploaded', completed: !!(user?.avatar_url || user?.avatarUrl) },
    { label: 'Phone Number Added', completed: !!user?.phone_number },
    { label: 'Password Security', completed: true },
  ]

  const completedCount = checklist.filter((item) => item.completed).length
  const pct = Math.round((completedCount / checklist.length) * 100)

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 font-heading">
          <HugeiconsIcon icon={UserIcon} className="size-4 text-emerald-400" />
          <span>Profile Completion</span>
        </CardTitle>
        <span className="text-xs font-mono font-bold text-emerald-400">{pct}% Complete</span>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden border border-border/40">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <HugeiconsIcon
                icon={item.completed ? CheckmarkCircle02Icon : Cancel01Icon}
                className={`size-3.5 shrink-0 ${item.completed ? 'text-emerald-400' : 'text-muted-foreground/60'}`}
              />
              <span className={item.completed ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {pct < 100 && (
          <div className="pt-2 border-t border-border/40 flex justify-end">
            <Link
              to="/user/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
            >
              <span>Complete Profile Settings</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ProfileCompletionCard
