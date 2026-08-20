import { useState, useEffect, useCallback } from 'react'
import axiosClient from '@/services/api/axiosClient'

export interface Coordinates {
  latitude: number
  longitude: number
  city?: string
  locationName?: string
  district?: string
  state?: string
  country?: string
  displayName?: string
  source?: 'gps' | 'ip'
}

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported'

export interface UseGeolocationResult {
  coords: Coordinates | null
  loading: boolean
  permission: PermissionState
  error: string | null
  refreshLocation: () => void
}

export const useGeolocation = (): UseGeolocationResult => {
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [permission, setPermission] = useState<PermissionState>('prompt')
  const [error, setError] = useState<string | null>(null)

  const reverseGeocodeBackend = async (lat: number, lng: number, source: 'gps' | 'ip') => {
    try {
      const resp = await axiosClient.get('/location/reverse', {
        params: { latitude: lat, longitude: lng },
      })
      const data = resp.data.data || resp.data
      setCoords({
        latitude: lat,
        longitude: lng,
        city: data.city || 'Current Location',
        locationName: data.location_name,
        district: data.district,
        state: data.state,
        country: data.country,
        displayName: data.display_name,
        source,
      })
    } catch {
      setCoords({
        latitude: lat,
        longitude: lng,
        city: 'Current Location',
        source,
      })
    }
  }

  const fetchIpLocation = useCallback(async () => {
    try {
      const res = await fetch('https://ipapi.co/json/')
      if (res.ok) {
        const data = await res.json()
        if (data.latitude && data.longitude) {
          await reverseGeocodeBackend(data.latitude, data.longitude, 'ip')
          setLoading(false)
          return
        }
      }
    } catch {
      // Ignore IP fetch error fallback
    }
    setLoading(false)
  }, [])

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermission('unsupported')
      setError('Browser geolocation is not supported on this device.')
      fetchIpLocation()
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setPermission('granted')
        await reverseGeocodeBackend(lat, lng, 'gps')
        setLoading(false)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermission('denied')
        }
        setError(err.message || 'Unable to retrieve high-accuracy GPS location.')
        fetchIpLocation()
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      }
    )
  }, [fetchIpLocation])

  useEffect(() => {
    refreshLocation()
  }, [refreshLocation])

  return {
    coords,
    loading,
    permission,
    error,
    refreshLocation,
  }
}

export default useGeolocation
