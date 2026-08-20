import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  Calendar01Icon,
  Location01Icon,
  MoneyBagIcon,
  ArrowRight01Icon,
  GridIcon,
  Menu01Icon,
  Search01Icon,
  Clock01Icon,
  Note01Icon,
} from '@hugeicons/core-free-icons'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSavedItineraries } from '@/hooks/useAIItinerary'
import { formatDate } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ViewMode = 'grid' | 'list'

export const TripsPage: React.FC = () => {
  const { data: itineraries = [], isLoading, isError } = useSavedItineraries()
  const [selectedItinerary, setSelectedItinerary] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItineraries = itineraries.filter((item: any) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const titleMatch = item.title?.toLowerCase().includes(q)
    const destMatch = item.destination?.toLowerCase().includes(q)
    return titleMatch || destMatch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Standardized Page Header */}
      <PageHeader
        title="My Trips & AI Itineraries"
        description="Manage your saved travel routes, multi-stop trips, and AI-generated itineraries."
        breadcrumbs={[{ label: 'My Account' }, { label: 'Trips & Routes' }]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Layout Switcher */}
            <div className="flex items-center bg-card border border-border p-0.5 rounded-sm">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="xs"
                onClick={() => setViewMode('grid')}
                className="h-7 px-2 text-xs gap-1 font-mono"
                title="Grid View (Columns)"
              >
                <HugeiconsIcon icon={GridIcon} className="size-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="xs"
                onClick={() => setViewMode('list')}
                className="h-7 px-2 text-xs gap-1 font-mono"
                title="List View (Rows)"
              >
                <HugeiconsIcon icon={Menu01Icon} className="size-3.5" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>

            <Link to="/user/ai-itinerary">
              <Button
                size="sm"
                className="h-9 px-4 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-2 shadow-xs transition-all"
              >
                <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                <span>Generate AI Itinerary</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      {itineraries.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <span className="text-xs font-mono text-muted-foreground">
            Total Saved Itineraries: <span className="font-bold text-emerald-400">{itineraries.length}</span>
          </span>

          <div className="relative w-full sm:w-72">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search saved trips by city or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-card border-border"
            />
          </div>
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4 max-w-5xl mx-auto'}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-sm border border-border/70 bg-card/60 animate-pulse p-6 space-y-4"
            >
              <div className="h-5 w-3/4 bg-muted rounded-xs" />
              <div className="h-4 w-1/2 bg-muted rounded-xs" />
              <div className="h-24 w-full bg-muted/60 rounded-xs" />
              <div className="h-9 w-full bg-muted rounded-xs mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (isError || filteredItineraries.length === 0) && (
        <EmptyState
          iconName="route"
          title={searchQuery ? 'No Matching Saved Trips' : 'No Saved Trips Yet'}
          description={
            searchQuery
              ? `No saved itineraries match "${searchQuery}".`
              : "You haven't saved any travel itineraries or multi-stop routes. Plan your next adventure with our AI Itinerary Planner!"
          }
          actionLabel="Plan New Adventure"
          onAction={() => (window.location.href = '/user/ai-itinerary')}
        />
      )}

      {/* Database Saved Itineraries List / Grid */}
      {!isLoading && !isError && filteredItineraries.length > 0 && (
        <div className="space-y-6">
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4 max-w-5xl mx-auto'
            }
          >
            {filteredItineraries.map((item: any) => {
              const itineraryData = item.itinerary_data || {}
              const days = itineraryData.daily_itinerary || itineraryData.days || []
              const totalDays = days.length || 1

              return (
                <div
                  key={item.uuid}
                  className="group rounded-sm border border-border/80 bg-card p-5 space-y-4 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Badges Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-xs border border-emerald-500/30">
                        {totalDays} Day{totalDays > 1 ? 's' : ''} Trip
                      </span>

                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium capitalize">
                        <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{item.destination}</span>
                      </span>
                    </div>

                    {/* Title Row */}
                    <h3 className="font-bold text-base sm:text-lg text-foreground font-heading group-hover:text-emerald-400 transition-colors line-clamp-1 capitalize">
                      {item.title || `${item.destination} Exploration`}
                    </h3>

                    {/* Budget & Dates Row */}
                    {(item.budget || item.travel_dates) && (
                      <div className="flex flex-wrap items-center gap-2">
                        {item.budget && (
                          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-xs border border-emerald-500/25 max-w-full min-w-0">
                            <HugeiconsIcon icon={MoneyBagIcon} className="size-3.5 shrink-0 text-emerald-400" />
                            <span className="truncate">{item.budget}</span>
                          </div>
                        )}

                        {item.travel_dates && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-1 rounded-xs border border-border/60">
                            <HugeiconsIcon icon={Calendar01Icon} className="size-3.5 text-teal-400 shrink-0" />
                            <span>{item.travel_dates}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Itinerary Preview Teaser Box */}
                    <div className="p-3 rounded-xs bg-muted/40 border border-border/60 text-xs text-muted-foreground space-y-1.5 font-mono">
                      <p className="font-bold text-foreground line-clamp-1">
                        {itineraryData.trip_title || item.title || `${item.destination} Tour`}
                      </p>
                      {days.slice(0, 2).map((day: any, idx: number) => (
                        <p key={idx} className="line-clamp-1 text-[11px]">
                          • <span className="text-emerald-400 font-semibold">Day {day.day || idx + 1}:</span> {day.theme || day.title || (day.slots?.[0]?.activity ?? 'Sightseeing')}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action Controls */}
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      Saved {formatDate(item.created_at)}
                    </span>

                    <Button
                      size="sm"
                      onClick={() => setSelectedItinerary(item)}
                      className="h-9 px-4 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 shadow-xs transition-all shrink-0"
                    >
                      <span>View Route</span>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Itinerary Detail Modal Dialog */}
      <Dialog open={Boolean(selectedItinerary)} onOpenChange={() => setSelectedItinerary(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6">
          {selectedItinerary && (
            <>
              {/* Modal Header */}
              <DialogHeader className="space-y-3 border-b border-border/60 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground capitalize">
                    {selectedItinerary.title || `${selectedItinerary.destination} Itinerary`}
                  </DialogTitle>
                </div>

                {/* Metadata Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded-sm bg-muted/40 border border-border/60 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase">Destination</span>
                    <p className="font-bold text-foreground capitalize truncate">{selectedItinerary.destination}</p>
                  </div>

                  {selectedItinerary.budget && (
                    <div className="p-2.5 rounded-sm bg-emerald-500/10 border border-emerald-500/30 space-y-0.5">
                      <span className="text-[10px] text-emerald-400 uppercase">Estimated Budget</span>
                      <p className="font-bold text-emerald-300 truncate">{selectedItinerary.budget}</p>
                    </div>
                  )}

                  {selectedItinerary.travel_dates && (
                    <div className="p-2.5 rounded-sm bg-muted/40 border border-border/60 space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase">Travel Dates</span>
                      <p className="font-bold text-teal-300 truncate">{selectedItinerary.travel_dates}</p>
                    </div>
                  )}

                  <div className="p-2.5 rounded-sm bg-muted/40 border border-border/60 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase">Saved On</span>
                    <p className="font-bold text-foreground truncate">{formatDate(selectedItinerary.created_at)}</p>
                  </div>
                </div>
              </DialogHeader>

              {/* Daily Schedule Detailed List */}
              <div className="space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                  <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
                  <span>Daily Schedule & Slot Breakdown</span>
                </h4>

                {(selectedItinerary.itinerary_data?.daily_itinerary || selectedItinerary.itinerary_data?.days || []).map(
                  (day: any, idx: number) => {
                    const slots = day.slots || day.activities || day.places || []
                    return (
                      <div key={idx} className="rounded-sm border border-border bg-card overflow-hidden shadow-xs space-y-3 p-5">
                        {/* Day Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                          <h5 className="font-bold text-sm text-foreground font-heading flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                              Day {day.day || idx + 1}
                            </span>
                            <span>{day.title || day.theme || 'Exploration'}</span>
                          </h5>

                          {day.estimated_cost && (
                            <span className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-xs border border-border/60">
                              Est: {day.estimated_cost}
                            </span>
                          )}
                        </div>

                        {/* Slots List */}
                        <div className="space-y-3 pt-1">
                          {slots.length > 0 ? (
                            slots.map((slot: any, slotIdx: number) => {
                              const time = slot.time || slot.slot || 'Schedule'
                              const activityName = slot.activity || slot.name || slot.place_name || slot
                              const location = slot.location || slot.place
                              const notes = slot.notes || slot.description

                              return (
                                <div key={slotIdx} className="p-3 rounded-sm bg-muted/30 border border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                  <div className="space-y-1 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-xs border border-emerald-500/20 shrink-0">
                                        <HugeiconsIcon icon={Clock01Icon} className="size-3" />
                                        <span>{time}</span>
                                      </span>

                                      <span className="font-bold text-foreground text-xs">{activityName}</span>
                                    </div>

                                    {location && (
                                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                                        <HugeiconsIcon icon={Location01Icon} className="size-3 text-emerald-400 shrink-0" />
                                        <span className="font-medium text-foreground/90">{location}</span>
                                      </p>
                                    )}

                                    {notes && (
                                      <p className="text-[11px] text-muted-foreground italic flex items-center gap-1 pt-0.5">
                                        <HugeiconsIcon icon={Note01Icon} className="size-3 text-muted-foreground/60 shrink-0" />
                                        <span>{notes}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No detailed slots provided for this day.</p>
                          )}
                        </div>
                      </div>
                    )
                  }
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItinerary(null)}
                  className="h-9 px-4 rounded-sm text-xs font-semibold"
                >
                  Close Detail
                </Button>
                <Link to="/user/ai-itinerary">
                  <Button
                    size="sm"
                    className="h-9 px-4 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5 shadow-xs"
                  >
                    <HugeiconsIcon icon={SparklesIcon} className="size-3.5" />
                    <span>Create Similar Trip</span>
                  </Button>
                </Link>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TripsPage
