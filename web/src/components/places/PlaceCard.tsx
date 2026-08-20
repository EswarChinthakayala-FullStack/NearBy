import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { RatingStars } from './RatingStars'
import { FavoriteButton } from './FavoriteButton'
import { CategoryBadge } from './CategoryBadge'
import type { PlaceListItem, Place } from '@/types/place'

export interface PlaceCardProps {
  place: PlaceListItem | Place
  distanceKm?: number
  isFavorited?: boolean
  variant?: 'grid' | 'list'
  className?: string
}

import { getImageUrl } from '@/utils/imageUtils'

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  distanceKm,
  isFavorited = false,
  variant = 'grid',
  className = '',
}) => {
  const rawCoverUrl = place.cover_image_url || ('images' in place && place.images?.[0]?.image_url)
  const coverUrl = getImageUrl(rawCoverUrl)

  if (variant === 'list') {
    return (
      <div
        className={`group rounded-sm border border-border/80 bg-card/90 backdrop-blur-xl overflow-hidden shadow-md hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col md:flex-row items-stretch ${className}`}
      >
        {/* Cover Image Header - Horizontal left column on md+ */}
        <div className="relative w-full md:w-72 aspect-[16/10] md:aspect-auto h-48 md:h-auto shrink-0 bg-muted overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={place.name}
              loading="lazy"
              className="h-full w-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 bg-muted/40">
              <Icon name="gallery" size="lg" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

          <div className="absolute top-3 left-3 z-10">
            <CategoryBadge category={place.category} />
          </div>

          <div className="absolute top-3 right-3 z-10 md:hidden">
            <FavoriteButton placeUuid={place.uuid} isFavorited={isFavorited} />
          </div>
        </div>

        {/* List Card Details - Right column */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <RatingStars rating={place.avg_rating} totalReviews={place.total_reviews} />
                {distanceKm !== undefined && (
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/30">
                    {distanceKm.toFixed(1)} km away
                  </span>
                )}
              </div>

              <div className="hidden md:block">
                <FavoriteButton placeUuid={place.uuid} isFavorited={isFavorited} />
              </div>
            </div>

            <h3 className="font-bold text-lg sm:text-xl text-foreground font-heading group-hover:text-emerald-400 transition-colors">
              {place.name}
            </h3>

            {'description' in place && place.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {place.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Icon name="location" size="xs" className="text-emerald-400 shrink-0" />
              <span>{place.city || 'India'}</span>
            </span>

            <Link to={`/places/${place.slug || place.uuid}`} className="w-full sm:w-auto">
              <Button
                size="sm"
                className="w-full sm:w-auto h-9 px-5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs gap-2 transition-all shadow-md"
              >
                <span>Explore Place</span>
                <Icon name="arrow-right" size="xs" className="transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group rounded-sm border border-border/80 bg-card/90 backdrop-blur-xl overflow-hidden shadow-md hover:border-emerald-500/50 hover:shadow-xl transition-all flex flex-col justify-between h-full ${className}`}
    >
      <div>
        {/* Cover Image Header with 16:10 aspect ratio */}
        <div className="relative aspect-[16/10] w-full bg-muted overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={place.name}
              loading="lazy"
              className="h-full w-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 bg-muted/40">
              <Icon name="gallery" size="lg" />
            </div>
          )}

          {/* Gradient overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

          {/* Floating Category Badge */}
          <div className="absolute top-3 left-3 z-10">
            <CategoryBadge category={place.category} />
          </div>

          {/* Floating Favorite Button */}
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton placeUuid={place.uuid} isFavorited={isFavorited} />
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <RatingStars rating={place.avg_rating} totalReviews={place.total_reviews} />
            {distanceKm !== undefined && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/30">
                {distanceKm.toFixed(1)} km
              </span>
            )}
          </div>

          <h3 className="font-bold text-base sm:text-lg text-foreground font-heading group-hover:text-emerald-400 transition-colors line-clamp-1">
            {place.name}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5 truncate">
              <Icon name="location" size="xs" className="text-emerald-400 shrink-0" />
              <span className="truncate">{place.city || 'India'}</span>
            </span>

            {'entry_fee' in place && place.entry_fee && (
              <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-sm border border-border/60 shrink-0">
                {place.entry_fee}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="p-4 pt-0">
        <Link to={`/places/${place.slug || place.uuid}`}>
          <Button
            size="sm"
            className="w-full h-9 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs gap-2 transition-all shadow-md"
          >
            <span>Explore Place</span>
            <Icon name="arrow-right" size="xs" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default PlaceCard
