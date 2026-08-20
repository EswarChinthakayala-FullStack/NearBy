import React from 'react'
import type { Category } from '@/types/category'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { Link } from 'react-router-dom'

interface CategoryHeroProps {
  category: Category
  totalPlaces: number
}

export const CategoryHero: React.FC<CategoryHeroProps> = ({ category, totalPlaces }) => {
  return (
    <div className="relative rounded-sm border border-border bg-card overflow-hidden p-6 sm:p-10 shadow-lg">
      <div className="relative z-10 space-y-4 max-w-3xl">
        <Link
          to="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
          <span>All Categories</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase">
            Taxonomy Collection
          </span>
          <span className="rounded-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-mono font-bold text-emerald-400">
            {totalPlaces} Destinations
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
          {category.name}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {category.description ||
            `Curated list of verified ${category.name.toLowerCase()} attractions with accurate GIS coordinates, traveler ratings, and spatial guidance.`}
        </p>
      </div>
    </div>
  )
}

export default CategoryHero
