import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icon } from '@/components/common/Icon'
import type { Category } from '@/types/category'

export interface AdminToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory?: string
  onCategoryChange?: (categoryId: string) => void
  categories?: Category[]
  selectedStatus?: string
  onStatusChange?: (status: string) => void
  selectedCount?: number
  onBulkPublish?: () => void
  onBulkArchive?: () => void
  onBulkDelete?: () => void
  isBulkProcessing?: boolean
  className?: string
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory = 'all',
  onCategoryChange,
  categories = [],
  selectedStatus = 'all',
  onStatusChange,
  selectedCount = 0,
  onBulkPublish,
  onBulkArchive,
  onBulkDelete,
  isBulkProcessing = false,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search places by name, city, or slug..."
            className="pl-9 pr-8 rounded-sm border-border/70 bg-background/80 focus:bg-background text-xs h-9"
          />
          <Icon name="search" size="xs" className="absolute left-3 top-2.5 text-muted-foreground" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          {onCategoryChange && (
            <Select value={selectedCategory} onValueChange={(val: any) => onCategoryChange(String(val ?? 'all'))}>
              <SelectTrigger className="w-[150px] h-9 text-xs font-medium rounded-sm border-border/70 bg-background/80">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-sm shadow-lg border-border/70">
                <SelectItem value="all" className="text-xs font-medium">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)} className="text-xs font-medium">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Status Filter */}
          {onStatusChange && (
            <Select value={selectedStatus} onValueChange={(val: any) => onStatusChange(String(val ?? 'all'))}>
              <SelectTrigger className="w-[140px] h-9 text-xs font-medium rounded-sm border-border/70 bg-background/80">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-sm shadow-lg border-border/70">
                <SelectItem value="all" className="text-xs font-medium">All Statuses</SelectItem>
                <SelectItem value="published" className="text-xs font-medium text-emerald-500">Published</SelectItem>
                <SelectItem value="draft" className="text-xs font-medium text-amber-500">Draft</SelectItem>
                <SelectItem value="archived" className="text-xs font-medium text-muted-foreground">Archived</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Bulk Action Sub-Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between p-2.5 px-4 rounded-sm bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Icon name="check" size="xs" />
            <span><span className="font-mono font-bold">{selectedCount}</span> item(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            {onBulkPublish && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkPublish}
                disabled={isBulkProcessing}
                className="h-7 text-xs font-semibold rounded-sm text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                Publish Selected
              </Button>
            )}

            {onBulkArchive && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkArchive}
                disabled={isBulkProcessing}
                className="h-7 text-xs font-semibold rounded-sm text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
              >
                Archive Selected
              </Button>
            )}

            {onBulkDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDelete}
                disabled={isBulkProcessing}
                className="h-7 text-xs font-semibold rounded-sm text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Delete Selected
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminToolbar
