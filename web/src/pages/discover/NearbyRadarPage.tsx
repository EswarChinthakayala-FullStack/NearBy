import React, { useState } from 'react'
import { useNearbyRadar } from '@/hooks/useNearbyRadar'
import { useBrowsePlaces } from '@/hooks/useBrowsePlaces'
import { useGeolocation } from '@/hooks/useGeolocation'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { NearbyRadarMap } from '@/components/discover/NearbyRadarMap'
import { NearbyRadarSidebar } from '@/components/discover/NearbyRadarSidebar'
import type { Place } from '@/types/place'

export const NearbyRadarPage: React.FC = () => {
  const { coords: geoCoords, refreshLocation } = useGeolocation()
  const [radiusKm, setRadiusKm] = useState(500)
  const [selectedPlaceUuid, setSelectedPlaceUuid] = useState<string | null>(null)

  const userLocation = geoCoords
    ? { lat: geoCoords.latitude, lng: geoCoords.longitude }
    : null

  // Query nearby spatial search with active user GPS / IP coordinates
  const { data: nearbyPlacesData } = useNearbyRadar({
    latitude: userLocation?.lat ?? 13.6263,
    longitude: userLocation?.lng ?? 74.6933,
    radius_km: radiusKm,
    limit: 30,
  })

  // Fallback to all published places if spatial radius yields 0 local matches
  const { data: fallbackPlacesData } = useBrowsePlaces({ limit: 30 })

  const nearbyPlaces: Place[] = Array.isArray(nearbyPlacesData)
    ? nearbyPlacesData
    : (nearbyPlacesData as any)?.data || []

  const fallbackPlaces: Place[] = fallbackPlacesData?.items || fallbackPlacesData?.data || []

  // Final places array (nearby matches or fallback published places)
  const places: Place[] = nearbyPlaces.length > 0 ? nearbyPlaces : fallbackPlaces

  return (
    <PageContainer>
      {/* Standardized Page Header */}
      <PageHeader
        title="Nearby Tourist Radar"
        description="Real-time GPS spatial search displaying nearby tourist destinations sorted by proximity."
        breadcrumbs={[{ label: 'Discover' }, { label: 'Nearby Radar' }]}
      />

      {/* Map & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <NearbyRadarMap
            userLocation={userLocation}
            places={places}
            radiusKm={radiusKm}
            selectedPlaceUuid={selectedPlaceUuid}
            onSelectPlace={setSelectedPlaceUuid}
          />
        </div>

        <div className="lg:col-span-4">
          <NearbyRadarSidebar
            places={places}
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
            selectedPlaceUuid={selectedPlaceUuid}
            onSelectPlace={setSelectedPlaceUuid}
            userLocation={geoCoords ? { lat: geoCoords.latitude, lng: geoCoords.longitude } : null}
            onRequestLocation={refreshLocation}
          />
        </div>
      </div>
    </PageContainer>
  )
}

export default NearbyRadarPage
