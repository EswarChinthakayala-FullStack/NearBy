import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'
import { TravelAnalyticsSVG } from '@/components/illustrations/TravelAnalyticsSVG'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion-variants'

export const TravelExperienceSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Analytics & Storytelling SVG */}
        <div className="lg:col-span-6 flex justify-center">
          <TravelAnalyticsSVG className="w-full" />
        </div>

        {/* Right Column: Storytelling */}
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="lg:col-span-6 space-y-6"
        >
          <motion.div variants={staggerItemVariants}>
            <Badge variant="accent" className="gap-1">
              <Icon name="sparkles" size="xs" /> Travel Insights
            </Badge>
          </motion.div>

          <motion.h2 variants={staggerItemVariants} className="text-3xl sm:text-4xl font-black font-heading text-foreground tracking-tight">
            Designed for Explorers Who Demand Uncompromised Quality
          </motion.h2>

          <motion.p variants={staggerItemVariants} className="text-sm text-muted-foreground leading-relaxed">
            Whether you are planning a weekend getaway or a month-long regional expedition, Nearby delivers precision map data, verified reviews, and intelligent AI companion features that elevate every single trip.
          </motion.p>

          <motion.div variants={staggerItemVariants} className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-sm border border-border bg-card p-4 space-y-1">
              <p className="text-2xl font-black font-heading text-primary">3.2x</p>
              <p className="text-xs text-muted-foreground">Faster Trip Planning</p>
            </div>
            <div className="rounded-sm border border-border bg-card p-4 space-y-1">
              <p className="text-2xl font-black font-heading text-amber-500">4.9 / 5</p>
              <p className="text-xs text-muted-foreground">Average Traveler Score</p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
