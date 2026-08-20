import React, { useState, useEffect } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons'

const LOADING_STEPS = [
  'Finding destinations from spatial database...',
  'Analyzing travel preferences and budget tier...',
  'Checking destination weather forecast...',
  'Optimizing multi-stop GIS transit routes...',
  'Calculating travel times and waypoint ETAs...',
  'Selecting local dining and cultural spots...',
  'Preparing personalized AI itinerary response...',
]

export const AILoadingSequence: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev))
    }, 1200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="p-8 rounded-sm border border-border bg-card shadow-xl max-w-xl mx-auto space-y-6 text-center">
      {/* Animated Glowing AI Orb */}
      <div className="relative mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ring-8 ring-emerald-500/10 animate-pulse">
        <HugeiconsIcon icon={SparklesIcon} className="size-8 animate-spin" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold font-heading text-foreground">Nearby AI is Reasoning</h3>
        <p className="text-xs text-muted-foreground font-mono">Synthesizing travel preferences with database GIS coordinates...</p>
      </div>

      {/* Steps List */}
      <div className="space-y-2 text-left max-w-md mx-auto border-t border-border pt-4">
        {LOADING_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex
          const isCurrent = idx === currentStepIndex

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-xs font-mono transition-opacity ${
                isDone
                  ? 'text-emerald-400 opacity-100'
                  : isCurrent
                  ? 'text-foreground font-bold opacity-100'
                  : 'text-muted-foreground/40 opacity-40'
              }`}
            >
              <div className="size-4 shrink-0 flex items-center justify-center">
                {isDone ? (
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="size-2 rounded-full bg-amber-400 animate-ping" />
                ) : (
                  <div className="size-1.5 rounded-full bg-muted" />
                )}
              </div>
              <span className="truncate">{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AILoadingSequence
