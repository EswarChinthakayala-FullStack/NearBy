import React from 'react'
import { useParams } from 'react-router-dom'
import { Icon } from '@/components/common/Icon'
import { EmptyState } from '@/components/common/EmptyState'
import { usePlaceDetail } from '@/hooks/usePlaceDetail'
import useWikipediaDetails from '@/hooks/useWikipediaDetails'
import { PlaceGallery } from '@/components/places/PlaceGallery'
import { PlaceInfoPanel } from '@/components/places/PlaceInfoPanel'
import { PlaceTimingsTable } from '@/components/places/PlaceTimingsTable'
import { PlaceMap } from '@/components/places/PlaceMap'
import { ReviewList } from '@/components/reviews/ReviewList'

import { PageHeader } from '@/components/layout/PageHeader'
import { FavoriteButton } from '@/components/places/FavoriteButton'
import { toast } from 'sonner'

export const PlaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const uuidOrSlug = id || ''

  const { data: place, isLoading, isError, refetch } = usePlaceDetail(uuidOrSlug)
  const { data: wikiData } = useWikipediaDetails(uuidOrSlug)

  if (isLoading) {
    return (
      <div className="w-full space-y-6 py-4 animate-pulse">
        <div className="h-24 w-full rounded-sm bg-muted/40" />
        <div className="h-96 w-full rounded-sm bg-muted/40" />
      </div>
    )
  }

  if (isError || !place) {
    return (
      <div className="w-full py-6">
        <EmptyState
          variant="no-places"
          title="Place Not Found"
          description="The requested destination spot does not exist or has been removed from the location database."
          actionLabel="Back to Destinations"
          onAction={() => {
            window.location.href = '/places'
          }}
          secondaryActionLabel="Try Again"
          onSecondaryAction={() => refetch()}
        />
      </div>
    )
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Place location URL copied to clipboard!')
  }

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Standardized App PageHeader */}
      <PageHeader
        title={place.name}
        description={`${place.category?.name ? `#${place.category.name} • ` : ''}${place.city || ''}${place.state ? `, ${place.state}` : ''}`}
        breadcrumbs={[
          { label: 'Places', href: '/places' },
          { label: place.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <FavoriteButton placeUuid={place.uuid} size="sm" />
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/30 transition-colors shadow-xs"
              title="Share Place URL"
            >
              <Icon name="share" size="xs" />
              <span>Share</span>
            </button>
          </div>
        }
      />

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          {/* Photo Gallery */}
          <PlaceGallery
            images={place.images || undefined}
            coverImageUrl={place.cover_image_url || undefined}
            placeName={place.name}
            placeSlug={place.slug || place.uuid}
          />

          {/* Description & Overview */}
          <div className="rounded-sm border border-border/80 bg-card/80 backdrop-blur-xl p-6 space-y-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Icon name="info" size="xs" className="text-emerald-400" />
                <h2 className="text-xl font-bold font-heading text-foreground">Overview & Details</h2>
              </div>

              {wikiData?.wiki_url && (
                <a
                  href={wikiData.wiki_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <Icon name="external-link" size="xs" />
                  <span>Wikipedia Article</span>
                </a>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {wikiData?.summary || place.description || 'No detailed description recorded for this destination yet.'}
            </p>

            {(wikiData?.history || place.history) && (
              <div className="space-y-2 pt-4 border-t border-border/60">
                <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-1.5">
                  <Icon name="clock" size="xs" className="text-emerald-400" />
                  <span>Historical Background</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{wikiData?.history || place.history}</p>
              </div>
            )}
          </div>

          {/* Timings Schedule Table */}
          <PlaceTimingsTable openingHours={place.opening_hours || undefined} />

          {/* Spatial Map Libre GL Map */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="map" size="xs" className="text-emerald-400" />
              <h3 className="text-sm font-bold font-heading uppercase text-foreground">Location & Spatial Map</h3>
            </div>
            <PlaceMap
              latitude={place.latitude}
              longitude={place.longitude}
              placeName={place.name}
              city={place.city || ''}
              height="360px"
            />
          </div>

          {/* Traveler Reviews */}
          <div className="space-y-4 pt-4 border-t border-border/60">
            <h2 className="text-xl font-bold font-heading text-foreground">Traveler Reviews & Ratings</h2>
            <ReviewList
              placeUuid={place.uuid}
              avgRating={place.avg_rating}
              totalReviews={place.total_reviews}
            />
          </div>
        </div>

        {/* Right Sticky Info Panel Sidebar */}
        <div className="lg:col-span-4 sticky top-24">
          <PlaceInfoPanel place={place} />
        </div>
      </div>
    </div>
  )
}

export default PlaceDetailPage
