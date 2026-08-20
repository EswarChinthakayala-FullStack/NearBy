import React from 'react'
import {
  ShieldAlert,
  Cpu,
  Layers,
  Zap,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react'

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Cpu,
      title: 'Parallel Multi-Engine Scraping',
      description: 'Dispatches scrapers simultaneously across Bing (Playwright), DuckDuckGo (vqd token flow), and Google Images in parallel Celery chord tasks.',
      gradient: 'from-violet-500 to-indigo-500',
    },
    {
      icon: ShieldAlert,
      title: 'Per-Source Circuit Breakers',
      description: 'Tracks consecutive failure counts per search engine in Redis. Automatically trips a 10-minute cooldown if a source fails 3 times in a row.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Layers,
      title: 'Resolution Ranking & Deduplication',
      description: 'Normalizes image target URLs to strip tracking tokens and ranks candidates strictly by resolution dimensions (width × height).',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: RefreshCw,
      title: 'Interleaved Source Diversity',
      description: 'Interleaves image results across scrapers so search results are never dominated by a single backend provider.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: ImageIcon,
      title: 'Thumbnail Proxying CDN',
      description: 'Routes thumbnail views through FastAPI /thumb proxy, adding proper Referer and User-Agent headers to eliminate CDN hotlinking restrictions.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: '6-Hour Aggressive Redis Cache',
      description: 'Caches deduplicated and ranked results per query in Redis for 6 hours (21,600s TTL), keeping repeat searches lightning fast.',
      gradient: 'from-rose-500 to-red-500',
    },
  ]

  return (
    <section id="features" className="relative bg-zinc-950 py-24 sm:py-32 border-b border-zinc-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            Engine Capabilities
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built Multi-Source From Day One
          </p>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            No single scraped search engine is long-term reliable. If one backend changes HTML selectors or rate limits, the rest keep your results flowing smoothly.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="relative group rounded-sm border border-zinc-800/80 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 transition-all hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-950/30"
                >
                  <div className={`inline-flex rounded-sm bg-gradient-to-tr ${feature.gradient} p-3 text-white shadow-md mb-6`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
