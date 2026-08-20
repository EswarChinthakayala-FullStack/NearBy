import React from 'react'
import { PlaceFilters, type FilterValues } from './PlaceFilters'
import type { Category } from '@/types/category'

export interface FilterSidebarProps {
  categories: Category[]
  filters: FilterValues
  onFilterChange: (newFilters: FilterValues) => void
  onClearFilters: () => void
  className?: string
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onClearFilters,
  className = '',
}) => {
  return (
    <aside className={`w-full rounded-sm border border-border/80 bg-card/80 backdrop-blur-xl p-5 shadow-xl ${className}`}>
      <PlaceFilters
        categories={categories}
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />
    </aside>
  )
}

export default FilterSidebar
