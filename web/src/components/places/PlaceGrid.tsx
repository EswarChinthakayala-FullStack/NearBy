import React from 'react'
import { motion } from 'framer-motion'
import { PlaceCard } from './PlaceCard'
import type { PlaceListItem, Place } from '@/types/place'
import { fadeInUp, staggerContainer } from '@/lib/motion-variants'

export interface PlaceGridProps {
  places: (PlaceListItem | Place)[]
  favoritedUuids?: string[]
  className?: string
}

export const PlaceGrid: React.FC<PlaceGridProps> = ({
  places,
  favoritedUuids = [],
  className = '',
}) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
    >
      {places.map((place) => (
        <motion.div key={place.uuid} variants={fadeInUp} className="h-full">
          <PlaceCard
            place={place}
            isFavorited={favoritedUuids.includes(place.uuid)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default PlaceGrid
