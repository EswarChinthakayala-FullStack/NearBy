import React from 'react'
import { ArrowRight, BookOpen, Sparkles, ShieldCheck, Zap } from 'lucide-react'

export interface CTAProps {
  onSignUpClick?: () => void
  onDocsClick?: () => void
}

export const CTASection: React.FC<CTAProps> = ({ onSignUpClick, onDocsClick }) => {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-24 sm:py-32">
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-zinc-950 to-zinc-950 opacity-80" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-sm border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur-md mb-8">
            <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
            <span>Ready for Production Scrape Workloads</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Start Searching Images with{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Zero API Keys Today
            </span>
          </h2>

          {/* Subtitle */}
          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Parallel multi-provider scraping across Bing, DuckDuckGo, and Google with built-in circuit breakers, Redis deduplication, and thumbnail CDN proxying out of the box.
          </p>

          {/* Key Feature Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-violet-400" />
              <span>Parallel Provider Scrapers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Per-Source Circuit Breakers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>No Credit Card Required</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#signup"
              onClick={(e) => {
                if (onSignUpClick) {
                  e.preventDefault()
                  onSignUpClick()
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-105 active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href="#docs"
              onClick={(e) => {
                if (onDocsClick) {
                  e.preventDefault()
                  onDocsClick()
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm border border-zinc-800 bg-zinc-900/80 px-8 py-4 text-sm font-semibold text-zinc-300 backdrop-blur-md transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              <BookOpen className="h-4 w-4 text-zinc-400" />
              <span>Explore Documentation</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
