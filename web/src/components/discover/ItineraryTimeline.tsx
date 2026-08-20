import React from 'react'
import type { AIItineraryResponseData } from '@/services/api/aiApi'
import { HugeiconsIcon } from '@hugeicons/react'
import { Clock01Icon, Location01Icon, CheckmarkSquare01Icon, Sun01Icon } from '@hugeicons/core-free-icons'

interface ItineraryTimelineProps {
  itinerary: AIItineraryResponseData
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({ itinerary }) => {
  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-sm border border-border bg-card space-y-1">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Target Destination</span>
          <p className="text-sm font-black text-foreground truncate">{itinerary.destination}</p>
        </div>
        <div className="p-4 rounded-sm border border-border bg-card space-y-1">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Estimated Budget</span>
          <p className="text-sm font-black text-emerald-400 truncate">{itinerary.estimated_cost}</p>
        </div>
        <div className="p-4 rounded-sm border border-border bg-card space-y-1">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">Weather Advisory</span>
          <p className="text-sm font-black text-amber-400 truncate flex items-center gap-1">
            <HugeiconsIcon icon={Sun01Icon} className="size-3.5" />
            <span>{itinerary.weather_advisory}</span>
          </p>
        </div>
      </div>

      {/* Days Timeline */}
      <div className="space-y-6">
        {itinerary.days.map((day) => (
          <div key={day.day} className="p-6 rounded-sm border border-border bg-card shadow-md space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="rounded-sm bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5">
                Day {day.day}
              </span>
              <h3 className="text-base font-bold font-heading text-foreground">{day.title}</h3>
            </div>

            {/* Time Slot Items */}
            <div className="space-y-4 relative pl-4 border-l-2 border-emerald-500/30">
              {day.slots.map((slot, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                    <HugeiconsIcon icon={Clock01Icon} className="size-3.5" />
                    <span>{slot.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground">{slot.activity}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <HugeiconsIcon icon={Location01Icon} className="size-3 text-muted-foreground" />
                    <span>{slot.location}</span>
                  </div>
                  {slot.notes && <p className="text-[11px] text-muted-foreground/80 italic">{slot.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Packing Checklist */}
      <div className="p-6 rounded-sm border border-border bg-card space-y-3">
        <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4" />
          <span>Recommended Travel Packing Checklist</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {itinerary.packing_checklist.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-sm border border-border bg-muted/40 text-xs font-mono text-foreground"
            >
              ✓ {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ItineraryTimeline
