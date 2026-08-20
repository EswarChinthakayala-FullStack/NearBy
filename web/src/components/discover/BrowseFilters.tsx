import React from 'react'
import type { Category } from '@/types/category'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BrowseFiltersProps {
  categories: Category[]
  selectedCategoryId: number | null
  onSelectCategory: (id: number | null) => void
  selectedCity: string
  onSelectCity: (city: string) => void
  minRating: number
  onRatingChange: (rating: number) => void
  sortBy: string
  onSortChange: (sort: string) => void
  onReset: () => void
}

export const BrowseFilters: React.FC<BrowseFiltersProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedCity,
  onSelectCity,
  minRating,
  onRatingChange,
  sortBy,
  onSortChange,
  onReset,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-card/60 p-4 rounded-sm border border-border/80 shadow-xs">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors border ${
            selectedCategoryId === null
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
              : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.uuid || cat.id}
            type="button"
            onClick={() => onSelectCategory(Number(cat.id || 0) === selectedCategoryId ? null : Number(cat.id || 0))}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors border ${
              selectedCategoryId === Number(cat.id || 0)
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* City, Rating & Sort Controls */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {/* City Filter */}
        <Select value={selectedCity || 'all'} onValueChange={(val: any) => onSelectCity(!val || String(val) === 'all' ? '' : String(val))}>
          <SelectTrigger className="w-[140px] h-9 rounded-sm border border-input bg-background px-3 text-xs font-mono">
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-border bg-card shadow-lg">
            <SelectItem value="all" className="text-xs font-mono">All Cities</SelectItem>
            <SelectItem value="Panaji" className="text-xs font-mono">Panaji</SelectItem>
            <SelectItem value="Old Goa" className="text-xs font-mono">Old Goa</SelectItem>
            <SelectItem value="Margao" className="text-xs font-mono">Margao</SelectItem>
            <SelectItem value="Calangute" className="text-xs font-mono">Calangute</SelectItem>
            <SelectItem value="Vagator" className="text-xs font-mono">Vagator</SelectItem>
            <SelectItem value="Anjuna" className="text-xs font-mono">Anjuna</SelectItem>
          </SelectContent>
        </Select>

        {/* Rating Filter */}
        <Select value={String(minRating)} onValueChange={(val: any) => val && onRatingChange(Number(val))}>
          <SelectTrigger className="w-[130px] h-9 rounded-sm border border-input bg-background px-3 text-xs font-mono">
            <SelectValue placeholder="Select Rating" />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-border bg-card shadow-lg">
            <SelectItem value="0" className="text-xs font-mono">All Ratings</SelectItem>
            <SelectItem value="4.5" className="text-xs font-mono">★ 4.5+</SelectItem>
            <SelectItem value="4.0" className="text-xs font-mono">★ 4.0+</SelectItem>
            <SelectItem value="3.5" className="text-xs font-mono">★ 3.5+</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Selector */}
        <Select value={sortBy} onValueChange={(val: any) => val && onSortChange(String(val))}>
          <SelectTrigger className="w-[170px] h-9 rounded-sm border border-input bg-background px-3 text-xs font-mono">
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent className="rounded-sm border-border bg-card shadow-lg">
            <SelectItem value="newest" className="text-xs font-mono">Sort: Newest First</SelectItem>
            <SelectItem value="rating_desc" className="text-xs font-mono">Sort: Highest Rated</SelectItem>
            <SelectItem value="favorites" className="text-xs font-mono">Sort: Most Saved</SelectItem>
            <SelectItem value="name_asc" className="text-xs font-mono">Sort: Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={onReset}
          className="h-9 px-3.5 rounded-sm border border-border bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted font-semibold transition-colors text-xs shadow-xs"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}

export default BrowseFilters
