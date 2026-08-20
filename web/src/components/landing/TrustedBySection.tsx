import React from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconName } from '@/components/common/Icon'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion-variants'

export interface StatItem {
  number: string
  label: string
  detail: string
  icon: IconName
}

export const TrustedBySection: React.FC = () => {
  const stats: StatItem[] = [
    {
      number: '100,000+',
      label: 'Active Travelers',
      detail: 'Exploring cities & hidden gems worldwide',
      icon: 'profile',
    },
    {
      number: '500+',
      label: 'Covered Cities',
      detail: 'Real-time location & navigation radar',
      icon: 'location',
    },
    {
      number: '25,000+',
      label: 'Tourist Destinations',
      detail: 'Curated heritage sites, beaches & spots',
      icon: 'gallery',
    },
    {
      number: '99.9%',
      label: 'Platform Availability',
      detail: 'High availability & offline map sync',
      icon: 'admin',
    },
  ]

  return (
    <section className="py-12 border-y border-border bg-card/40 backdrop-blur-xs relative">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItemVariants}
              className="flex items-start gap-4 rounded-sm border border-border/80 bg-gradient-to-b from-card via-card/95 to-card/80 p-4 sm:p-5 shadow-xs hover:border-primary/40 transition-colors backdrop-blur-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-secondary text-primary border border-primary/20">
                <Icon name={stat.icon} size="lg" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black font-heading text-foreground tracking-tight">
                  {stat.number}
                </h3>
                <p className="text-xs font-bold text-foreground">{stat.label}</p>
                <p className="text-[11px] text-muted-foreground leading-normal">{stat.detail}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
