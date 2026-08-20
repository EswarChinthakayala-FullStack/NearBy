import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  useGenerateItinerary,
  useSaveItinerary,
  useSavedItineraries,
  useSavedItineraryByUuid,
} from '@/hooks/useAIItinerary'
import { useGeolocation } from '@/hooks/useGeolocation'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { ItineraryForm } from '@/components/itinerary/ItineraryForm'
import { AILoadingSequence } from '@/components/itinerary/AILoadingSequence'
import { AIReasoningPanel } from '@/components/itinerary/AIReasoningPanel'
import { ItineraryTimelineView } from '@/components/itinerary/ItineraryTimelineView'
import { RouteVisualizationMap } from '@/components/itinerary/RouteVisualizationMap'
import { BudgetAnalyticsChart } from '@/components/itinerary/BudgetAnalyticsChart'
import { PackingSuggestions } from '@/components/itinerary/PackingSuggestions'
import { WeatherPanel } from '@/components/itinerary/WeatherPanel'
import { SmartTravelTips } from '@/components/itinerary/SmartTravelTips'
import { EmergencyInfoPanel } from '@/components/itinerary/EmergencyInfoPanel'
import { ExportPrintModal } from '@/components/itinerary/ExportPrintModal'
import type { AIItineraryPayload, AIItineraryResponseData } from '@/services/api/aiApi'
import { HugeiconsIcon } from '@hugeicons/react'
import { Bookmark01Icon, Route02Icon } from '@hugeicons/core-free-icons'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { aiApi } from '@/services/api/aiApi'

