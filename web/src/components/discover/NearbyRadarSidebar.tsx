import React from 'react'
import type { Place } from '@/types/place'
import { HugeiconsIcon } from '@hugeicons/react'
import { Location01Icon, StarIcon, Route02Icon } from '@hugeicons/core-free-icons'
import { Link } from 'react-router-dom'

interface NearbyRadarSidebarProps {
  places: Place[]
  radiusKm: number
  onRadiusChange: (radius: number) => void
  selectedPlaceUuid: string | null
  onSelectPlace: (uuid: string) => void
  userLocation: { lat: number; lng: number } | null
  onRequestLocation: () => void
}

export const NearbyRadarSidebar: React.FC<NearbyRadarSidebarProps> = ({
  places,
  radiusKm,
  onRadiusChange,
  selectedPlaceUuid,
  onSelectPlace,
  userLocation,
  onRequestLocation,
}) => {
  return (
    <div className="flex flex-col h-[580px] rounded-sm border border-border bg-card shadow-md p-4 space-y-4">
      {/* Header & Radar Radius Control */}
      <div className="space-y-3 border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-1.5">
            <HugeiconsIcon icon={Location01Icon} className="size-4 text-emerald-400" />
            <span>Nearby Spatial Radar</span>
          </h3>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
            {places.length} Matches
          </span>
        </div>

        {/* GPS Sensor Status / Refresh Button */}
        <button
          type="button"
          onClick={onRequestLocation}
          className="w-full h-8 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
        >
          <HugeiconsIcon icon={Location01Icon} className="size-3.5" />
          <span>{userLocation ? 'GPS Location Acquired (Click to Refresh)' : 'Auto-Fetch Current Location'}</span>
        </button>

        {/* Radius Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>Scan Radius Sweep</span>
            <span className="font-bold text-emerald-400">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min={5}
            max={2000}
            step={5}
            value={radiusKm}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Places Scrollable List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
        {places.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-xs text-muted-foreground">No destinations found within {radiusKm}km radius.</p>
            <button
              type="button"
              onClick={() => onRadiusChange(1000)}
              className="text-xs font-bold text-emerald-400 hover:underline"
            >
              Expand radius to 1,000 km
            </button>
          </div>
        ) : (
          places.map((place) => {
            const isSelected = place.uuid === selectedPlaceUuid

            return (
              <div
                key={place.uuid}
                onClick={() => onSelectPlace(place.uuid)}
                className={`p-3 rounded-sm border transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                    : 'border-border bg-card/60 hover:bg-muted/50 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-foreground truncate">{place.name}</h4>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 shrink-0">
                    <HugeiconsIcon icon={StarIcon} className="size-3 fill-amber-400" />
                    <span>{place.avg_rating || '4.5'}</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground truncate">{place.city}</p>

                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1">
                  {place.distance_km !== undefined && place.distance_km !== null ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">
                      {place.distance_km.toFixed(1)} km away
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">Open Today</span>
                  )}
                  <Link
                    to={`/places/${place.slug || place.uuid}`}
                    className="flex items-center gap-1 text-emerald-400 hover:underline font-bold"
                  >
                    <HugeiconsIcon icon={Route02Icon} className="size-3" />
                    <span>Details</span>
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default NearbyRadarSidebar
