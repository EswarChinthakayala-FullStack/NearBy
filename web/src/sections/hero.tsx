import React, { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'

interface HeroProps {
  onSearchSubmit?: (query: string) => void
}

export const HeroSection: React.FC<HeroProps> = ({ onSearchSubmit }) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() !== '' && onSearchSubmit) {
      onSearchSubmit(query)
    } else {
      const showcaseEl = document.getElementById('showcase')
      if (showcaseEl) {
        showcaseEl.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="relative overflow-hidden bg-zinc-950 pt-20 pb-24 lg:pt-28 lg:pb-36 border-b border-zinc-900">
      {/* Dynamic Background Glow & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-violet-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-sm border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur-md mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-sm h-2 w-2 bg-violet-500"></span>
            </span>
            <span>Multi-Source Parallel Scraping Engine</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
            Search Google, Bing & DDG Images with{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Zero Paid API Keys
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg leading-8 text-zinc-400 max-w-2xl mx-auto">
            High-throughput backend scraping engine powered by FastAPI, Celery, and Playwright. Includes automatic perceptual deduplication, resolution ranking, and CDN thumbnail proxying.
          </p>

          {/* Quick Search Bar Box */}
          <form
            onSubmit={handleSubmit}
            className="mt-10 mx-auto max-w-xl flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-900/90 p-2 shadow-2xl shadow-violet-950/40 backdrop-blur-xl transition-all focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20"
          >
            <div className="flex items-center pl-3 text-zinc-500">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search images (e.g. Kyoto temples, cybernetic city)..."
              className="w-full bg-transparent px-2 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-sm bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <span>Search Engine</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Preset Query Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
            <span>Try searching:</span>
            {['Alpine mountains', 'Tokyo night streets', 'Golden Retriever', 'Sci-fi concept art'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setQuery(sample)
                  if (onSearchSubmit) onSearchSubmit(sample)
                }}
                className="rounded-sm border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-zinc-900 pt-10">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">$0.00</div>
              <div className="text-xs text-zinc-500">API Key Cost</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-violet-400">3 Engines</div>
              <div className="text-xs text-zinc-500">Bing + DDG + Google</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">6-Hour TTL</div>
              <div className="text-xs text-zinc-500">Redis Query Cache</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-emerald-400">100% Resilience</div>
              <div className="text-xs text-zinc-500">Per-Source Circuit Breaker</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
