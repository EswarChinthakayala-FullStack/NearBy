import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCategories } from '@/hooks/useCategories'
import { getCategoryIcon } from '@/lib/CategoryIconMapper'
import { Icon } from '@/components/common/Icon'
import { CategoryCardSkeleton } from '@/components/common/SkeletonLoader'
import type { Category } from '@/types/category'
import { fadeInUp, staggerContainer } from '@/lib/motion-variants'

export const CategoryGrid: React.FC = () => {
  const { data: categories = [], isLoading, isError, refetch } = useCategories()

  return (
    <section className="py-20 bg-background text-foreground relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Heading */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
            <Icon name="categories" size="xs" />
            <span>Tourism Category Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
            Explore places by classification.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Discover destinations organized by verified tourism categories backed by OpenStreetMap and community classification.
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryCardSkeleton key={`cat-skel-${i}`} />
            ))}
          </div>
        )}

        {/* Error Fallback */}
        {isError && (
          <div className="rounded-sm border border-destructive/40 bg-destructive/10 p-6 text-center space-y-3 max-w-md mx-auto">
            <Icon name="error" size="md" className="text-destructive mx-auto" />
            <p className="text-xs text-foreground font-semibold">Unable to load tourism categories.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 text-xs font-bold text-destructive hover:underline"
            >
              <Icon name="refresh" size="xs" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && !isError && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {categories.map((category: Category) => {
              const iconName = getCategoryIcon(category.name || category.slug)

              return (
                <motion.div key={category.uuid || category.slug} variants={fadeInUp}>
                  <Link
                    to={`/places?category_slug=${encodeURIComponent(category.slug)}`}
                    className="group flex flex-col items-center justify-center p-6 rounded-sm border border-border/70 bg-card/60 hover:bg-card hover:border-emerald-500/50 hover:shadow-lg backdrop-blur-md transition-all text-center space-y-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                      <Icon name={iconName} size="md" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {category.name}
                      </h3>
                      {category.places_count !== undefined && (
                        <p className="text-[11px] font-mono text-muted-foreground pt-0.5">
                          {category.places_count} spots
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default CategoryGrid
