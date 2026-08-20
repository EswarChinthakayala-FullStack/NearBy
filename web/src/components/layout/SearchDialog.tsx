import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { usePlaces } from '@/hooks/usePlaces'
import type { Place } from '@/types/place'

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const { data: placesResponse, isLoading, isError } = usePlaces(
    query.trim().length > 0 ? { query: query.trim(), page_size: 6 } : undefined
  )

  const places = placesResponse?.data || []

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSelectPlace = (placeUuid: string) => {
    onClose()
    navigate(`/places/${placeUuid}`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl rounded-sm border border-border bg-card shadow-2xl overflow-hidden z-10"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/30">
              <Icon name="search" size="sm" className="text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tourist spots, cities, monuments (e.g. Goa, Aguada)..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-sans"
                autoFocus
              />
              <button
                type="button"
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close search dialog"
              >
                <Icon name="close" size="xs" />
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-80 overflow-y-auto p-4 space-y-2">
              {query.trim().length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Icon name="search" size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Type to search destination spots across the regional index
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="rounded bg-muted px-1.5 py-0.5 border border-border">ESC</span> to exit
                  </div>
                </div>
              ) : isLoading ? (
                <div className="py-8 text-center space-y-2">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-sm border-2 border-emerald-500 border-t-transparent" />
                  <p className="text-xs text-muted-foreground font-mono">Scanning spatial database...</p>
                </div>
              ) : isError ? (
                <div className="py-8 text-center space-y-1">
                  <Icon name="error" size="sm" className="mx-auto text-rose-500" />
                  <p className="text-xs font-bold text-foreground">Search is currently unavailable</p>
                  <p className="text-[11px] text-muted-foreground">Unable to query location search endpoint.</p>
                </div>
              ) : places.length === 0 ? (
                <div className="py-8 text-center space-y-1">
                  <Icon name="location" size="sm" className="mx-auto text-muted-foreground" />
                  <p className="text-xs font-bold text-foreground">No destinations match "{query}"</p>
                  <p className="text-[11px] text-muted-foreground">Try searching for a different city or monument name.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-muted-foreground px-2 pb-1">
                    Matching Locations ({places.length})
                  </div>
                  {places.map((place: Place) => (
                    <button
                      key={place.uuid}
                      type="button"
                      onClick={() => handleSelectPlace(place.uuid)}
                      className="w-full flex items-center justify-between rounded-sm p-2.5 text-left hover:bg-muted/60 transition-colors group"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                          {place.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Icon name="location" size="xs" /> {place.city} • {place.category?.name || 'Destination'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Icon name="star" size="xs" /> {place.avg_rating.toFixed(1)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2 text-[10px] text-muted-foreground font-mono">
              <div className="flex items-center gap-1">
                <Icon name="navigation" size="xs" /> Nearby Location Intelligence Engine
              </div>
              <Link
                to="/places"
                onClick={onClose}
                className="text-emerald-500 hover:underline font-bold"
              >
                View Index →
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SearchDialog
