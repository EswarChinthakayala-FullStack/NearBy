import React from 'react'
import { Link } from 'react-router-dom'
import type { Place } from '@/types/place'
import { HugeiconsIcon } from '@hugeicons/react'
import { Location01Icon, StarIcon, Route02Icon } from '@hugeicons/core-free-icons'

interface PlaceRecommendationCardProps {
  place: Place
}

export const PlaceRecommendationCard: React.FC<PlaceRecommendationCardProps> = ({ place }) => {
  return (
    <div className="p-4 rounded-sm border border-border bg-card shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-foreground font-heading truncate">{place.name}</h4>
          <div className="flex items-center gap-1 text-xs font-mono text-amber-400 shrink-0">
            <HugeiconsIcon icon={StarIcon} className="size-3.5 fill-amber-400" />
            <span>{place.avg_rating || '4.5'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <HugeiconsIcon icon={Location01Icon} className="size-3 text-emerald-400" />
          <span>{place.city}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between">
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">AI Matched</span>
        <Link
          to={`/places/${place.uuid}`}
          className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
        >
          <HugeiconsIcon icon={Route02Icon} className="size-3.5" />
          <span>View Destination</span>
        </Link>
      </div>
    </div>
  )
}

export default PlaceRecommendationCard
