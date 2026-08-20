import React from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Compass01Icon,
  FavouriteIcon,
  StarIcon,
  Route02Icon,
  Notification01Icon,
  Shield01Icon,
  Settings02Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons'
import { DashboardWelcome } from '@/components/user/DashboardWelcome'
import { UserStatsCards } from '@/components/user/UserStatsCards'
import { ProfileCompletionCard } from '@/components/user/ProfileCompletionCard'
import { RecentActivity } from '@/components/user/RecentActivity'
import { AccountSummary } from '@/components/user/AccountSummary'

export const DashboardPage: React.FC = () => {
  const quickActions = [
    { label: 'Browse Places', path: '/user/browse', icon: Compass01Icon, color: 'text-emerald-400' },
    { label: 'Saved Bookmarks', path: '/user/favorites', icon: FavouriteIcon, color: 'text-rose-400' },
    { label: 'My Reviews', path: '/user/reviews', icon: StarIcon, color: 'text-amber-400' },
    { label: 'Trips & Routes', path: '/user/trips', icon: Route02Icon, color: 'text-blue-400' },
    { label: 'Notifications', path: '/user/notifications', icon: Notification01Icon, color: 'text-purple-400' },
    { label: 'Security Center', path: '/user/security', icon: Shield01Icon, color: 'text-indigo-400' },
    { label: 'Settings', path: '/user/settings', icon: Settings02Icon, color: 'text-teal-400' },
    { label: 'Help & FAQ', path: '/user/help-center', icon: InformationCircleIcon, color: 'text-cyan-400' },
  ]

  return (
    <PageContainer>
      {/* Standardized Page Header */}
      <PageHeader
        title="User Dashboard"
        description="Overview of your saved trips, favorite destinations, reviews, and account telemetry."
        breadcrumbs={[{ label: 'My Account' }, { label: 'Dashboard' }]}
      />

      {/* Welcome Banner */}
      <DashboardWelcome />

      {/* User Statistics Cards */}
      <UserStatsCards />

      {/* Main Grid — Activity, Completion, Account */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <RecentActivity />

          {/* Quick Portal Shortcuts */}
          <div className="p-6 rounded-sm border border-border bg-card space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-foreground font-heading">Portal Quick Shortcuts</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="p-3 rounded-sm border border-border/60 bg-muted/20 hover:bg-card hover:border-emerald-500/40 transition-all flex flex-col items-center justify-center text-center space-y-2 group"
                >
                  <HugeiconsIcon icon={action.icon} className={`size-5 ${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-semibold text-foreground">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ProfileCompletionCard />
          <AccountSummary />
        </div>
      </div>
    </PageContainer>
  )
}

export default DashboardPage
