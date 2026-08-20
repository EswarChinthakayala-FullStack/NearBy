import React from 'react'
import { Link } from 'react-router-dom'
import type { Category } from '@/types/category'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

interface CategoryGridProps {
  categories: Category[]
}

const CATEGORY_IMAGES: Record<string, string> = {
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
  beaches: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
  historical: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800',
  museum: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800',
  museums: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=800',
  nature: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800',
  park: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800',
  parks: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800',
  shopping: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800',
  temple: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800',
  temples: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800',
  fort: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800',
  forts: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800',
  monument: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800',
  monuments: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800',
  wildlife: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?q=80&w=800',
  'hill-station': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800',
  lake: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800',
  lakes: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800',
  waterfall: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=800',
  waterfalls: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=800',
  religious: 'https://images.unsplash.com/photo-1609949279531-cf48d64bed89?q=80&w=800',
  adventure: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800',
  food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800',
  culture: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800',
  nightlife: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800',
  viewpoint: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800',
  garden: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800',
  gardens: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800',
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => {
        const slugKey = cat.slug?.toLowerCase().trim() || ''
        const coverImg =
          ('image_url' in cat && (cat as { image_url?: string }).image_url) ||
          CATEGORY_IMAGES[slugKey] ||
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800'

        return (
          <Link
            key={cat.uuid || cat.slug}
            to={`/categories/${cat.slug}`}
            className="group relative overflow-hidden rounded-sm border border-border/80 bg-card/90 backdrop-blur-xl shadow-md transition-all hover:border-emerald-500/50 hover:shadow-xl flex flex-col h-64"
          >
            {/* Background Cover Image with Gradient Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={coverImg}
                alt={cat.name}
                className="h-full w-full object-cover transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
            </div>

            {/* Bottom Details */}
            <div className="relative z-10 mt-auto p-5 space-y-2">
              <h3 className="text-xl font-black font-heading tracking-tight text-foreground group-hover:text-emerald-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {cat.description || `Explore top rated ${cat.name.toLowerCase()} destinations, landmarks, and spatial points of interest.`}
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span>Explore Category</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default CategoryGrid
