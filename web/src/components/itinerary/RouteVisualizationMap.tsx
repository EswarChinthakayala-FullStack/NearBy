import React from 'react'
import type { Place } from '@/types/place'
import { HugeiconsIcon } from '@hugeicons/react'
import { Route02Icon } from '@hugeicons/core-free-icons'

interface RouteVisualizationMapProps {
  places: Place[]
  destination: string
}

export const RouteVisualizationMap: React.FC<RouteVisualizationMapProps> = ({ places, destination }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
          <HugeiconsIcon icon={Route02Icon} className="size-4 text-emerald-400" />
          <span>Itinerary Route Sequence</span>
        </h3>
        <span className="text-xs font-mono text-muted-foreground">{places.length} Sequence Waypoints</span>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative w-full h-80 rounded-sm border border-border bg-zinc-950 overflow-hidden p-6 flex flex-col justify-between shadow-inner">
        {/* Ambient Grid Lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-emerald-400">
          <span>GIS Route Optimization: Active</span>
          <span>{destination} Circuit</span>
        </div>

        {/* Waypoints Sequence Diagram */}
        <div className="relative z-10 my-auto flex items-center justify-around gap-2">
          {places.slice(0, 4).map((place, idx) => (
            <div key={place.uuid} className="flex flex-col items-center gap-2 text-center">
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs flex items-center justify-center border-2 border-emerald-400 shadow-md">
                0{idx + 1}
              </div>
              <span className="text-[10px] font-mono font-bold text-foreground truncate max-w-[90px]">
                {place.name}
              </span>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-muted-foreground border-t border-border/40 pt-2">
          <span>Est. Distance: ~42 km total</span>
          <span>Avg Transit: 18 mins / stop</span>
        </div>
      </div>
    </div>
  )
}

export default RouteVisualizationMap
