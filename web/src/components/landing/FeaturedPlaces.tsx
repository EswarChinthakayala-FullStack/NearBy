import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePlaces } from '@/hooks/usePlaces'
import { PlaceCard } from '@/components/places/PlaceCard'
import { PlaceCardSkeleton } from '@/components/common/SkeletonLoader'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import type { Place } from '@/types/place'
import { fadeInUp, staggerContainer } from '@/lib/motion-variants'

export const FeaturedPlaces: React.FC = () => {
  const { data: placesResponse, isLoading, isError, refetch } = usePlaces({
    page: 1,
    page_size: 8,
  })

  const places: Place[] = placesResponse?.data || []

  return (
    <section className="py-20 bg-background text-foreground relative border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
              <Icon name="places" size="xs" />
              <span>Top-Rated Destinations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
              Featured travel spots.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore highly rated tourist attractions verified by spatial accuracy and traveler reviews.
            </p>
          </div>

          <Link to="/places" className="shrink-0">
            <Button variant="outline" size="default" className="rounded-sm gap-2 font-semibold border-border/80">
              <span>View All Spots</span>
              <Icon name="arrow-right" size="xs" />
            </Button>
          </Link>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <PlaceCardSkeleton key={`place-skel-${i}`} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-sm border border-destructive/40 bg-destructive/10 p-6 text-center space-y-3 max-w-md mx-auto">
            <Icon name="error" size="md" className="text-destructive mx-auto" />
            <p className="text-xs text-foreground font-semibold">Unable to load featured places.</p>
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

        {/* Places Grid */}
        {!isLoading && !isError && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {places.map((place) => (
              <motion.div key={place.uuid} variants={fadeInUp} className="h-full">
                <PlaceCard place={place} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default FeaturedPlaces
