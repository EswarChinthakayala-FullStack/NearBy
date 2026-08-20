import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon, Route02Icon } from '@hugeicons/core-free-icons'

export const ItineraryHero: React.FC = () => {
  return (
    <div className="relative rounded-sm border border-border bg-card/90 backdrop-blur-xl overflow-hidden p-8 sm:p-12 shadow-2xl">
      {/* Background SVG Mesh Pattern */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-400">
          <HugeiconsIcon icon={SparklesIcon} className="size-3.5" />
          <span>Mistral Neural Travel Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-foreground">
          Plan Your Perfect Journey with AI
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Nearby AI understands your preferences, destination, budget, travel style, and available time to create a personalized, route-optimized itinerary backed by verified database points of interest.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-muted-foreground">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <HugeiconsIcon icon={Route02Icon} className="size-3.5" />
            <span>Zero Hallucinations</span>
          </span>
          <span>•</span>
          <span>Live GIS Routing</span>
          <span>•</span>
          <span>Verified Database Spots</span>
        </div>
      </div>
    </div>
  )
}

export default ItineraryHero
