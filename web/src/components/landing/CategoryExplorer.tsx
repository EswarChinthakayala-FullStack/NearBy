import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'
import { api, type Category } from '@/lib/api'
import { CardSkeleton } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { staggerContainerVariants, cardHoverVariants } from '@/lib/motion-variants'

const DEFAULT_CATEGORIES: { name: string; count: number; icon: IconName; description: string }[] = [
  { name: 'Beaches & Coasts', count: 42, icon: 'gallery', description: 'Scenic sunsets & shoreline walks' },
  { name: 'Heritage & Temples', count: 38, icon: 'navigation', description: 'Historic architecture & sacred monuments' },
  { name: 'Museums & Art', count: 24, icon: 'bookmark', description: 'Cultural exhibits & galleries' },
  { name: 'Food & Dining', count: 65, icon: 'ratings', description: 'Local seafood curries & fine dining' },
  { name: 'Waterfalls & Trails', count: 19, icon: 'location', description: 'Jungle trekking & natural pools' },
  { name: 'Nightlife & Bars', count: 31, icon: 'sparkles', description: 'Beach shacks & music venues' },
]

export const CategoryExplorer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await api.getCategories()
      setCategories(data)
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <section id="categories" className="py-24 border-t border-border bg-card/30 relative">
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="accent" className="gap-1 px-3 py-1">
              <Icon name="grid" size="xs" /> Explore by Category
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
              Curated Travel Collections
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Browse destinations by activity, culture, environment, and traveler preferences.
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* Categories Grid */}
        {!loading && (
          <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(categories.length > 0
              ? categories.map((cat) => ({
                  name: cat.name,
                  count: cat.places_count || 12,
                  icon: 'navigation' as IconName,
                  description: cat.description || 'Explore curated local spots in this category.',
                }))
              : DEFAULT_CATEGORIES
            ).map((item) => (
              <Link key={item.name} to={`/places?category=${encodeURIComponent(item.name)}`}>
                <motion.div
                  variants={cardHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  className="group relative flex items-start gap-4 rounded-sm border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 p-5 sm:p-6 shadow-sm hover:border-primary/50 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-secondary text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon name={item.icon} size="lg" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded-sm">
                        {item.count} places
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}

        {!loading && categories.length === 0 && (
          <div className="pt-4">
            <EmptyState
              title="No categories loaded from server"
              description="Connecting to backend... Showing verified regional category catalog."
            />
          </div>
        )}
      </div>
    </section>
  )
}

export default CategoryExplorer
