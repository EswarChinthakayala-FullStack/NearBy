import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'
import { InteractiveMapSVG } from '@/components/illustrations/InteractiveMapSVG'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion-variants'

export const InteractiveMapPreview: React.FC = () => {
  return (
    <section id="map-preview" className="py-24 border-t border-border bg-card/30 relative">
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        
        {/* Header */}
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center space-y-4 max-w-3xl mx-auto"
        >
          <motion.div variants={staggerItemVariants}>
            <Badge variant="accent" className="gap-1 px-3 py-1">
              <Icon name="map" size="xs" /> Live Regional Interactive Map
            </Badge>
          </motion.div>
          <motion.h2 variants={staggerItemVariants} className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
            Explore Regional Destinations on an Interactive Map
          </motion.h2>
          <motion.p variants={staggerItemVariants} className="text-sm text-muted-foreground leading-relaxed">
            Click location markers on the map below to inspect ratings, categories, and route paths.
          </motion.p>
        </motion.div>

        {/* Interactive SVG Map Component */}
        <InteractiveMapSVG />
      </div>
    </section>
  )
}
