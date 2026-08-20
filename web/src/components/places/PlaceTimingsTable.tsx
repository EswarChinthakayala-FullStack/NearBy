import React from 'react'
import { Icon } from '@/components/common/Icon'

export interface PlaceTimingsTableProps {
  openingHours?: string
  className?: string
}

export const PlaceTimingsTable: React.FC<PlaceTimingsTableProps> = ({
  openingHours,
  className = '',
}) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const currentDayIndex = (new Date().getDay() + 6) % 7 // Monday = 0

  if (!openingHours || openingHours.trim() === '') {
    return (
      <div className={`rounded-sm border border-border bg-card p-5 text-center space-y-2 ${className}`}>
        <Icon name="clock" size="md" className="mx-auto text-muted-foreground/50" />
        <h4 className="text-xs font-bold text-foreground">Timings Unavailable</h4>
        <p className="text-[11px] text-muted-foreground">
          Official opening hours have not been registered for this venue yet.
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-sm border border-border bg-card overflow-hidden shadow-sm space-y-3 p-5 ${className}`}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Icon name="clock" size="xs" className="text-emerald-400" />
          <h3 className="font-bold text-xs font-heading uppercase text-foreground tracking-wider">
            Visiting Hours & Schedule
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Backend Telemetry
        </span>
      </div>

      <div className="space-y-1">
        {daysOfWeek.map((day, idx) => {
          const isToday = idx === currentDayIndex
          return (
            <div
              key={day}
              className={`flex items-center justify-between p-2 rounded-sm text-xs transition-colors ${
                isToday
                  ? 'bg-emerald-500/10 border border-emerald-500/30 font-bold text-foreground'
                  : 'text-muted-foreground hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{day}</span>
                {isToday && (
                  <span className="text-[9px] font-mono uppercase bg-emerald-500 text-zinc-950 font-black px-1.5 py-0.2 rounded">
                    Today
                  </span>
                )}
              </div>
              <span className={isToday ? 'text-emerald-400 font-mono' : 'font-mono'}>
                {openingHours}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlaceTimingsTable
