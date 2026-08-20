import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { PageHeader } from '@/components/layout/PageHeader'
import { usePlaceDetail } from '@/hooks/usePlaceDetail'

import { useQueryClient } from '@tanstack/react-query'

export interface PhotoItem {
  image_url: string
  thumbnail_url?: string
  title?: string
  source?: string
}

export const PlaceImageExplorerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: place } = usePlaceDetail(id || '')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const observerRef = useRef<IntersectionObserver | null>(null)

  // Fetch photos for place with pagination offset
  const fetchPhotosBatch = useCallback(
    async (offset: number, isInitial = false) => {
      if (!id) return

      if (isInitial) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      try {
        const response = await fetch(`/api/v1/places/${id}/photos?offset=${offset}&limit=16`)
        if (response.ok) {
          const json = await response.json()
          const fetchedItems: PhotoItem[] = json.data || []

          if (fetchedItems.length === 0) {
            setHasMore(false)
          } else {
            setPhotos((prev) => {
              const existingUrls = new Set(prev.map((p) => p.image_url))
              const newItems = fetchedItems.filter((item) => item.image_url && !existingUrls.has(item.image_url))
              if (newItems.length === 0) {
                setHasMore(false)
              }
              const updated = [...prev, ...newItems]
              // Update React Query memory cache so detail page never loses photos
              queryClient.setQueryData(['place-photos', id], updated)
              if (place?.slug) {
                queryClient.setQueryData(['place-photos', place.slug], updated)
              }
              return updated
            })
          }
        }
      } catch (error) {
        console.error('Error fetching photo batch:', error)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [id, place?.slug, queryClient]
  )

  useEffect(() => {
    setPhotos([])
    setHasMore(true)
    fetchPhotosBatch(0, true)
  }, [fetchPhotosBatch])

  // Infinite Scroll Sentinel Handler
  const lastPhotoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore || !hasMore) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPhotosBatch(photos.length, false)
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [loading, loadingMore, hasMore, fetchPhotosBatch, photos.length]
  )

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => new Set(prev).add(url))
  }

  const validPhotos = photos.filter((p) => p.image_url && !failedUrls.has(p.image_url))

  const handleNextLightbox = () => {
    if (lightboxIndex === null || validPhotos.length === 0) return
    setLightboxIndex((lightboxIndex + 1) % validPhotos.length)
  }

  const handlePrevLightbox = () => {
    if (lightboxIndex === null || validPhotos.length === 0) return
    setLightboxIndex((lightboxIndex - 1 + validPhotos.length) % validPhotos.length)
  }

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') handleNextLightbox()
      if (e.key === 'ArrowLeft') handlePrevLightbox()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, validPhotos.length])

  return (
    <div className="min-h-screen bg-background pb-16 pt-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Standard App PageHeader */}
      <PageHeader
        title={place?.name ? `${place.name} HD Photo Explorer` : 'Destination HD Photo Explorer'}
        description={`Browsing satellite imagery, Bing index, and community photos for ${place?.name || 'this location'} with real-time infinite pagination.`}
        breadcrumbs={[
          { label: 'Places', href: '/places' },
          { label: place?.name || 'Destination', href: `/places/${id}` },
          { label: 'Photo Explorer' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-xs"
              title="Return to place detail"
            >
              <Icon name="arrow-left" size="xs" />
              <span>Back to Place</span>
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 shadow-xs">
              <Icon name="gallery" size="xs" />
              <span>{validPhotos.length} Photos Verified</span>
            </span>
          </div>
        }
      />

      {/* Main Image Grid */}
      {loading && validPhotos.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 15 }).map((_, idx) => (
            <div key={idx} className="h-44 sm:h-56 rounded-sm bg-muted/40 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : validPhotos.length === 0 ? (
        <div className="h-72 w-full rounded-sm border border-border bg-muted/20 flex flex-col items-center justify-center space-y-2 text-center p-6">
          <Icon name="gallery" size="lg" className="opacity-40" />
          <h3 className="text-sm font-bold text-foreground">No Photos Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            We could not fetch live Bing images for this location right now. Please try again shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {validPhotos.map((photo, idx) => (
            <motion.div
              key={`${photo.image_url}-${idx}`}
              ref={idx === validPhotos.length - 1 ? lastPhotoElementRef : undefined}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightboxIndex(idx)}
              className="group relative h-44 sm:h-56 rounded-sm overflow-hidden border border-border bg-card shadow-sm cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all"
            >
              <img
                src={photo.thumbnail_url || photo.image_url}
                alt={photo.title || `${place?.name || 'Photo'} ${idx + 1}`}
                onError={() => handleImageError(photo.image_url)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end">
                  <span className="rounded-sm bg-zinc-900/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-zinc-700/50">
                    {photo.source || 'Bing'}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white truncate">{photo.title || place?.name}</p>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Icon name="search" size="xs" className="size-3 text-emerald-400" />
                    <span>Click to expand</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Auto Load Sentinel & Load More Control */}
      {hasMore && (
        <div className="flex flex-col items-center justify-center pt-8 space-y-3">
          <button
            type="button"
            onClick={() => fetchPhotosBatch(validPhotos.length, false)}
            disabled={loadingMore}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-6 text-xs sm:text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all shadow-md disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                <span>Loading More Photos...</span>
              </>
            ) : (
              <>
                <Icon name="refresh" size="xs" />
                <span>Load More Photos</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-muted-foreground font-mono">
            Auto-loading on scroll enabled • Showing {validPhotos.length} photos
          </p>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && validPhotos[lightboxIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl w-full max-h-[90vh] rounded-sm overflow-hidden z-10 bg-card border border-border p-4 flex flex-col items-center justify-center space-y-4 shadow-2xl"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-sm bg-card/80 text-foreground border border-border hover:bg-muted transition-colors"
                aria-label="Close Lightbox"
              >
                <Icon name="close" size="xs" />
              </button>

              {/* Prev / Next Controls */}
              {validPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevLightbox}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-sm bg-card/80 text-foreground border border-border hover:bg-muted transition-colors"
                    aria-label="Previous Image"
                  >
                    <Icon name="arrow-left" size="xs" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextLightbox}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-sm bg-card/80 text-foreground border border-border hover:bg-muted transition-colors"
                    aria-label="Next Image"
                  >
                    <Icon name="arrow-right" size="xs" />
                  </button>
                </>
              )}

              <img
                src={validPhotos[lightboxIndex].image_url}
                alt={validPhotos[lightboxIndex].title || place?.name}
                onError={() => handleImageError(validPhotos[lightboxIndex].image_url)}
                className="max-h-[75vh] w-auto object-contain rounded-sm"
              />

              <div className="flex flex-wrap items-center justify-between w-full text-xs font-mono text-muted-foreground px-2 pt-2 border-t border-border">
                <span className="truncate max-w-md">
                  {validPhotos[lightboxIndex].title || place?.name}
                </span>

                <div className="flex items-center gap-4">
                  <span>Photo {lightboxIndex + 1} of {validPhotos.length}</span>
                  <a
                    href={validPhotos[lightboxIndex].image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Icon name="share" size="xs" />
                    <span>Open HD Original</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PlaceImageExplorerPage
