import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, GridViewIcon, ListViewIcon } from '@hugeicons/core-free-icons'

interface BrowseHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  totalCount: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export const BrowseHeader: React.FC<BrowseHeaderProps> = ({
  searchQuery,
  onSearchChange,
  totalCount,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="space-y-4 border-b border-border pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-400">
              Discover Destinations
            </span>
            <span className="rounded-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
              {totalCount} Verified Spots
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground mt-1">
            Browse Tourist Places
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Filter, search, and explore curated local attractions with live spatial coordinates.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-sm border border-border shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`flex h-8 w-8 items-center justify-center rounded-sm text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Grid View"
          >
            <HugeiconsIcon icon={GridViewIcon} className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`flex h-8 w-8 items-center justify-center rounded-sm text-xs transition-colors ${
              viewMode === 'list'
                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title="List View"
          >
            <HugeiconsIcon icon={ListViewIcon} className="size-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-xl">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by spot name, city, landmark, or description..."
          className="w-full h-10 pl-10 pr-4 rounded-sm border border-border bg-card/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors shadow-2xs font-mono"
        />
      </div>
    </div>
  )
}

export default BrowseHeader
