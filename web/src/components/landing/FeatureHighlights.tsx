import React from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/common/Icon'
import { Badge } from '@/components/ui/badge'
import { staggerContainerVariants, cardHoverVariants } from '@/lib/motion-variants'
import { AISearchSVG } from '@/components/illustrations/AISearchSVG'
import { SmartRouteSVG } from '@/components/illustrations/SmartRouteSVG'
import { NearbyPlacesSVG } from '@/components/illustrations/NearbyPlacesSVG'

export interface FeatureCard {
  title: string
  description: string
  badge: string
  icon: IconName
  illustration: React.ReactNode
}

export const FeatureHighlights: React.FC = () => {
  const features: FeatureCard[] = [
    {
      title: 'AI Natural Language Search',
      description: 'Ask Nearby anything from "romantic sunset dinners" to "family-friendly museum tours" and receive instant tailored recommendations.',
      badge: 'AI Powered',
      icon: 'sparkles',
      illustration: <AISearchSVG className="w-full h-auto max-h-48 py-2" />,
    },
    {
      title: 'Smart Route Optimization',
      description: 'Generate multi-stop travel itineraries that minimize transit time, avoid traffic congestion, and adapt to live opening hours.',
      badge: 'Time Saving',
      icon: 'navigation',
      illustration: <SmartRouteSVG className="w-full h-auto max-h-48 py-2" />,
    },
    {
      title: 'Live Location Radar',
      description: 'Discover attractions, dining, and emergency services around your exact GPS coordinates with interactive radar distance sweeps.',
      badge: 'Real Time',
      icon: 'location',
      illustration: <NearbyPlacesSVG className="w-full h-auto max-h-48 py-2" />,
    },
  ]

  return (
    <section id="features" className="py-24 relative">
      <div className="mx-auto max-w-7xl px-6 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="accent" className="gap-1 px-3 py-1">
            <Icon name="sparkles" size="xs" /> Platform Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
            Intelligent Features Designed for Modern Travelers
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            From smart route calculation to offline map access, Nearby brings enterprise-grade AI intelligence to your travel experience.
          </p>
        </div>

        {/* Feature Cards Matrix */}
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardHoverVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="flex flex-col justify-between h-full rounded-sm border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 p-5 sm:p-6 shadow-sm hover:border-primary/60 hover:shadow-lg hover:shadow-primary/5 backdrop-blur-md transition-all space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-secondary text-primary border border-primary/20">
                    <Icon name={feature.icon} size="md" />
                  </div>
                  <Badge variant="secondary" className="text-[11px] rounded-sm">{feature.badge}</Badge>
                </div>

                <h3 className="text-xl font-bold font-heading text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>

              {/* Illustration */}
              <div className="pt-2 border-t border-border/60">
                {feature.illustration}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
