import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { RatingStars } from './RatingStars'
import { FavoriteButton } from './FavoriteButton'
import type { PlaceListItem } from '@/types/place'

export interface NearbyPlacesListProps {
  places: PlaceListItem[]
  selectedPlaceUuid?: string | null
  onSelectPlace: (place: PlaceListItem) => void
  className?: string
}

export const NearbyPlacesList: React.FC<NearbyPlacesListProps> = ({
  places,
  selectedPlaceUuid,
  onSelectPlace,
  className = '',
}) => {
  if (places.length === 0) {
    return (
      <div className="p-6 text-center space-y-2 text-muted-foreground">
        <Icon name="location" size="md" className="mx-auto opacity-50 text-emerald-400" />
        <p className="text-xs font-bold text-foreground">No Destinations in Scan Radius</p>
        <p className="text-[11px]">Try expanding your search radius to discover more spots.</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {places.map((place) => {
        const isSelected = place.uuid === selectedPlaceUuid

        return (
          <motion.div
            key={place.uuid}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectPlace(place)}
            className={`p-3.5 rounded-sm border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              isSelected
                ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30 shadow-md'
                : 'border-border/60 bg-card/60 hover:bg-card hover:border-border'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-14 w-14 rounded-sm bg-muted overflow-hidden shrink-0 border border-border/60">
                {place.cover_image_url ? (
                  <img src={place.cover_image_url} alt={place.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Icon name="gallery" size="xs" />
                  </div>
                )}
              </div>

              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-bold font-heading text-foreground truncate">{place.name}</h4>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Icon name="location" size="xs" />
                  <span className="truncate">{place.city || 'Nearby'}</span>
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <RatingStars value={place.avg_rating} readOnly size="sm" showScore />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <FavoriteButton placeUuid={place.uuid} size="xs" />
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border ${
                isSelected
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                  : 'bg-muted/40 text-emerald-400 border-emerald-500/30'
              }`}>
                {isSelected ? 'Active' : 'Select'}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default NearbyPlacesList
