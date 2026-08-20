import React from 'react'
import type { DayPlan } from '@/services/api/aiApi'
import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Clock01Icon, Location01Icon, Route02Icon } from '@hugeicons/core-free-icons'

interface ItineraryTimelineViewProps {
  days: DayPlan[]
}

export const ItineraryTimelineView: React.FC<ItineraryTimelineViewProps> = ({ days }) => {
  return (
    <div className="space-y-6">
      {days.map((day) => (
        <div key={day.day} className="p-6 rounded-sm border border-border bg-card shadow-md space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <span className="rounded-sm bg-emerald-600 text-white font-mono font-bold text-xs px-3 py-1">
              Day {day.day}
            </span>
            <h3 className="text-base font-bold font-heading text-foreground">{day.title}</h3>
          </div>

          {/* Time Slot Timeline */}
          <div className="space-y-6 relative pl-5 border-l-2 border-emerald-500/40">
            {day.slots.map((slot, idx) => (
              <div key={idx} className="relative space-y-1.5 group">
                <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 group-hover:scale-125 transition-transform" />

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <HugeiconsIcon icon={Clock01Icon} className="size-3.5" />
                  <span>{slot.time}</span>
                </div>

                <h4 className="text-sm font-bold text-foreground">{slot.activity}</h4>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-foreground">{slot.location}</span>

                  {slot.place_uuid && (
                    <Link
                      to={`/places/${slot.place_uuid}`}
                      className="ml-auto inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 hover:underline"
                    >
                      <HugeiconsIcon icon={Route02Icon} className="size-3" />
                      <span>View Spot</span>
                    </Link>
                  )}
                </div>

                {slot.notes && (
                  <p className="text-[11px] text-muted-foreground italic font-mono bg-muted/30 p-2 rounded-sm border border-border/40">
                    💡 {slot.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ItineraryTimelineView
