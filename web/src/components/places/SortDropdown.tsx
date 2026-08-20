import React from 'react'
import { Icon } from '@/components/common/Icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type SortOption = 'rating-desc' | 'reviews-desc' | 'name-asc'

export interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon name="grid" size="xs" className="text-muted-foreground" />
      <Select value={value} onValueChange={(val: any) => val && onChange(val as SortOption)}>
        <SelectTrigger className="w-[180px] h-9 rounded-sm border-input bg-background text-xs font-medium">
          <SelectValue placeholder="Select Sort Order" />
        </SelectTrigger>
        <SelectContent className="rounded-sm border-border bg-card shadow-lg">
          <SelectItem value="rating-desc" className="text-xs font-semibold">Highest Rated</SelectItem>
          <SelectItem value="reviews-desc" className="text-xs font-semibold">Most Reviewed</SelectItem>
          <SelectItem value="name-asc" className="text-xs font-semibold">Alphabetical (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export default SortDropdown
