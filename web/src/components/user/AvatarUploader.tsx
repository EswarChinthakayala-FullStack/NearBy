import React, { useState, useRef } from 'react'
import ProfileAvatar from './ProfileAvatar'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/common/Icon'
import { uploadService } from '@/services/api/upload.service'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export interface AvatarUploaderProps {
  currentAvatarUrl?: string | null
  userName?: string
  onAvatarChange: (newUrl: string | null) => void
  disabled?: boolean
  className?: string
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  userName = 'User',
  onAvatarChange,
  disabled = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. File Type Validation
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file format. Please select an image (JPEG, PNG, or WebP).')
      return
    }

    // 2. File Size Validation (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds limit. Please choose an image smaller than 5 MB.')
      return
    }

    if (!navigator.onLine) {
      toast.error('You are offline. Reconnect to upload your avatar.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const response = await uploadService.uploadImage(file, (percent) => {
        setUploadProgress(percent)
      })

      if (response && response.url) {
        onAvatarChange(response.url)
        toast.success('Avatar uploaded successfully!')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload avatar image.'
      toast.error(errorMsg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = () => {
    onAvatarChange(null)
    toast.info('Avatar removed.')
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-5 ${className}`}>
      {/* Avatar Display */}
      <div className="relative group">
        <ProfileAvatar src={currentAvatarUrl} name={userName} size="2xl" />

        {isUploading && (
          <div className="absolute inset-0 rounded-sm bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2">
            <Icon name="loading" size="md" spinning />
            <span className="text-[10px] font-mono font-bold mt-1">{uploadProgress}%</span>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="space-y-2 text-center sm:text-left">
        <h5 className="text-sm font-bold text-foreground">Profile Avatar</h5>
        <p className="text-xs text-muted-foreground max-w-xs">
          Upload a high-resolution photo (PNG, JPG, WebP) under 5 MB.
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="avatar-file-input"
            disabled={disabled || isUploading}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="rounded-sm h-8 px-3 text-xs font-semibold"
          >
            <Icon name="upload" size="xs" className="mr-1.5" />
            {currentAvatarUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>

          {currentAvatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={disabled || isUploading}
              className="rounded-sm h-8 px-2.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Icon name="delete" size="xs" className="mr-1" />
              Remove
            </Button>
          )}
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="w-full max-w-xs h-1.5 bg-secondary rounded-sm overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              className="h-full bg-primary rounded-sm transition-all"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AvatarUploader
