import React from 'react'
import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Compass01Icon, UserIcon, SparklesIcon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

export const DashboardWelcome: React.FC = () => {
  const { user } = useAuthStore()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  const name = user?.full_name || user?.name || 'Traveler'

  return (
    <div className="relative overflow-hidden rounded-sm border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-card to-card p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono font-semibold text-emerald-400">
            <HugeiconsIcon icon={SparklesIcon} className="size-3" />
            <span>Nearby Authenticated Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
            {getGreeting()}, <span className="text-emerald-400">{name}</span>
          </h1>

          <p className="text-xs text-muted-foreground max-w-xl">
            Welcome to your personal spatial travel companion hub. Manage your saved spots, track reviews, and plan itineraries.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <Link to="/places">
            <Button size="sm" className="rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-2 shadow-sm">
              <HugeiconsIcon icon={Compass01Icon} className="size-4" />
              <span>Explore Destinations</span>
            </Button>
          </Link>

          <Link to="/user/profile">
            <Button variant="outline" size="sm" className="rounded-sm text-xs font-semibold gap-2 border-border">
              <HugeiconsIcon icon={UserIcon} className="size-4" />
              <span>My Account</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardWelcome
