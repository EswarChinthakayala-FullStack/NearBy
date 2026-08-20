import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/common/PageTransition'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces'
import { PlaceMap } from '@/components/places/PlaceMap'
import { NearbyPlacesList } from '@/components/places/NearbyPlacesList'
import { DirectionsPanel } from '@/components/places/DirectionsPanel'
import type { PlaceListItem } from '@/types/place'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

// Fallback Default Coordinates (Panaji, Goa)
const DEFAULT_LAT = 15.498
const DEFAULT_LNG = 73.834

export const NearbyPlacesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const radiusParam = parseInt(searchParams.get('radius') || '10', 10)

  const [radiusKm, setRadiusKm] = useState<number>(radiusParam)
  const [selectedPlace, setSelectedPlace] = useState<PlaceListItem | null>(null)

  const { coords, loading: geoLoading, permission, refreshLocation } = useGeolocation()

  const currentLat = coords?.latitude || DEFAULT_LAT
  const currentLng = coords?.longitude || DEFAULT_LNG

  // Update radius in URL
  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius)
    setSearchParams({ radius: newRadius.toString() })
  }

  const { data: nearbyPlaces = [] } = useNearbyPlaces(currentLat, currentLng, radiusKm)

  const activePlace = selectedPlace || (nearbyPlaces.length > 0 ? nearbyPlaces[0] : null)

  return (
    <PageTransition>
      <div className="relative h-[calc(100vh-4rem)] w-full bg-background overflow-hidden flex flex-col">
        <OfflineBanner />

        {/* Fullscreen Map Background */}
        <div className="absolute inset-0 z-0">
          <PlaceMap
            latitude={activePlace ? activePlace.latitude : currentLat}
            longitude={activePlace ? activePlace.longitude : currentLng}
            placeName={activePlace?.name || 'Your Location'}
            city={activePlace?.city || ''}
            userLocation={coords ? { latitude: coords.latitude, longitude: coords.longitude } : null}
            places={nearbyPlaces}
            selectedPlaceUuid={activePlace?.uuid}
            onSelectPlace={(p) => setSelectedPlace(p)}
            height="100%"
          />
        </div>

        {/* Floating Desktop Sidebar Panel */}
        <div className="hidden lg:flex absolute top-4 left-4 bottom-4 w-96 z-10 flex-col bg-card/90 backdrop-blur-2xl border border-border/80 rounded-sm shadow-2xl overflow-hidden">
          {/* Panel Header & Controls */}
          <div className="p-5 border-b border-border/60 space-y-4 shrink-0 bg-card/95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="location" size="xs" className="text-emerald-400" />
                <h2 className="text-base font-bold font-heading text-foreground">Nearby Radar</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshLocation}
                disabled={geoLoading}
                className="h-8 px-2.5 rounded-sm text-[11px] font-semibold gap-1"
              >
                <Icon name="refresh" size={12} spinning={geoLoading} />
                <span>GPS</span>
              </Button>
            </div>

            {/* Permission Warning Card if denied */}
            {permission === 'denied' && (
              <div className="p-3 rounded-sm border border-amber-500/30 bg-amber-500/10 text-xs space-y-1">
                <p className="font-bold text-amber-400">GPS Permission Blocked</p>
                <p className="text-[11px] text-muted-foreground">
                  Using default Panaji coordinates. Enable location permissions in browser settings for live GPS.
                </p>
              </div>
            )}

            {/* Radius Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-muted-foreground">Scan Radius</span>
              <div className="grid grid-cols-5 gap-1 text-xs font-mono font-bold">
                {[1, 5, 10, 25, 50].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRadiusChange(r)}
                    className={`py-1.5 rounded-sm border text-center transition-all ${
                      radiusKm === r
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                        : 'border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}k
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activePlace && (
              <DirectionsPanel
                originLat={currentLat}
                originLng={currentLng}
                destLat={activePlace.latitude}
                destLng={activePlace.longitude}
                destName={activePlace.name}
                onClose={() => setSelectedPlace(null)}
              />
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Found Spots ({nearbyPlaces.length})
                </h3>
              </div>
              <NearbyPlacesList
                places={nearbyPlaces}
                selectedPlaceUuid={activePlace?.uuid}
                onSelectPlace={(p) => setSelectedPlace(p)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Bottom Sheet Trigger */}
        <div className="lg:hidden absolute bottom-6 left-4 right-4 z-10">
          <Sheet>
            <SheetTrigger>
              <Button size="lg" className="w-full rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 shadow-xl">
                <Icon name="location" size="xs" />
                <span>Explore Nearby ({nearbyPlaces.length} Spots)</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl bg-card/95 backdrop-blur-2xl p-6 overflow-y-auto">
              <SheetHeader className="text-left space-y-1 pb-4 border-b border-border/60">
                <SheetTitle className="text-lg font-bold font-heading">Nearby Destinations</SheetTitle>
              </SheetHeader>

              <div className="py-4 space-y-6">
                {activePlace && (
                  <DirectionsPanel
                    originLat={currentLat}
                    originLng={currentLng}
                    destLat={activePlace.latitude}
                    destLng={activePlace.longitude}
                    destName={activePlace.name}
                    onClose={() => setSelectedPlace(null)}
                  />
                )}

                <NearbyPlacesList
                  places={nearbyPlaces}
                  selectedPlaceUuid={activePlace?.uuid}
                  onSelectPlace={(p) => setSelectedPlace(p)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </PageTransition>
  )
}

export default NearbyPlacesPage
