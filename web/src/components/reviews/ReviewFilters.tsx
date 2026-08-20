import React from 'react'
import { Icon } from '@/components/common/Icon'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type ReviewSortOption = 'latest' | 'highest' | 'lowest'

export interface ReviewFiltersProps {
  currentSort: ReviewSortOption
  onSortChange: (sort: ReviewSortOption) => void
  totalCount?: number
  className?: string
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  currentSort,
  onSortChange,
  totalCount,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 py-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span>Reviews</span>
        {totalCount !== undefined && (
          <span className="px-2 py-0.5 rounded-sm bg-secondary text-secondary-foreground text-xs font-mono">
            {totalCount}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Icon name="sort" size="xs" className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground hidden sm:inline">Sort by:</span>

        <Select value={currentSort} onValueChange={(val: any) => onSortChange(val as ReviewSortOption)}>
          <SelectTrigger className="w-[160px] h-9 text-xs font-medium rounded-sm border-border/70 bg-background/80 backdrop-blur-sm">
            <SelectValue placeholder="Sort reviews" />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-border/70 shadow-lg">
            <SelectItem value="latest" className="text-xs font-medium">
              Latest First
            </SelectItem>
            <SelectItem value="highest" className="text-xs font-medium">
              Highest Rating
            </SelectItem>
            <SelectItem value="lowest" className="text-xs font-medium">
              Lowest Rating
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default ReviewFilters
