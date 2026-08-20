import React, { useState } from 'react'
import { useBrowsePlaces } from '@/hooks/useBrowsePlaces'
import { useCategories } from '@/hooks/useCategory'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { BrowseHeader } from '@/components/discover/BrowseHeader'
import { BrowseFilters } from '@/components/discover/BrowseFilters'
import { PlaceCard } from '@/components/places/PlaceCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Place } from '@/types/place'

export const BrowsePlacesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: categoriesData } = useCategories()
  const categories = categoriesData || []

  const { data, isLoading } = useBrowsePlaces({
    query: searchQuery || undefined,
    category_id: selectedCategoryId || undefined,
    city: selectedCity || undefined,
    min_rating: minRating > 0 ? minRating : undefined,
    sort_by: sortBy,
  })

  const places: Place[] = data?.items || data?.data || []
  const totalCount = data?.total || places.length

  const handleReset = () => {
    setSearchQuery('')
    setSelectedCategoryId(null)
    setSelectedCity('')
    setMinRating(0)
    setSortBy('newest')
  }

  return (
    <PageContainer>
      {/* Standardized Page Header */}
      <PageHeader
        title="Browse Places"
        description="Search, filter, and discover verified tourist destinations, historical landmarks, and scenic spots."
        breadcrumbs={[{ label: 'Discover' }, { label: 'Browse Places' }]}
      />

      {/* Header Controls */}
      <BrowseHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={totalCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Filter Toolbar */}
      <BrowseFilters
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        minRating={minRating}
        onRatingChange={setMinRating}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleReset}
      />

      {/* Grid or List Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-sm" />
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-16 space-y-3 rounded-sm border border-border bg-card">
          <p className="text-sm font-bold text-foreground">No destinations found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your filters or search keywords.</p>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {places.map((place: Place) => (
            <PlaceCard key={place.uuid} place={place} variant={viewMode === 'list' ? 'list' : 'grid'} />
          ))}
        </div>
      )}
    </PageContainer>
  )
}

export default BrowsePlacesPage
