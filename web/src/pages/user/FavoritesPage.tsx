import React, { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  GridIcon,
  Menu01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlaceCardSkeleton } from '@/components/common/SkeletonLoader'
import { EmptyState } from '@/components/common/EmptyState'
import { useFavorites } from '@/hooks/useFavorites'
import { PlaceCard } from '@/components/places/PlaceCard'
import type { Favorite } from '@/types/favorite'

type ViewMode = 'grid' | 'list'

export const FavoritesPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data: favoritesResponse, isLoading, isError } = useFavorites(page, 12)

  const favorites = favoritesResponse?.data || []
  const pagination = favoritesResponse?.pagination

  // Extract unique category names from favorites
  const categories = Array.from(
    new Set(
      favorites
        .map((f: Favorite) => f.place?.category?.name)
        .filter((c): c is string => Boolean(c))
    )
  )

  const filteredFavorites = favorites.filter((fav: Favorite) => {
    const place = fav.place
    if (!place) return false

    if (selectedCategory !== 'all' && place.category?.name !== selectedCategory) {
      return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const nameMatch = place.name.toLowerCase().includes(q)
      const cityMatch = place.city?.toLowerCase().includes(q)
      return nameMatch || cityMatch
    }

    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Standardized Page Header */}
      <PageHeader
        title="Saved Destinations & Bookmarks"
        description="Your bookmarked tourist destinations, historical spots, and preferred landmarks."
        breadcrumbs={[{ label: 'My Account' }, { label: 'Favorites' }]}
        actions={
          <div className="flex items-center gap-2">
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
                title="List View (Single Row)"
              >
                <HugeiconsIcon icon={Menu01Icon} className="size-3.5" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold shadow-xs'
                : 'bg-card/60 hover:bg-card border border-border/70 text-muted-foreground hover:text-foreground'
            }`}
          >
            All Destinations ({favorites.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold shadow-xs'
                  : 'bg-card/60 hover:bg-card border border-border/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search saved spots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-card border-border"
            />
          </div>

          {pagination && (
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Total: <span className="font-bold text-foreground">{pagination.total_items}</span>
            </span>
          )}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4 max-w-5xl mx-auto'
          }
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (isError || filteredFavorites.length === 0) && (
        <EmptyState
          iconName="favorite"
          title={searchQuery ? 'No Matching Saved Spots' : 'No Saved Bookmarks Yet'}
          description={
            searchQuery
              ? `No bookmarked places match "${searchQuery}".`
              : "You haven't bookmarked any tourist places. Explore destinations and tap the heart icon to save them!"
          }
          actionLabel="Discover Destination Spots"
          onAction={() => (window.location.href = '/places')}
        />
      )}

      {/* Favorites Display Grid / List */}
      {!isLoading && !isError && filteredFavorites.length > 0 && (
        <div className="space-y-6">
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4 max-w-5xl mx-auto'
            }
          >
            {filteredFavorites.map((fav: Favorite) => {
              const place = fav.place
              if (!place) return null
              return (
                <PlaceCard
                  key={place.uuid}
                  place={place}
                  isFavorited={true}
                  variant={viewMode}
                />
              )
            })}
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground font-mono">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-sm text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                  disabled={page >= pagination.total_pages}
                  className="rounded-sm text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FavoritesPage
