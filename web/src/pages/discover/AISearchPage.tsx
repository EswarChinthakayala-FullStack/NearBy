import React, { useState } from 'react'
import { useAISearch } from '@/hooks/useAISearch'
import { useGeolocation } from '@/hooks/useGeolocation'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { AIChatPanel } from '@/components/discover/AIChatPanel'
import { PlaceRecommendationCard } from '@/components/discover/PlaceRecommendationCard'
import { AILoadingSequence } from '@/components/itinerary/AILoadingSequence'
import { EmptyState } from '@/components/common/EmptyState'
import type { AISearchResponseData } from '@/services/api/aiApi'
import { HugeiconsIcon } from '@hugeicons/react'
import { Location01Icon, Target01Icon, SparklesIcon } from '@hugeicons/core-free-icons'
import { toast } from 'sonner'

export const AISearchPage: React.FC = () => {
  const { coords, loading: geoLoading } = useGeolocation()
  const aiSearchMutation = useAISearch()
  const [result, setResult] = useState<AISearchResponseData | null>(null)

  const handleSearch = (query: string) => {
    aiSearchMutation.mutate(
      {
        query,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      },
      {
        onSuccess: (data) => {
          setResult(data)
          toast.success(`Found ${data.places.length} travel recommendations!`)
        },
        onError: (err) => {
          toast.error(err.message || 'AI Search request failed. Please try again.')
        },
      }
    )
  }

  return (
    <PageContainer>
      {/* Standardized Page Header */}
      <PageHeader
        title="AI Vector Search"
        description="Search tourist destinations using natural language prompts powered by live location intelligence & Mistral AI."
        breadcrumbs={[{ label: 'Discover' }, { label: 'AI Search' }]}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Live Location Telemetry Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-sm border border-border bg-card shadow-xs text-xs font-mono">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <HugeiconsIcon icon={Location01Icon} className="size-4 text-emerald-400" />
            <span>
              {geoLoading
                ? 'Acquiring GPS location telemetry...'
                : coords?.displayName || coords?.locationName || coords?.city || 'Current GPS Location'}
            </span>
          </div>
          {coords && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <HugeiconsIcon icon={Target01Icon} className="size-3 text-emerald-400" />
              <span>
                {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E ({coords.source?.toUpperCase()})
              </span>
            </div>
          )}
        </div>

        {/* Search Input Box */}
        <AIChatPanel onSearch={handleSearch} isLoading={aiSearchMutation.isPending} />

        {/* Loading Radar Scanner Animation */}
        {aiSearchMutation.isPending && (
          <div className="py-6 animate-in fade-in duration-300">
            <AILoadingSequence />
          </div>
        )}

        {/* Response Results Section */}
        {!aiSearchMutation.isPending && result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Summary Box */}
            <div className="p-6 rounded-sm border border-border bg-card shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                  <HugeiconsIcon icon={SparklesIcon} className="size-3.5" />
                  AI Intelligence Insights
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{result.places.length} Recommendations</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed font-mono">{result.summary}</p>

              <div className="flex flex-wrap gap-2 pt-2">
                {result.suggested_tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Place Recommendation Grid or Empty Fallback */}
            {result.places.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-base font-bold font-heading text-foreground">Matched Destinations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.places.map((place) => (
                    <PlaceRecommendationCard key={place.uuid} place={place} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Matching Destinations Found"
                description="Try expanding your search query or selecting a broader geographical radius."
              />
            )}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default AISearchPage
