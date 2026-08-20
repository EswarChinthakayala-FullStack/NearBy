import React, { useState } from 'react'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { useDirections } from '@/hooks/useDirections'

export interface DirectionsPanelProps {
  originLat: number
  originLng: number
  destLat: number
  destLng: number
  destName: string
  onClose?: () => void
  className?: string
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  originLat,
  originLng,
  destLat,
  destLng,
  destName,
  onClose,
  className = '',
}) => {
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'transit'>('driving')
  const { data: route, isLoading, isError, refetch } = useDirections(originLat, originLng, destLat, destLng)

  const handleOpenExternalMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=${travelMode}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (isLoading) {
    return (
      <div className={`rounded-sm border border-border bg-card p-6 space-y-4 animate-pulse ${className}`}>
        <div className="h-6 w-1/3 rounded bg-muted" />
        <div className="h-16 w-full rounded bg-muted" />
        <div className="h-32 w-full rounded bg-muted" />
      </div>
    )
  }

  if (isError || !route) {
    return (
      <div className={`rounded-sm border border-border bg-card p-6 text-center space-y-3 ${className}`}>
        <Icon name="navigation" size="md" className="mx-auto text-muted-foreground/50" />
        <h4 className="text-sm font-bold text-foreground">Directions Unavailable</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Unable to calculate live routing steps for the selected coordinates.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-sm gap-2 text-xs font-semibold">
          <Icon name="refresh" size="xs" />
          <span>Retry Calculation</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={`rounded-sm border border-border/80 bg-card/90 backdrop-blur-xl p-6 space-y-6 shadow-xl ${className}`}>
      {/* Header & Travel Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base font-heading text-foreground">Route & Travel Directions</h3>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-sm text-muted-foreground hover:text-foreground sm:hidden"
              >
                <Icon name="close" size="xs" />
              </button>
            )}
          </div>
          <p className="text-xs text-emerald-400 font-semibold truncate max-w-xs">Navigating to {destName}</p>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/50 border border-border p-1 rounded-sm">
          {(['driving', 'walking', 'transit'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTravelMode(mode)}
              className={`rounded-sm px-3 py-1 text-xs font-mono capitalize transition-all ${
                travelMode === mode
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Distance & Time Stats */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-sm border border-border/60 bg-muted/30 p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">Total Distance</span>
          <div className="text-xl font-black font-heading text-emerald-400">
            {route.distance_km.toFixed(1)} km
          </div>
        </div>

        <div className="rounded-sm border border-border/60 bg-muted/30 p-3.5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">Est. Duration</span>
          <div className="text-xl font-black font-heading text-foreground">
            {Math.round(route.duration_mins)} mins
          </div>
        </div>
      </div>

      {/* External Navigation CTA Button */}
      <Button
        onClick={handleOpenExternalMaps}
        size="default"
        className="w-full rounded-sm bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2 text-xs shadow-md"
      >
        <Icon name="navigation" size="xs" />
        <span>Open in Google Maps</span>
      </Button>

      {/* Turn-by-Turn Steps */}
      {route.steps && route.steps.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-xs font-heading uppercase text-foreground tracking-wider">
            Turn-by-Turn Guidance
          </h4>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {route.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-sm border border-border/60 bg-muted/20 text-xs"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  {idx + 1}
                </span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">{step.instruction}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {step.distance_meters}m • {Math.round(step.duration_seconds / 60)} mins
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DirectionsPanel