export const AIItineraryPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const sharedId = searchParams.get('id')

  const generateMutation = useGenerateItinerary()
  const saveMutation = useSaveItinerary()
  const { data: savedItineraries, isLoading: savedLoading, refetch: refetchSaved } = useSavedItineraries()
  const { data: sharedItineraryData } = useSavedItineraryByUuid(sharedId)

  const [itinerary, setItinerary] = useState<AIItineraryResponseData | null>(null)
  const [lastPayload, setLastPayload] = useState<AIItineraryPayload | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [savedUuid, setSavedUuid] = useState<string | null>(sharedId)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  // Automatically load shared itinerary from URL query parameter ?id=...
  useEffect(() => {
    if (sharedItineraryData?.itinerary_data) {
      setItinerary(sharedItineraryData.itinerary_data)
      setIsSaved(true)
      setSavedUuid(sharedItineraryData.uuid)
      toast.success(`Loaded shared ${sharedItineraryData.destination} itinerary!`)
    }
  }, [sharedItineraryData])

  const saveItineraryToDb = (itin: AIItineraryResponseData) => {
    saveMutation.mutate(
      {
        destination: itin.destination,
        title: `${itin.destination} ${itin.recommended_duration} Trip`,
        budget: itin.estimated_cost,
        itinerary_data: itin,
        reasoning_data: itin.reasoning,
      },
      {
        onSuccess: (res) => {
          setIsSaved(true)
          setSavedUuid(res.uuid)
          refetchSaved()
        },
      }
    )
  }

  const { coords } = useGeolocation()

  const handleGenerate = (payload: AIItineraryPayload) => {
    const enrichedPayload = {
      ...payload,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    }
    setLastPayload(enrichedPayload)
    setIsSaved(false)
    generateMutation.mutate(enrichedPayload, {
      onSuccess: (data) => {
        setItinerary(data)
        saveItineraryToDb(data)
        toast.success(`Generated & saved ${data.destination} itinerary to database!`)
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to generate itinerary. Please try again.')
      },
    })
  }

  const handleSaveTrip = () => {
    if (!itinerary) return
    saveItineraryToDb(itinerary)
    toast.success('Travel itinerary saved to your account database!')
  }

  const handleExportPdf = async () => {
    if (!itinerary) return
    try {
      setIsExportingPdf(true)
      const blob = await aiApi.exportPdf(itinerary)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${itinerary.destination.toLowerCase().replace(/\s+/g, '_')}_itinerary.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Jinja2 PDF itinerary generated & downloaded successfully!')
    } catch {
      toast.error('Failed to generate Jinja2 PDF document.')
    } finally {
      setIsExportingPdf(false)
    }
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const savedList = savedItineraries || []

  return (
    <PageContainer>
      {/* Standardized Page Header */}
      <PageHeader
        title="AI Travel Itinerary Planner"
        description="Mistral AI travel architect constructing personalized day-by-day itineraries backed by verified database points of interest."
        breadcrumbs={[{ label: 'Discover' }, { label: 'AI Itinerary' }]}
      />

      <div className="space-y-8">
        {/* Saved Itineraries Section or Empty State */}
        <div className="space-y-4">
          {savedLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-sm" />
              ))}
            </div>
          ) : savedList.length > 0 ? (
            <div className="space-y-4 border border-border/80 bg-card/60 rounded-sm p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={Bookmark01Icon} className="size-4 text-emerald-400" />
                  <span>Saved Travel Itineraries ({savedList.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <HugeiconsIcon icon={Route02Icon} className="size-3.5" />
                  <span>+ Create New Itinerary</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedList.map((saved: any) => (
                  <div
                    key={saved.uuid}
                    className="p-3.5 rounded-sm border border-border bg-card hover:border-emerald-500/50 transition-all space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-foreground truncate">{saved.title || saved.destination}</h4>
                        <p className="text-[11px] text-muted-foreground">{saved.destination}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm shrink-0">
                        {saved.budget || 'Saved'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2 border-t border-border/60">
                      <span>{saved.created_at ? new Date(saved.created_at).toLocaleDateString() : 'Saved Trip'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (saved.itinerary_data) {
                            setItinerary(saved.itinerary_data)
                            toast.success(`Loaded ${saved.destination} itinerary!`)
                          }
                        }}
                        className="text-xs font-bold text-emerald-400 hover:underline"
                      >
                        Load Itinerary →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              variant="no-favorites"
              title="No Saved Travel Itineraries Yet"
              description="You haven't saved any AI travel plans yet. Configure your preferences below to generate your custom itinerary!"
              actionLabel="Create New Itinerary"
              onAction={scrollToForm}
            />
          )}
        </div>

        {/* Multi-Step Planner Form Anchor */}
        <div ref={formRef}>
          <ItineraryForm onSubmit={handleGenerate} isLoading={generateMutation.isPending} />
        </div>

        {/* Animated AI Loading Sequence */}
        {generateMutation.isPending && (
          <div className="py-8 animate-in fade-in duration-300">
            <AILoadingSequence />
          </div>
        )}

        {/* Generated Itinerary Output */}
        {itinerary && !generateMutation.isPending && (
          <div className="space-y-8 animate-in fade-in duration-500 border-t border-border pt-8">
            {/* Export & Save Action Toolbar */}
            <ExportPrintModal
              onSaveTrip={handleSaveTrip}
              onExportPdf={handleExportPdf}
              isSaving={saveMutation.isPending}
              isSaved={isSaved}
              isExportingPdf={isExportingPdf}
              savedUuid={savedUuid}
              destination={itinerary.destination}
            />

            {/* AI Reasoning Panel */}
            <AIReasoningPanel reasoning={itinerary.reasoning} />

            {/* Route Visualization Map */}
            <RouteVisualizationMap places={itinerary.places} destination={itinerary.destination} />

            {/* Day-by-Day Timeline View */}
            <ItineraryTimelineView days={itinerary.days} />

            {/* Budget Analytics Chart */}
            <BudgetAnalyticsChart
              estimatedCost={itinerary.estimated_cost}
              budgetTier={lastPayload?.budget || 'Moderate'}
            />

            {/* Weather Panel */}
            <WeatherPanel
              destination={itinerary.destination}
              weatherAdvisory={itinerary.weather_advisory}
            />

            {/* Packing Suggestions */}
            <PackingSuggestions items={itinerary.packing_checklist} />

            {/* Smart Travel Advice & Tips */}
            <SmartTravelTips tips={itinerary.tips} />

            {/* Emergency Information Contacts */}
            <EmergencyInfoPanel emergency={itinerary.emergency_contacts} />
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default AIItineraryPage
