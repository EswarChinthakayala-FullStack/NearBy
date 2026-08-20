import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/common/Icon'
import { uploadService } from '@/services/api/upload.service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface ImageItem {
  url: string
  isCover?: boolean
}

export interface ImageUploaderProps {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
  disabled?: boolean
  className?: string
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images = [],
  onChange,
  disabled = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    if (!navigator.onLine) {
      toast.error('You are offline. Reconnect to upload images.')
      return
    }

    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (!f.type.startsWith('image/')) {
        toast.error(`File '${f.name}' is not an image.`)
        continue
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`Image '${f.name}' exceeds 5 MB size limit.`)
        continue
      }
      validFiles.push(f)
    }

    if (validFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    const newImages: ImageItem[] = [...images]

    for (let i = 0; i < validFiles.length; i++) {
      try {
        const file = validFiles[i]
        const res = await uploadService.uploadImage(file, (percent) => {
          const overall = Math.round(((i + percent / 100) / validFiles.length) * 100)
          setUploadProgress(overall)
        })

        if (res && res.url) {
          const isFirst = newImages.length === 0
          newImages.push({ url: res.url, isCover: isFirst })
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to upload image.'
        toast.error(errorMsg)
      }
    }

    onChange(newImages)
    setIsUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSetCover = (targetUrl: string) => {
    const updated = images.map((img) => ({
      ...img,
      isCover: img.url === targetUrl,
    }))
    onChange(updated)
  }

  const handleRemoveImage = (targetUrl: string) => {
    const updated = images.filter((img) => img.url !== targetUrl)
    // Ensure one image remains cover if available
    if (updated.length > 0 && !updated.some((i) => i.isCover)) {
      updated[0].isCover = true
    }
    onChange(updated)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Drag & Drop Box */}
      <div
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={cn(
          'p-6 rounded-sm border-2 border-dashed border-border/80 bg-background/50 backdrop-blur-sm text-center flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all',
          (disabled || isUploading) && 'opacity-60 cursor-not-allowed pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="w-12 h-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center">
          <Icon name="gallery" size="md" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-bold text-foreground">
            Click to upload or drag and drop images
          </p>
          <p className="text-[11px] text-muted-foreground">
            PNG, JPG, or WebP up to 5 MB each. High resolution landscape photos recommended.
          </p>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="space-y-1.5 p-3 rounded-sm bg-muted/40 border border-border/60">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-foreground">
              <Icon name="loading" size="xs" spinning /> Uploading image(s)...
            </span>
            <span className="font-mono">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-sm overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-full bg-primary rounded-sm transition-all"
            />
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Uploaded Photos ({images.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <AnimatePresence>
              {images.map((img) => (
                <motion.div
                  key={img.url}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group aspect-square rounded-sm overflow-hidden border border-border/70 bg-card shadow-sm"
                >
                  <img src={img.url} alt="Place gallery photo" className="w-full h-full object-cover" />

                  {/* Cover Badge */}
                  {img.isCover && (
                    <Badge variant="default" className="absolute top-1.5 left-1.5 text-[9px] uppercase font-mono bg-emerald-600 text-white">
                      Cover
                    </Badge>
                  )}

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                    {!img.isCover && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetCover(img.url)}
                        title="Set as Cover Image"
                        className="h-7 px-2 text-[10px] font-semibold rounded-sm"
                      >
                        Set Cover
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(img.url)}
                      title="Remove Image"
                      className="h-7 w-7 p-0 rounded-sm"
                    >
                      <Icon name="delete" size="xs" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
