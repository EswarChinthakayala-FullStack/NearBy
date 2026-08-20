import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCategoryBySlug } from '@/hooks/useCategory'
import { useBrowsePlaces } from '@/hooks/useBrowsePlaces'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PlaceCard } from '@/components/places/PlaceCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import type { Place } from '@/types/place'

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: category, isLoading: catLoading } = useCategoryBySlug(slug || '')

  const { data: placesData, isLoading: placesLoading } = useBrowsePlaces({
    category_id: typeof category?.id === 'number' ? category.id : undefined,
    category_slug: slug,
    limit: 20,
  })

  const rawPlaces: Place[] = placesData?.items || placesData?.data || []
  const places = rawPlaces.filter((p) => {
    if (!category) return true
    return p.category_id === category.id || p.category?.slug?.toLowerCase() === slug?.toLowerCase()
  })

  if (catLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full rounded-sm" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-sm" />
            ))}
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!category) {
    return (
      <PageContainer>
        <EmptyState
          variant="no-places"
          title="Category Not Found"
          description="The requested taxonomy category slug does not exist or has been removed."
          actionLabel="Explore Categories"
          onAction={() => navigate('/categories')}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Standardized App PageHeader */}
      <PageHeader
        title={`${category.name} Destinations`}
        description={category.description || `Hand-curated ${category.name.toLowerCase()} spots, landmarks, and points of interest.`}
        breadcrumbs={[
          { label: 'Categories', href: '/categories' },
          { label: category.name },
        ]}
      />

      {/* Places Grid or Empty State */}
      <div className="space-y-6 pt-2">
        {placesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-sm" />
            ))}
          </div>
        ) : places.length === 0 ? (
          <EmptyState
            variant="no-places"
            title={`No ${category.name} Spots Found`}
            description={`We do not have any verified tourist spots registered under the ${category.name} category yet.`}
            actionLabel="Explore All Categories"
            onAction={() => navigate('/categories')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {places.map((place: Place) => (
              <PlaceCard key={place.uuid} place={place} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default CategoryDetailPage
