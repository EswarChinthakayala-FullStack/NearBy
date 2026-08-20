import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePlaces } from '@/hooks/usePlaces'
import { useCategories } from '@/hooks/useCategories'
import { SearchBar } from '@/components/common/SearchBar'
import { Pagination } from '@/components/common/Pagination'
import { EmptyState } from '@/components/common/EmptyState'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { PageTransition } from '@/components/common/PageTransition'
import { PlaceCardSkeleton } from '@/components/common/SkeletonLoader'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import { FilterSidebar } from '@/components/places/FilterSidebar'
import { MobileFilterSheet } from '@/components/places/MobileFilterSheet'
import { ResultsSummary } from '@/components/places/ResultsSummary'
import { SortDropdown, type SortOption } from '@/components/places/SortDropdown'
import type { FilterValues } from '@/components/places/PlaceFilters'
import type { Place } from '@/types/place'

export const PlacesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse URL Search Parameters (Single Source of Truth)
  const searchQuery = searchParams.get('q') || ''
  const categoryIdParam = searchParams.get('category_id')
  const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined
  const city = searchParams.get('city') || ''
  const minRatingParam = searchParams.get('min_rating')
  const minRating = minRatingParam ? parseFloat(minRatingParam) : undefined
  const pageParam = searchParams.get('page')
  const page = pageParam ? parseInt(pageParam, 10) : 1
  const sort = (searchParams.get('sort') as SortOption) || 'rating-desc'

  // Helper to update search params
  const updateSearchParams = (newParams: Record<string, string | undefined>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(newParams).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          next.set(key, val)
        } else {
          next.delete(key)
        }
      })
      return next
    })
  }

  // Handle Search Input Change
  const handleSearchChange = (query: string) => {
    updateSearchParams({ q: query || undefined, page: '1' })
  }

  // Handle Filter State Change
  const handleFilterChange = (newFilters: FilterValues) => {
    updateSearchParams({
      category_id: newFilters.categoryId ? String(newFilters.categoryId) : undefined,
      city: newFilters.city || undefined,
      min_rating: newFilters.minRating ? String(newFilters.minRating) : undefined,
      page: '1',
    })
  }

  // Handle Clear Filters
  const handleClearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('q')
      next.delete('category_id')
      next.delete('city')
      next.delete('min_rating')
      next.set('page', '1')
      return next
    })
  }

  // Handle Remove Individual Filter Tag
  const handleRemoveFilter = (key: keyof FilterValues) => {
    if (key === 'categoryId') updateSearchParams({ category_id: undefined, page: '1' })
    if (key === 'city') updateSearchParams({ city: undefined, page: '1' })
    if (key === 'minRating') updateSearchParams({ min_rating: undefined, page: '1' })
  }

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: String(newPage) })
  }

  // Handle Sort Change
  const handleSortChange = (newSort: SortOption) => {
    updateSearchParams({ sort: newSort })
  }

  // TanStack Query Hooks
  const { data: placesResponse, isLoading, isError, refetch } = usePlaces({
    query: searchQuery || undefined,
    category_id: categoryId,
    city: city || undefined,
    min_rating: minRating,
    page,
    page_size: 12,
  })

  const { data: categories = [] } = useCategories()

  const places: Place[] = useMemo(() => {
    const rawPlaces = placesResponse?.data || []
    const copy = [...rawPlaces] as Place[]

    if (sort === 'rating-desc') {
      copy.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
    } else if (sort === 'reviews-desc') {
      copy.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0))
    } else if (sort === 'name-asc') {
      copy.sort((a, b) => a.name.localeCompare(b.name))
    }

    return copy
  }, [placesResponse, sort])

  const pagination = placesResponse?.pagination

  const activeFilterCount =
    (categoryId !== undefined ? 1 : 0) + (city ? 1 : 0) + (minRating !== undefined ? 1 : 0)

  const activeFilters: FilterValues = {
    categoryId,
    city,
    minRating,
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <OfflineBanner />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header & Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
              Explore Destinations
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Search verified regional tourist attractions, historical landmarks, coastal spots, and cultural venues with real-time location telemetry.
            </p>
          </div>

          {/* Search Bar & Mobile Filter Trigger Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search spots by name, monument, or keyword..."
              className="flex-1"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
              <MobileFilterSheet
                categories={categories}
                filters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                activeFilterCount={activeFilterCount}
                className="lg:hidden"
              />
              <SortDropdown value={sort} onChange={handleSortChange} />
            </div>
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Left Sidebar Filters */}
            <div className="hidden lg:block lg:col-span-3 sticky top-24">
              <FilterSidebar
                categories={categories}
                filters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Right Main Results Section */}
            <div className="lg:col-span-9 space-y-6">
              {/* Results Summary Header */}
              {pagination && (
                <ResultsSummary
                  totalItems={pagination.total_items}
                  searchQuery={searchQuery}
                  filters={activeFilters}
                  onRemoveFilter={handleRemoveFilter}
                />
              )}

              {/* Loading Skeletons */}
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <PlaceCardSkeleton key={`place-skel-${i}`} />
                  ))}
                </div>
              )}

              {/* Error State */}
              {isError && (
                <EmptyState
                  variant="no-results"
                  title="Unable to Load Places"
                  description="Failed to communicate with the location backend service. Please check your network connection."
                  actionLabel="Retry Request"
                  onAction={() => refetch()}
                />
              )}

              {/* Empty State */}
              {!isLoading && !isError && places.length === 0 && (
                <EmptyState
                  variant="no-places"
                  title="No Destination Spots Found"
                  description="No tourist places match your active search filters or location parameters."
                  actionLabel="Reset Search Filters"
                  onAction={handleClearFilters}
                />
              )}

              {/* Places Grid */}
              {!isLoading && !isError && places.length > 0 && (
                <PlaceGrid places={places} />
              )}

              {/* Pagination Controls */}
              {pagination && pagination.total_pages > 1 && (
                <div className="pt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={pagination.total_pages}
                    totalItems={pagination.total_items}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}

export default PlacesListPage
