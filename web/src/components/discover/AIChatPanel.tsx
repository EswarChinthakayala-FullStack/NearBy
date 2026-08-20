import React, { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon, SentIcon, Navigation01Icon, Loading01Icon } from '@hugeicons/core-free-icons'

interface AIChatPanelProps {
  onSearch: (query: string) => void
  isLoading: boolean
}

const SAMPLE_PROMPTS = [
  'Best waterfalls nearby for weekend trip',
  'Historic heritage temples with quiet surroundings',
  'Family picnic spots under 15 km',
  'Scenic beach viewpoints for couples at sunset',
]

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isLoading) {
      onSearch(query.trim())
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="space-y-2 border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono tracking-widest text-amber-400 uppercase flex items-center gap-1">
            <HugeiconsIcon icon={SparklesIcon} className="size-3.5" />
            Neural AI Assistant
          </span>
        </div>
        <h1 className="text-3xl font-black font-heading tracking-tight text-foreground">
          Natural Language AI Tourism Search
        </h1>
        <p className="text-xs text-muted-foreground">
          Ask questions in plain English to find tailored travel destinations backed by verified GIS coordinates.
        </p>
      </div>

      {/* Suggested Prompts */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
          Suggested Prompts
        </span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setQuery(prompt)
                onSearch(prompt)
              }}
              className="px-3 py-1.5 rounded-sm border border-border bg-card/60 hover:bg-muted text-xs text-foreground transition-colors font-mono flex items-center gap-1.5 disabled:opacity-50"
            >
              <HugeiconsIcon icon={Navigation01Icon} className="size-3 text-emerald-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          disabled={isLoading}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Find scenic waterfalls and nature spots near Panaji..."
          className="w-full h-12 pl-4 pr-12 rounded-sm border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 shadow-sm font-mono disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors shadow-xs"
        >
          <HugeiconsIcon
            icon={isLoading ? Loading01Icon : SentIcon}
            className={`size-4 ${isLoading ? 'animate-spin text-emerald-200' : ''}`}
          />
        </button>
      </form>
    </div>
  )
}

export default AIChatPanel
