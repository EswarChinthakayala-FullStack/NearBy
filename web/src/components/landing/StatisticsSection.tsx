import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api, type PlatformStats } from '@/lib/api'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion-variants'

export const StatisticsSection: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null)

  useEffect(() => {
    async function loadStats() {
      const data = await api.getPlatformStats()
      setStats(data)
    }
    loadStats()
  }, [])

  if (!stats) return null

  return (
    <section className="py-20 border-y border-border bg-card/60 backdrop-blur-xs relative">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerContainerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
        >
          <motion.div variants={staggerItemVariants} className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black font-heading text-primary">
              {stats.travelers_count.toLocaleString()}+
            </h3>
            <p className="text-xs font-semibold text-foreground">Travelers Guided</p>
            <p className="text-[11px] text-muted-foreground">Worldwide User Community</p>
          </motion.div>

          <motion.div variants={staggerItemVariants} className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black font-heading text-amber-500">
              {stats.cities_count}+
            </h3>
            <p className="text-xs font-semibold text-foreground">Cities Mapped</p>
            <p className="text-[11px] text-muted-foreground">Vector Map Tile Coverage</p>
          </motion.div>

          <motion.div variants={staggerItemVariants} className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black font-heading text-primary">
              {stats.places_count.toLocaleString()}+
            </h3>
            <p className="text-xs font-semibold text-foreground">Attractions & Places</p>
            <p className="text-[11px] text-muted-foreground">Verified Local Knowledge</p>
          </motion.div>

          <motion.div variants={staggerItemVariants} className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-black font-heading text-emerald-500">
              {stats.availability_rate}%
            </h3>
            <p className="text-xs font-semibold text-foreground">Uptime & Reliability</p>
            <p className="text-[11px] text-muted-foreground">Enterprise API Infrastructure</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
