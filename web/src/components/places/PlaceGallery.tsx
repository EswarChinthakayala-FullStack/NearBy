import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { usePlacePhotos } from '@/hooks/usePlacePhotos'
import type { PlaceImage } from '@/types/place'

export interface PlaceGalleryProps {
  images?: PlaceImage[]
  coverImageUrl?: string
  placeName: string
  placeSlug?: string
}

export const PlaceGallery: React.FC<PlaceGalleryProps> = ({
  images = [],
  coverImageUrl,
  placeName,
  placeSlug,
}) => {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())
  const { data: cachedPhotos = [] } = usePlacePhotos(placeSlug || '')

  const handleImageError = useCallback((url: string) => {
    setFailedUrls((prev) => new Set(prev).add(url))
  }, [])

  const validImages = React.useMemo(() => {
    const list: PlaceImage[] = []

    // First include images passed from API
    for (const img of images) {
      if (img.image_url && !failedUrls.has(img.image_url) && !list.some((x) => x.image_url === img.image_url)) {
        list.push(img)
      }
    }

    // Merge photos from React Query cache (from HD Explorer or background fetch)
    for (let i = 0; i < cachedPhotos.length; i++) {
      const p = cachedPhotos[i]
      if (p.image_url && !failedUrls.has(p.image_url) && !list.some((x) => x.image_url === p.image_url)) {
        list.push({ id: 1000 + i, image_url: p.image_url, thumbnail_url: p.thumbnail_url })
      }
    }

    // Include coverImageUrl if provided, valid, and not duplicate
    if (
      coverImageUrl &&
      !failedUrls.has(coverImageUrl) &&
      !list.some((x) => x.image_url === coverImageUrl)
    ) {
      list.unshift({ id: 0, image_url: coverImageUrl, is_cover: true })
    }

    return list
  }, [images, cachedPhotos, coverImageUrl, failedUrls])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Ensure selectedIndex stays within bounds when validImages updates
  useEffect(() => {
    if (selectedIndex >= validImages.length && validImages.length > 0) {
      setSelectedIndex(validImages.length - 1)
    }
  }, [validImages.length, selectedIndex])

  const handleNext = useCallback(() => {
    if (validImages.length === 0) return
    setSelectedIndex((prev) => (prev + 1) % validImages.length)
  }, [validImages.length])

  const handlePrev = useCallback(() => {
    if (validImages.length === 0) return
    setSelectedIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }, [validImages.length])

  // Keyboard navigation for Lightbox (Left / Right / Escape)
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, handleNext, handlePrev])

  if (validImages.length === 0) {
    return (
      <div className="h-64 sm:h-80 w-full rounded-sm border border-border bg-muted/30 flex flex-col items-center justify-center space-y-2 text-muted-foreground p-6 text-center">
        <Icon name="gallery" size="lg" className="opacity-50" />
        <p className="text-xs font-bold text-foreground">No Photos Available</p>
        <p className="text-[11px] text-muted-foreground">
          Photos will appear here as soon as verified satellite or community imagery loads.
        </p>
      </div>
    )
  }

  const currentImage = validImages[selectedIndex] || validImages[0]

  return (
    <div className="space-y-4">
      {/* Main Preview Container */}
      <div className="relative h-80 sm:h-[420px] w-full rounded-sm bg-card border border-border overflow-hidden shadow-xl group">
        <img
          src={currentImage.image_url}
          alt={`${placeName} preview ${selectedIndex + 1}`}
          onError={() => handleImageError(currentImage.image_url)}
          className="h-full w-full object-cover transition-all duration-300"
        />

        {/* Overlay Action Buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {placeSlug ? (
            <Link
              to={`/places/${placeSlug}/photos`}
              className="pointer-events-auto flex items-center gap-2 rounded-sm bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 text-xs transition-colors shadow-lg"
            >
              <Icon name="search" size="xs" />
              <span>Explore All HD Photos</span>
            </Link>
          ) : <div />}

          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="pointer-events-auto flex items-center gap-2 rounded-sm bg-card/80 backdrop-blur-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card transition-colors shadow-lg"
          >
            <Icon name="gallery" size="xs" />
            <span>Expand Gallery ({validImages.length})</span>
          </button>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {validImages.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-20 w-28 shrink-0 rounded-sm overflow-hidden border-2 transition-all ${
                selectedIndex === idx
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-border/60 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.image_url}
                alt=""
                onError={() => handleImageError(img.image_url)}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal Dialog */}
      <AnimatePresence>
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl w-full max-h-[85vh] rounded-sm overflow-hidden z-10 bg-card border border-border p-4 flex flex-col items-center justify-center space-y-4"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-sm bg-card/80 text-foreground border border-border hover:bg-muted transition-colors"
                aria-label="Close Lightbox"
              >
                <Icon name="close" size="xs" />
              </button>

              {/* Prev / Next Navigation Controls */}
              {validImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-sm bg-card/80 text-foreground border border-border hover:bg-muted transition-colors"
                    aria-label="Previous Image"
                  >
                    <Icon name="arrow-left" size="xs" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-sm bg-card/80 text-foreground border border-border hover:bg-muted transition-colors"
                    aria-label="Next Image"
                  >
                    <Icon name="arrow-right" size="xs" />
                  </button>
                </>
              )}

              <img
                src={currentImage.image_url}
                alt={placeName}
                className="max-h-[72vh] w-auto object-contain rounded-sm"
              />

              <div className="text-center text-xs font-mono text-muted-foreground">
                Photo {selectedIndex + 1} of {validImages.length} • {placeName}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PlaceGallery
