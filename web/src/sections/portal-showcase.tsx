import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  ExternalLink,
  Maximize2,
  X,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react'

import axiosClient from '@/services/api/axiosClient'

export interface ImageResult {
  thumbnail_url: string
  source_url: string
  title: string
  width: number
  height: number
  source_site: string
}

export interface CircuitBreakerStat {
  source?: string
  available: boolean
  cooldown_remaining_sec: number
  success_rate_pct: number
  total_requests: number
  total_successes: number
  total_failures: number
}

interface PortalShowcaseProps {
  initialQuery?: string
}

export const PortalShowcaseSection: React.FC<PortalShowcaseProps> = ({ initialQuery = 'Alpine mountains' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [images, setImages] = useState<ImageResult[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null)
  const [activeTab, setActiveTab] = useState<'gallery' | 'circuit-breaker'>('gallery')
  const [cbStats, setCbStats] = useState<Record<string, CircuitBreakerStat> | null>(null)

  const fetchImages = useCallback(async (queryStr: string) => {
    setLoading(true)
    try {
      const res = await axiosClient.get(`/images/search?q=${encodeURIComponent(queryStr)}`)
      const data = res.data?.data || res.data
      if (Array.isArray(data) && data.length > 0) {
        setImages(data)
      } else {
        setImages([])
      }
    } catch {
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCbStats = useCallback(async () => {
    try {
      const res = await axiosClient.get('/admin/stats')
      const data = res.data?.data || res.data
      setCbStats(data)
    } catch {
      setCbStats(null)
    }
  }, [])

  useEffect(() => {
    fetchImages('India Gate Delhi')
    fetchCbStats()
  }, [fetchImages, fetchCbStats])

  const handleSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return
    await fetchImages(queryToSearch.trim())
  }

  const filteredImages = images.filter((img) => {
    if (activeFilter === 'all') return true
    return img.source_site.toLowerCase() === activeFilter.toLowerCase()
  })

  return (
    <section id="showcase" className="relative bg-zinc-950 py-24 sm:py-32 border-b border-zinc-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-sm border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md mb-4">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Interactive Live Engine Demo</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Live Search Portal Showcase
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Query image results in real time. Results are scraped in parallel, deduplicated by URL, sorted by resolution, and interleaved across sources.
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="mt-12 rounded-sm border border-zinc-800 bg-zinc-900/80 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSearch(searchQuery)
              }}
              className="w-full md:w-96 flex items-center gap-2 rounded-sm border border-zinc-700/60 bg-zinc-950 px-3.5 py-2 text-sm focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500"
            >
              <Search className="h-4 w-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search engine query..."
                className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-sm bg-violet-600 px-3 py-1 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Run'}
              </button>
            </form>

            {/* Filter Tabs (All, Bing, DuckDuckGo, Google) */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-500 mr-1 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Source:
              </span>
              {['all', 'bing', 'duckduckgo', 'google'].map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setActiveFilter(filterKey)}
                  className={`rounded-sm px-3 py-1.5 font-medium transition-all capitalize ${
                    activeFilter === filterKey
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 rounded-sm bg-zinc-950 p-1 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('gallery')}
                className={`rounded-sm px-3 py-1.5 font-medium transition-colors ${
                  activeTab === 'gallery' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Image Gallery ({filteredImages.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('circuit-breaker')}
                className={`rounded-sm px-3 py-1.5 font-medium transition-colors ${
                  activeTab === 'circuit-breaker' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Circuit Breakers
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Tab View */}
        {activeTab === 'gallery' && (
          <div className="mt-8">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500 mx-auto" />
                <p className="text-sm text-zinc-400">Scraping Bing, DuckDuckGo & Google in parallel...</p>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="py-20 text-center space-y-2 border border-dashed border-zinc-800 rounded-sm">
                <ImageIcon className="h-10 w-10 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400">No image candidates found for filter '{activeFilter}'.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredImages.map((img, idx) => (
                  <div
                    key={`${img.source_url}-${idx}`}
                    className="group relative overflow-hidden rounded-sm border border-zinc-800 bg-zinc-900/60 transition-all hover:border-zinc-700 hover:shadow-xl hover:shadow-violet-950/20"
                  >
                    {/* Image Preview Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                      <img
                        src={img.thumbnail_url}
                        alt={img.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback placeholder image on load error
                          ;(e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
                        }}
                      />

                      {/* Top Badges overlay */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className="rounded-sm bg-zinc-950/80 backdrop-blur-md border border-zinc-700/50 px-2.5 py-1 text-[10px] font-semibold uppercase text-violet-300">
                          {img.source_site}
                        </span>
                        <span className="rounded-sm bg-zinc-950/80 backdrop-blur-md border border-zinc-700/50 px-2.5 py-1 text-[10px] font-mono text-zinc-300">
                          {img.width}×{img.height}
                        </span>
                      </div>

                      {/* Quick Inspect Hover Button */}
                      <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedImage(img)}
                          className="rounded-sm bg-white/90 p-2.5 text-zinc-950 hover:bg-white transition-transform hover:scale-110"
                          title="Inspect Image"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-4 flex items-center justify-between gap-2">
                      <h4 className="text-xs font-medium text-zinc-200 truncate" title={img.title}>
                        {img.title}
                      </h4>
                      <a
                        href={img.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-violet-400 transition-colors p-1"
                        title="View Original Source"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Circuit Breaker Status Tab View */}
        {activeTab === 'circuit-breaker' && (
          <div className="mt-8 rounded-sm border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Scraper Source Circuit Breaker Status
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {['bing', 'duckduckgo', 'google'].map((src) => {
                const stat = cbStats?.[src] || {
                  available: true,
                  cooldown_remaining_sec: 0,
                  success_rate_pct: 100.0,
                  total_requests: 0,
                  total_successes: 0,
                  total_failures: 0,
                }
                return (
                  <div key={src} className="rounded-sm border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold capitalize text-white">{src} Engine</span>
                      <span
                        className={`rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          stat.available
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                        }`}
                      >
                        {stat.available ? 'Healthy' : 'Cooldown'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-zinc-400">
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="text-zinc-200 font-mono">{stat.success_rate_pct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Requests:</span>
                        <span className="text-zinc-200 font-mono">{stat.total_requests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cooldown:</span>
                        <span className="text-zinc-200 font-mono">{stat.cooldown_remaining_sec}s</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Modal Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
            <div className="relative max-w-4xl w-full rounded-sm border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-semibold text-white truncate max-w-xl">
                  {selectedImage.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="rounded-sm p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-hidden rounded-sm bg-zinc-950 flex items-center justify-center">
                <img
                  src={selectedImage.thumbnail_url}
                  alt={selectedImage.title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-zinc-400">
                <div className="flex items-center gap-4">
                  <span>
                    Provider: <strong className="text-violet-400 capitalize">{selectedImage.source_site}</strong>
                  </span>
                  <span>
                    Dimensions: <strong className="text-zinc-200">{selectedImage.width} × {selectedImage.height} px</strong>
                  </span>
                </div>

                <a
                  href={selectedImage.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-colors"
                >
                  <span>Open Target Host URL</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default PortalShowcaseSection
