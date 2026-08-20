import React, { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Icon } from '@/components/common/Icon'
import type { PlaceListItem } from '@/types/place'
import { toast } from 'sonner'

export interface PlaceMapProps {
  latitude: number
  longitude: number
  placeName?: string
  city?: string
  userLocation?: { latitude: number; longitude: number } | null
  places?: PlaceListItem[]
  selectedPlaceUuid?: string | null
  onSelectPlace?: (place: PlaceListItem) => void
  polylinePoints?: [number, number][]
  height?: string
  className?: string
}

export const PlaceMap: React.FC<PlaceMapProps> = ({
  latitude,
  longitude,
  placeName = 'Destination',
  city = '',
  userLocation,
  places = [],
  selectedPlaceUuid,
  onSelectPlace,
  polylinePoints,
  height = '100%',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [is3D, setIs3D] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    if (!mapContainerRef.current) return

    const getIsDark = () => document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('light')
    let isDark = getIsDark()

    const getStyleSpec = (dark: boolean): maplibregl.StyleSpecification => ({
      version: 8,
      sources: {
        'carto-tiles': {
          type: 'raster',
          tiles: dark
            ? [
                'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              ]
            : [
                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO',
        },
      },
      layers: [
        {
          id: 'carto-layer',
          type: 'raster',
          source: 'carto-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    })

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyleSpec(isDark),
      center: [longitude, latitude],
      zoom: 12,
    })

    // Listen to theme mutations (class toggles dark <-> light)
    const themeObserver = new MutationObserver(() => {
      const currentDark = getIsDark()
      if (currentDark !== isDark) {
        isDark = currentDark
        map.setStyle(getStyleSpec(isDark))
      }
    })

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })

    // User Location Pulsing Marker
    if (userLocation) {
      if (userMarkerRef.current) userMarkerRef.current.remove()
      const userEl = document.createElement('div')
      userEl.className = 'relative flex h-6 w-6 items-center justify-center cursor-pointer'
      userEl.innerHTML = `
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-lg"></span>
      `
      const userPopup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(
        '<div style="padding: 6px 10px; background: #18181b; color: #38bdf8; border: 1px solid #3f3f46; border-radius: 4px; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; box-shadow: 0 8px 20px rgba(0,0,0,0.6);">📍 Your Live GPS Location</div>'
      )
      const userMarker = new maplibregl.Marker({ element: userEl })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .setPopup(userPopup)
        .addTo(map)

      userMarkerRef.current = userMarker

      userEl.addEventListener('click', (e) => {
        e.stopPropagation()
        userMarker.togglePopup()
      })
    }

    // Destination Pin Marker or Multiple Places Markers
    if (places && places.length > 0) {
      const bounds = new maplibregl.LngLatBounds()

      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude])
      }

      places.forEach((p) => {
        if (p.longitude && p.latitude) {
          bounds.extend([p.longitude, p.latitude])
        }

        const isSelected = p.uuid === selectedPlaceUuid
        const primaryColor = isSelected ? '#10b981' : '#f59e0b'
        const innerColor = isSelected ? '#34d399' : '#fbbf24'
        const size = isSelected ? 36 : 30
        const height = isSelected ? 44 : 36

        const el = document.createElement('div')
        el.className = 'relative cursor-pointer flex items-center justify-center select-none'
        el.innerHTML = `
          <div style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6));">
            <svg width="${size}" height="${height}" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 0C8.50659 0 0 8.50659 0 19C0 31.5 19 46 19 46C19 46 38 31.5 38 19C38 8.50659 29.4934 0 19 0Z" fill="${primaryColor}"/>
              <circle cx="19" cy="18" r="11" fill="#18181b"/>
              <path d="M19 11C15.134 11 12 14.134 12 18C12 21.866 15.134 25 19 25C22.866 25 26 21.866 26 18C26 14.134 22.866 11 19 11ZM19 21.5C17.067 21.5 15.5 19.933 15.5 18C15.5 16.067 17.067 14.5 19 14.5C20.933 14.5 22.5 16.067 22.5 18C22.5 19.933 20.933 21.5 19 21.5Z" fill="${innerColor}"/>
            </svg>
          </div>
        `

        const popup = new maplibregl.Popup({ offset: [0, -36], closeButton: false }).setHTML(
          `<div style="padding: 8px 12px; background: #18181b; color: #f4f4f5; border: 1px solid #3f3f46; border-radius: 4px; font-family: system-ui, -apple-system, sans-serif; min-width: 130px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7);">
            <div style="font-weight: 700; font-size: 12px; color: #10b981; margin-bottom: 2px;">${p.name}</div>
            ${p.city ? `<div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: #a1a1aa; font-weight: 500;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${p.city}</span>
            </div>` : ''}
          </div>`
        )

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([p.longitude, p.latitude])
          .setPopup(popup)
          .addTo(map)

        el.addEventListener('mouseenter', () => {
          if (!popup.isOpen()) marker.togglePopup()
        })

        el.addEventListener('click', (e) => {
          e.stopPropagation()
          if (!popup.isOpen()) marker.togglePopup()
          if (onSelectPlace) {
            onSelectPlace(p)
          }
        })
      })

      // Auto fit bounds to enclose all plotted markers
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      }
    } else {
      // Single Target SVG Pin
      const el = document.createElement('div')
      el.className = 'relative cursor-pointer flex items-center justify-center select-none'
      el.innerHTML = `
        <div style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.6));">
          <svg width="38" height="46" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 0C8.50659 0 0 8.50659 0 19C0 31.5 19 46 19 46C19 46 38 31.5 38 19C38 8.50659 29.4934 0 19 0Z" fill="#10b981"/>
            <circle cx="19" cy="18" r="11" fill="#18181b"/>
            <path d="M19 11C15.134 11 12 14.134 12 18C12 21.866 15.134 25 19 25C22.866 25 26 21.866 26 18C26 14.134 22.866 11 19 11ZM19 21.5C17.067 21.5 15.5 19.933 15.5 18C15.5 16.067 17.067 14.5 19 14.5C20.933 14.5 22.5 16.067 22.5 18C22.5 19.933 20.933 21.5 19 21.5Z" fill="#34d399"/>
          </svg>
        </div>
      `

      const popup = new maplibregl.Popup({ offset: [0, -42], closeButton: false }).setHTML(
        `<div style="padding: 8px 12px; background: #18181b; color: #f4f4f5; border: 1px solid #3f3f46; border-radius: 4px; font-family: system-ui, -apple-system, sans-serif; min-width: 130px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7);">
          <div style="font-weight: 700; font-size: 12px; color: #10b981; margin-bottom: 2px;">${placeName}</div>
          ${city ? `<div style="display: flex; align-items: center; gap: 4px; font-size: 11px; color: #a1a1aa; font-weight: 500;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${city}</span>
          </div>` : ''}
        </div>`
      )

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map)

      // Open destination popup by default on single detail view
      marker.togglePopup()

      el.addEventListener('mouseenter', () => {
        if (!popup.isOpen()) marker.togglePopup()
      })

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        if (!popup.isOpen()) marker.togglePopup()
      })
    }

    // Polyline Route Layer
    if (polylinePoints && polylinePoints.length > 0) {
      map.on('load', () => {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: polylinePoints.map(([lat, lng]) => [lng, lat]),
            },
          },
        })

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#10b981',
            'line-width': 5,
            'line-opacity': 0.85,
          },
        })

        // Auto fit bounds around route
        const bounds = new maplibregl.LngLatBounds()
        polylinePoints.forEach(([lat, lng]) => bounds.extend([lng, lat]))
        map.fitBounds(bounds, { padding: 60, maxZoom: 15 })
      })
    }

    // Force map resize check to ensure 100% canvas rendering
    const resizeTimer = setTimeout(() => {
      map.resize()
    }, 150)

    mapRef.current = map

    return () => {
      clearTimeout(resizeTimer)
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }
      map.remove()
    }
  }, [latitude, longitude, placeName, city, userLocation, places, selectedPlaceUuid, onSelectPlace, polylinePoints])

  const handleZoomIn = () => mapRef.current?.zoomIn()
  const handleZoomOut = () => mapRef.current?.zoomOut()

  const handleToggle3D = () => {
    if (!mapRef.current) return
    const next3D = !is3D
    setIs3D(next3D)
    mapRef.current.easeTo({
      pitch: next3D ? 60 : 0,
      bearing: next3D ? -25 : 0,
      duration: 1000,
    })
  }

  const handleResetOrientation = () => {
    if (!mapRef.current) return
    setIs3D(false)
    mapRef.current.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 800,
    })
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude
        if (mapRef.current) {
          if (userMarkerRef.current) userMarkerRef.current.remove()

          const userEl = document.createElement('div')
          userEl.className = 'relative flex h-6 w-6 items-center justify-center cursor-pointer'
          userEl.innerHTML = `
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-lg"></span>
          `
          const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(
            '<div style="padding: 6px 10px; background: #18181b; color: #38bdf8; border: 1px solid #3f3f46; border-radius: 4px; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; box-shadow: 0 8px 20px rgba(0,0,0,0.6);">📍 Your Live GPS Location</div>'
          )
          const userMarker = new maplibregl.Marker({ element: userEl })
            .setLngLat([userLng, userLat])
            .setPopup(popup)
            .addTo(mapRef.current)

          userMarkerRef.current = userMarker

          userEl.addEventListener('click', (e) => {
            e.stopPropagation()
            userMarker.togglePopup()
          })

          mapRef.current.flyTo({
            center: [userLng, userLat],
            zoom: 14,
            pitch: is3D ? 60 : 0,
            essential: true,
          })
        }
        toast.success('Centered map on your current GPS location')
      },
      () => {
        setIsLocating(false)
        toast.error('Unable to retrieve current GPS location')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleRecenter = () => {
    if (places && places.length > 0 && mapRef.current) {
      const bounds = new maplibregl.LngLatBounds()
      if (userLocation) bounds.extend([userLocation.longitude, userLocation.latitude])
      places.forEach((p) => {
        if (p.longitude && p.latitude) bounds.extend([p.longitude, p.latitude])
      })
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14 })
        return
      }
    }

    if (userLocation) {
      mapRef.current?.flyTo({ center: [userLocation.longitude, userLocation.latitude], zoom: 13 })
    } else {
      mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 13 })
    }
  }

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-sm border border-border/80 overflow-hidden shadow-lg ${className}`}
    >
      <style>{`
        .maplibregl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 4px !important;
        }
        .maplibregl-popup-tip {
          border-top-color: #18181b !important;
          border-bottom-color: #18181b !important;
        }
      `}</style>
      <div ref={mapContainerRef} className="h-full w-full bg-card" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        {/* Fly to GPS Location */}
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={isLocating}
          className="flex h-9 w-9 items-center justify-center rounded-sm bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:bg-card hover:border-emerald-500/50 transition-all shadow-md"
          title="Fly to Current GPS Location"
        >
          {isLocating ? (
            <Icon name="loading" size="xs" spinning className="text-emerald-400" />
          ) : (
            <Icon name="location" size="xs" className="text-emerald-400" />
          )}
        </button>

        {/* 3D Perspective Toggle */}
        <button
          type="button"
          onClick={handleToggle3D}
          className={`flex h-9 w-9 items-center justify-center rounded-sm backdrop-blur-md border transition-all shadow-md font-mono text-xs font-black ${
            is3D
              ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20'
              : 'bg-card/90 border-border/80 text-foreground hover:bg-card hover:border-emerald-500/40'
          }`}
          title={is3D ? 'Reset to 2D Top-Down View' : 'Enable 3D Perspective Tilt'}
        >
          3D
        </button>

        {/* Reset Bearing & Orient North */}
        <button
          type="button"
          onClick={handleResetOrientation}
          className="flex h-9 w-9 items-center justify-center rounded-sm bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:bg-card hover:border-cyan-500/40 transition-all shadow-md"
          title="Reset Bearing & Orient North"
        >
          <Icon name="navigation" size="xs" className="text-cyan-400" />
        </button>

        {/* Recenter Bounds */}
        <button
          type="button"
          onClick={handleRecenter}
          className="flex h-9 w-9 items-center justify-center rounded-sm bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:bg-card hover:border-amber-500/40 transition-all shadow-md"
          title="Recenter Map Bounds"
        >
          <Icon name="refresh" size="xs" className="text-amber-400" />
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-sm bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:bg-card transition-all shadow-md font-bold text-base"
          title="Zoom In"
        >
          +
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-sm bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:bg-card transition-all shadow-md font-bold text-base"
          title="Zoom Out"
        >
          -
        </button>
      </div>
    </div>
  )
}

export default PlaceMap
