import React from 'react'

export interface AISearchIllustrationProps {
  className?: string
}

export const AISearchIllustration: React.FC<AISearchIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full aspect-video max-w-lg mx-auto flex items-center justify-center ${className}`}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/15 via-amber-500/10 to-emerald-600/15 rounded-sm blur-2xl" />

      {/* Main Glass Panel */}
      <div className="relative w-full h-full rounded-sm border border-border/80 bg-card/70 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between overflow-hidden">
        {/* Mock Query Prompt Bar */}
        <div className="flex items-center gap-3 rounded-sm border border-emerald-500/30 bg-background/80 px-4 py-3 text-xs font-mono">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400 animate-pulse" />
          <span className="text-foreground font-semibold">"Find quiet heritage spots in Delhi with 4+ rating"</span>
        </div>

        {/* AI Processing Sparkles & Network Mesh */}
        <div className="my-auto py-4 flex items-center justify-around text-xs font-mono">
          <div className="flex items-center gap-2 p-3 rounded-sm bg-card border border-border text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Vector Match 98%</span>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-sm bg-card border border-border text-amber-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>TSP Route Solved</span>
          </div>
        </div>

        {/* Status Footnote */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>Model: Nearby-NLP-v2</span>
          <span className="text-emerald-400 font-bold">Execution: 42ms</span>
        </div>
      </div>
    </div>
  )
}

export default AISearchIllustration
