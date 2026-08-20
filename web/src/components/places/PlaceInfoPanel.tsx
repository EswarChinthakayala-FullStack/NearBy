import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { buttonPressVariants } from '@/lib/motion-variants'
import { RatingStars } from './RatingStars'
import { CategoryBadge } from './CategoryBadge'
import { FavoriteButton } from './FavoriteButton'
import type { Place } from '@/types/place'
import { toast } from 'sonner'

export interface PlaceInfoPanelProps {
  place: Place
  className?: string
}

export const PlaceInfoPanel: React.FC<PlaceInfoPanelProps> = ({ place, className = '' }) => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Place location URL copied to clipboard!')
  }

  const directionsUrl = `/map-radar?lat=${place.latitude}&lng=${place.longitude}&name=${encodeURIComponent(place.name)}`

  return (
    <div className={`space-y-6 rounded-sm border border-border/80 bg-card/90 backdrop-blur-xl p-6 shadow-xl ${className}`}>
      {/* Header Info */}
      <div className="space-y-3 border-b border-border/60 pb-5">
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={place.category} />
          <div className="flex items-center gap-2">
            <FavoriteButton placeUuid={place.uuid} size="xs" />
            <motion.button
              type="button"
              variants={buttonPressVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              onClick={handleShare}
              className="flex items-center justify-center rounded-sm p-2 border border-border/80 bg-card/80 backdrop-blur-md text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/30 transition-colors shadow-xs"
              title="Share Place URL"
              aria-label="Share Place URL"
            >
              <Icon name="share" size="xs" />
            </motion.button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-heading text-foreground tracking-tight leading-tight">
          {place.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <RatingStars rating={place.avg_rating} totalReviews={place.total_reviews} />
          <span className="flex items-center gap-1">
            <Icon name="location" size="xs" />
            <span>{place.city}, {place.state || place.country || 'India'}</span>
          </span>
        </div>
      </div>

      {/* Quick Details List */}
      <div className="space-y-3 text-xs">
        {place.entry_fee && (
          <div className="flex items-center justify-between p-3 rounded-sm bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Icon name="bookmark" size="xs" />
              <span>Entry Fee</span>
            </span>
            <span className="font-mono font-bold text-foreground">{place.entry_fee}</span>
          </div>
        )}

        {place.best_time_to_visit && (
          <div className="flex items-center justify-between p-3 rounded-sm bg-muted/40 border border-border/60">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Icon name="sun" size="xs" />
              <span>Best Time to Visit</span>
            </span>
            <span className="font-mono font-bold text-amber-400">{place.best_time_to_visit}</span>
          </div>
        )}

        {place.address && (
          <div className="p-3 rounded-sm bg-muted/40 border border-border/60 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground">Physical Address</span>
            <p className="text-xs text-foreground font-medium">{place.address}</p>
          </div>
        )}
      </div>

      {/* Primary Action Controls */}
      <div className="pt-2 space-y-2.5">
        <Link to={directionsUrl} className="w-full block">
          <Button className="w-full h-11 px-4 text-xs sm:text-sm rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shadow-md hover:shadow-lg transition-all flex items-center justify-center">
            <Icon name="navigation" size="sm" />
            <span>Get Directions & Radar</span>
          </Button>
        </Link>

        <Link to={`/places/${place.slug || place.uuid}/photos`} className="w-full block">
          <Button variant="outline" className="w-full h-10 px-4 text-xs rounded-sm border-border bg-card/80 hover:bg-muted text-foreground font-semibold gap-2 transition-all flex items-center justify-center">
            <Icon name="gallery" size="xs" className="text-emerald-400" />
            <span>Explore HD Photo Gallery</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default PlaceInfoPanel
