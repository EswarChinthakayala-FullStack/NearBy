import React from 'react'
import { Icon } from '@/components/common/Icon'
import type { FilterValues } from './PlaceFilters'

export interface ResultsSummaryProps {
  totalItems: number
  searchQuery?: string
  filters: FilterValues
  onRemoveFilter: (key: keyof FilterValues) => void
  className?: string
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  totalItems,
  searchQuery,
  filters,
  onRemoveFilter,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 text-xs ${className}`}>
      {/* Count & Search Summary */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-foreground font-heading">
          {totalItems.toLocaleString()} destination spots
        </span>
        {searchQuery && (
          <span className="text-muted-foreground">
            matching <span className="text-emerald-400 font-semibold">"{searchQuery}"</span>
          </span>
        )}
      </div>

      {/* Active Filter Tags */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.city && (
          <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[11px] text-emerald-400">
            <span>City: {filters.city}</span>
            <button
              type="button"
              onClick={() => onRemoveFilter('city')}
              className="hover:text-foreground p-0.5"
            >
              <Icon name="close" size={10} />
            </button>
          </span>
        )}

        {filters.minRating !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-sm bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 font-mono text-[11px] text-amber-400">
            <span>{filters.minRating}+ ★</span>
            <button
              type="button"
              onClick={() => onRemoveFilter('minRating')}
              className="hover:text-foreground p-0.5"
            >
              <Icon name="close" size={10} />
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

export default ResultsSummary
