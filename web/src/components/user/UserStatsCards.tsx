import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { FavouriteIcon, StarIcon, Route02Icon, UserIcon } from '@hugeicons/core-free-icons'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserStats } from '@/hooks/useUserPortal'

export const UserStatsCards: React.FC = () => {
  const { data: stats, isLoading } = useUserStats()

  const cardItems = [
    {
      title: 'Saved Places',
      value: stats?.saved_places ?? 0,
      suffix: '',
      icon: FavouriteIcon,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      description: 'Bookmarked destination spots',
    },
    {
      title: 'Reviews Written',
      value: stats?.reviews_count ?? 0,
      suffix: '',
      icon: StarIcon,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      description: 'Submitted community reviews',
    },
    {
      title: 'Trips Planned',
      value: stats?.trips_count ?? 0,
      suffix: '',
      icon: Route02Icon,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      description: 'Saved routes & AI itineraries',
    },
    {
      title: 'Profile Completion',
      value: stats?.profile_completion_pct ?? 40,
      suffix: '%',
      icon: UserIcon,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'Account profile status score',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <Skeleton className="h-8 w-16 rounded-sm" />
              <Skeleton className="h-3 w-32 rounded-sm" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardItems.map((item) => (
        <Card
          key={item.title}
          className="border-border bg-card hover:border-emerald-500/40 transition-colors shadow-xs"
        >
          <CardContent className="p-5 flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">{item.title}</p>
              <h3 className="text-2xl font-black font-heading text-foreground tracking-tight">
                {item.value}
                <span className="text-base font-normal text-muted-foreground">{item.suffix}</span>
              </h3>
              <p className="text-[10px] text-muted-foreground">{item.description}</p>
            </div>

            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border ${item.bg}`}>
              <HugeiconsIcon icon={item.icon} className={`size-5 ${item.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default UserStatsCards
