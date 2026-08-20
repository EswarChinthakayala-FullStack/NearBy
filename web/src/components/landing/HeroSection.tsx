import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer } from '@/lib/motion-variants'

export const HeroSection: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/places?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/places')
    }
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-background text-foreground">
      {/* Main Hero Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full relative z-10 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center space-y-7"
        >
          {/* Top Badge */}
          <motion.div variants={fadeInUp} className="inline-block">
            <div className="inline-flex items-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400 backdrop-blur-md shadow-sm">
              <Icon name="sparkles" size="xs" />
              <span>Enterprise AI Location & Spatial Radar</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-foreground leading-[1.15] max-w-3xl"
          >
            Explore destination spots with{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              real-time AI guidance
            </span>
            .
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Nearby combines live geographic radar, neural itinerary solvers, and verified traveler reviews to deliver a seamless exploration platform.
          </motion.p>

          {/* Sleek Inline Hero Search Box (Single Horizontal Row on Mobile & Desktop) */}
          <motion.form
            variants={fadeInUp}
            onSubmit={handleSearchSubmit}
            className="flex flex-row items-center gap-1.5 rounded-sm border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-xl w-full max-w-2xl mx-auto focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
          >
            <div className="flex-1 flex items-center gap-2.5 px-2.5 py-1.5 min-w-0">
              <Icon name="search" size="sm" className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places, categories, or cities..."
                className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none truncate"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-9 sm:h-10 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-sm shrink-0 px-3.5 sm:px-5 text-xs sm:text-sm"
            >
              <span>Search</span>
              <span className="hidden sm:inline">Spots</span>
              <Icon name="arrow-right" size="xs" />
            </Button>
          </motion.form>

          {/* Balanced Uniform Action Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link to="/places">
              <Button
                variant="outline"
                size="sm"
                className="h-9 sm:h-10 rounded-sm gap-2 text-xs sm:text-sm font-semibold border-border/80 px-4 sm:px-5 bg-card/60 hover:bg-card backdrop-blur-xs transition-colors"
              >
                <Icon name="places" size="xs" />
                <span>Browse Places Index</span>
              </Button>
            </Link>
            <Link to="/map-radar">
              <Button
                variant="outline"
                size="sm"
                className="h-9 sm:h-10 rounded-sm gap-2 text-xs sm:text-sm font-semibold border-border/80 px-4 sm:px-5 bg-card/60 hover:bg-card backdrop-blur-xs text-foreground transition-colors"
              >
                <Icon name="map" size="xs" />
                <span>Open Spatial Radar</span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
