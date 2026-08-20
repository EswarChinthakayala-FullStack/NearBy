import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/common/Icon'
import { getCategoryIcon } from '@/lib/CategoryIconMapper'
import type { Category } from '@/types/category'

export interface FilterValues {
  categoryId?: number | string
  city?: string
  minRating?: number
}

export interface PlaceFiltersProps {
  categories: Category[]
  filters: FilterValues
  onFilterChange: (newFilters: FilterValues) => void
  onClearFilters: () => void
  className?: string
}

export const PlaceFilters: React.FC<PlaceFiltersProps> = ({
  categories,
  filters,
  onFilterChange,
  onClearFilters,
  className = '',
}) => {
  const hasActiveFilters = !!(
    filters.categoryId !== undefined ||
    filters.city ||
    filters.minRating !== undefined
  )

  const ratingOptions: (number | undefined)[] = [undefined, 3.0, 4.0, 4.5]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Header & Clear Button */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Icon name="grid" size="xs" className="text-emerald-400" />
          <span>Search & Filter Parameters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-[11px] font-bold text-destructive hover:underline flex items-center gap-1"
          >
            <Icon name="close" size={12} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Category Selection Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-foreground">Categories</Label>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 text-xs">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, categoryId: undefined })}
            className={`w-full flex items-center justify-between p-2 rounded-sm text-left transition-colors ${
              filters.categoryId === undefined
                ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <Icon name="categories" size="xs" />
              <span>All Categories</span>
            </span>
          </button>

          {categories.map((category) => {
            const isSelected = filters.categoryId === category.id
            const iconName = getCategoryIcon(category.name || category.slug)

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, categoryId: category.id })}
                className={`w-full flex items-center justify-between p-2 rounded-sm text-left transition-colors ${
                  isSelected
                    ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <Icon name={iconName} size="xs" />
                  <span className="truncate">{category.name}</span>
                </span>
                {category.places_count !== undefined && (
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {category.places_count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* City Location Filter */}
      <div className="space-y-2">
        <Label htmlFor="filter-city" className="text-xs font-bold text-foreground">
          City Location
        </Label>
        <div className="relative flex items-center">
          <Icon name="location" size="xs" className="absolute left-3 text-muted-foreground pointer-events-none" />
          <Input
            id="filter-city"
            type="text"
            value={filters.city || ''}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value || undefined })}
            placeholder="Filter by city (e.g. Delhi)..."
            className="pl-9 h-9 rounded-sm border-border/70 bg-background/80 text-xs"
          />
        </div>
      </div>

      {/* Minimum Rating Threshold Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-foreground">Minimum Rating</Label>
        <div className="grid grid-cols-4 gap-1.5 text-xs font-mono font-bold">
          {ratingOptions.map((val) => {
            const isSelected = filters.minRating === val

            return (
              <button
                key={val ?? 'any'}
                type="button"
                onClick={() => onFilterChange({ ...filters, minRating: val })}
                className={`py-1.5 rounded-sm border text-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 font-bold'
                    : 'border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {val !== undefined ? `${val}+ ★` : 'Any'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Clear Filters Footer Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="w-full rounded-sm text-xs font-semibold border-border/70 text-muted-foreground hover:text-foreground"
        >
          <span>Reset All Filters</span>
        </Button>
      )}
    </div>
  )
}

export default PlaceFilters
