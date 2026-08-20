import React from 'react'
import { Map, MapMarker, MarkerContent, MarkerTooltip, MarkerPopup, MapControls } from '@/components/ui/map'
import { Icon } from '@/components/common/Icon'

export interface MapPin {
  id: number
  name: string
  category: string
  rating: number
  x: number
  y: number
  lat: number
  lng: number
}

export const InteractiveMapSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  const pins: MapPin[] = [
    { id: 1, name: 'Aguada Fort & Lighthouse', category: 'Historic Monument', rating: 4.8, x: 280, y: 140, lat: 15.4925, lng: 73.7738 },
    { id: 2, name: 'Calangute Beach', category: 'Coastal & Watersports', rating: 4.6, x: 180, y: 90, lat: 15.5438, lng: 73.7553 },
    { id: 3, name: 'Basilica of Bom Jesus', category: 'UNESCO Heritage Site', rating: 4.9, x: 380, y: 220, lat: 15.5009, lng: 73.9116 },
    { id: 4, name: 'Fontainhas Latin Quarter', category: 'Heritage & Culture', rating: 4.7, x: 480, y: 160, lat: 15.4989, lng: 73.834 },
    { id: 5, name: 'Dudhsagar Waterfalls', category: 'Nature & Wildlife', rating: 4.9, x: 580, y: 260, lat: 15.3144, lng: 74.3144 },
  ]

  return (
    <div className={`relative w-full overflow-hidden rounded-sm border border-border/80 bg-card shadow-xl p-4 ${className}`}>
      {/* Top Map Toolbar Header */}
      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-foreground">Interactive Regional Map</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">Live Interactive GIS • 5 Locations</span>
      </div>

      {/* Mapcn Map View */}
      <div className="relative h-[420px] w-full rounded-sm border border-border overflow-hidden">
        <Map
          className="h-full w-full"
          center={[73.834, 15.498]}
          zoom={10.5}
        >
          {pins.map((pin) => (
            <MapMarker key={pin.id} longitude={pin.lng} latitude={pin.lat}>
              <MarkerContent>
                <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground font-bold text-xs shadow-md border border-white/40 hover:scale-110 transition-transform">
                  {pin.id}
                </div>
              </MarkerContent>
              <MarkerTooltip>
                <span className="flex items-center gap-1">
                  {pin.name} • <Icon name="star" size="xs" className="text-amber-400" /> {pin.rating}
                </span>
              </MarkerTooltip>
              <MarkerPopup closeButton>
                <div className="space-y-1 p-1">
                  <span className="text-[10px] font-bold uppercase text-primary font-mono">{pin.category}</span>
                  <p className="text-xs font-bold text-foreground">{pin.name}</p>
                  <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                    <Icon name="star" size="xs" /> {pin.rating} Rating
                  </p>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
          <MapControls position="bottom-right" showZoom showCompass />
        </Map>
      </div>
    </div>
  )
}
