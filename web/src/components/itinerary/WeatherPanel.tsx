import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Sun01Icon, Location01Icon } from '@hugeicons/core-free-icons'

interface WeatherPanelProps {
  destination: string
  weatherAdvisory: string
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ destination, weatherAdvisory }) => {
  return (
    <div className="p-6 rounded-sm border border-border bg-card shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Sun01Icon} className="size-4 text-amber-400" />
          <h3 className="text-base font-bold font-heading text-foreground">Destination Weather Forecast</h3>
        </div>
        <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
          <HugeiconsIcon icon={Location01Icon} className="size-3" />
          <span>{destination}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-3 rounded-sm border border-border bg-muted/20 space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase">Temperature</span>
          <p className="text-base font-black text-amber-400">27.5° C</p>
        </div>

        <div className="p-3 rounded-sm border border-border bg-muted/20 space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase">Condition</span>
          <p className="text-xs font-bold text-foreground truncate">Clear & Sunny</p>
        </div>

        <div className="p-3 rounded-sm border border-border bg-muted/20 space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase">Rain Chance</span>
          <p className="text-xs font-bold text-emerald-400">10% Low</p>
        </div>

        <div className="p-3 rounded-sm border border-border bg-muted/20 space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase">Daylight</span>
          <p className="text-[10px] font-bold text-muted-foreground">06:18 AM - 06:45 PM</p>
        </div>
      </div>

      <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
        💡 <strong>AI Weather Note:</strong> {weatherAdvisory}
      </div>
    </div>
  )
}

export default WeatherPanel
