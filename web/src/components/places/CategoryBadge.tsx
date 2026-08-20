import React from 'react'
import { Icon } from '@/components/common/Icon'
import type { Category } from '@/types/category'

export interface CategoryBadgeProps {
  category?: Category | string
  className?: string
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const categoryName = typeof category === 'string' ? category : category?.name || 'Destination'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-bold bg-zinc-950/85 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-xs ${className}`}
    >
      <Icon name="categories" size="xs" className="text-emerald-400" />
      <span>{categoryName}</span>
    </span>
  )
}

export default CategoryBadge
