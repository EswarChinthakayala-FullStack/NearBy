import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/common/Icon'
import { PlaceFilters, type FilterValues } from './PlaceFilters'
import type { Category } from '@/types/category'

export interface MobileFilterSheetProps {
  categories: Category[]
  filters: FilterValues
  onFilterChange: (newFilters: FilterValues) => void
  onClearFilters: () => void
  activeFilterCount?: number
  className?: string
}

export const MobileFilterSheet: React.FC<MobileFilterSheetProps> = ({
  categories,
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount = 0,
  className = '',
}) => {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="default"
            className={`rounded-sm gap-2 font-semibold border-border/80 text-xs ${className}`}
          >
            <Icon name="grid" size="xs" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-emerald-500 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        }
      />

      <SheetContent side="right" className="w-full sm:max-w-md bg-card/95 backdrop-blur-2xl overflow-y-auto p-6">
        <SheetHeader className="text-left space-y-1 pb-4 border-b border-border/60">
          <SheetTitle className="text-lg font-bold font-heading">Refine Destinations</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Filter spots by category, city, or minimum rating score.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          <PlaceFilters
            categories={categories}
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileFilterSheet
