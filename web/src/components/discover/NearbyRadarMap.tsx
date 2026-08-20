import React from 'react'
import type { Place } from '@/types/place'
import { PlaceMap } from '@/components/places/PlaceMap'
import { HugeiconsIcon } from '@hugeicons/react'
import { Navigation01Icon, Location01Icon } from '@hugeicons/core-free-icons'

interface NearbyRadarMapProps {
  userLocation: { lat: number; lng: number } | null
  places: Place[]
  radiusKm: number
  selectedPlaceUuid: string | null
  onSelectPlace: (uuid: string) => void
}

export const NearbyRadarMap: React.FC<NearbyRadarMapProps> = ({
  userLocation,
  places,
  radiusKm,
  selectedPlaceUuid,
  onSelectPlace,
}) => {
  const firstPlace = places[0]
  const mapCenterLat = userLocation?.lat ?? (firstPlace ? firstPlace.latitude : 13.6263)
  const mapCenterLng = userLocation?.lng ?? (firstPlace ? firstPlace.longitude : 74.6933)

  // Convert places to PlaceListItem format expected by PlaceMap
  const mapPlaces = places.map((p) => ({
    uuid: p.uuid,
    name: p.name,
    slug: p.slug,
    city: p.city || '',
    latitude: p.latitude,
    longitude: p.longitude,
    status: p.status || 'published',
    avg_rating: p.avg_rating || 4.5,
    rating: p.avg_rating || 4.5,
    total_reviews: p.total_reviews || 0,
    review_count: p.total_reviews || 0,
    total_favorites: p.total_favorites || 0,
    category: p.category,
    cover_image_url: p.images && p.images.length > 0 ? p.images[0].image_url : undefined,
  }))

  const selectedPlace = places.find((p) => p.uuid === selectedPlaceUuid)

  return (
    <div className="relative w-full h-[580px] rounded-sm border border-border overflow-hidden shadow-2xl bg-card flex flex-col justify-between p-4">
      {/* Header Telemetry Badge */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-2 rounded-sm bg-card/90 backdrop-blur-md px-3 py-1.5 border border-border text-xs font-mono text-emerald-400 shadow-lg">
        <HugeiconsIcon icon={Navigation01Icon} className="size-3.5 animate-spin text-emerald-400" />
        <span>Live GIS Radar • {radiusKm} km Sweep</span>
      </div>

      <div className="absolute top-6 right-16 z-20 rounded-sm bg-card/90 backdrop-blur-md px-3 py-1.5 border border-border text-xs font-mono text-foreground font-bold shadow-lg">
        {places.length} Locations Plotted
      </div>

      {/* MapLibre Interactive Canvas */}
      <div className="absolute inset-0 z-0">
        <PlaceMap
          latitude={selectedPlace ? selectedPlace.latitude : mapCenterLat}
          longitude={selectedPlace ? selectedPlace.longitude : mapCenterLng}
          userLocation={userLocation ? { latitude: userLocation.lat, longitude: userLocation.lng } : null}
          places={mapPlaces}
          selectedPlaceUuid={selectedPlaceUuid}
          onSelectPlace={(p) => onSelectPlace(p.uuid)}
          height="100%"
        />
      </div>

      {/* Bottom Coordinates Bar */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-card/90 backdrop-blur-md p-3 rounded-sm border border-border shadow-lg">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-emerald-400" />
          <span>Latitude: {userLocation ? userLocation.lat.toFixed(4) : (firstPlace ? firstPlace.latitude.toFixed(4) : '13.6263')}° N</span>
        </div>
        <span>Longitude: {userLocation ? userLocation.lng.toFixed(4) : (firstPlace ? firstPlace.longitude.toFixed(4) : '74.6933')}° E</span>
      </div>
    </div>
  )
}

export default NearbyRadarMap
