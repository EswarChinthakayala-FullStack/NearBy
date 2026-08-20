import React from 'react'
import { Search, Server, Layers, CheckCircle2, ArrowRight } from 'lucide-react'

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'FastAPI Gateway & Cache Check',
      description: 'Incoming search request hits GET /images/search. First checks Redis cache (key imgsearch:{q}:{page}). Returns instantly on hit.',
      icon: Search,
    },
    {
      number: '02',
      title: 'Parallel Celery Scraper Task Group',
      description: 'On cache miss, fires parallel workers for Bing (Playwright), DuckDuckGo (httpx + vqd), and Google Images simultaneously.',
      icon: Server,
    },
    {
      number: '03',
      title: 'Aggregator Chord Callback',
      description: 'Merges provider payloads, strips query parameters to deduplicate URLs, ranks by width × height resolution, and interleaves sources.',
      icon: Layers,
    },
    {
      number: '04',
      title: 'CDN Proxy & 6h Redis Cache',
      description: 'Caches output in Redis (21,600s TTL) and proxies image thumbnail loads through /thumb with source Referer headers.',
      icon: CheckCircle2,
    },
  ]

  return (
    <section id="how-it-works" className="relative bg-zinc-950 py-24 sm:py-32 border-b border-zinc-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            System Architecture
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How The Keyless Search Pipeline Works
          </p>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            An end-to-end resilient architecture combining FastAPI async endpoints, Celery parallel chords, and Redis caching.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="relative rounded-sm border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold text-violet-500/40">
                      {step.number}
                    </span>
                    <div className="h-10 w-10 rounded-sm bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    {step.description}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-zinc-700">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
