import React, { useEffect, useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icon } from '@/components/common/Icon'
import ImageUploader, { type ImageItem } from './ImageUploader'
import TimingsEditor from './TimingsEditor'
import OfflineBanner from '@/components/common/OfflineBanner'
import { useCategories } from '@/hooks/useCategories'
import { useCreatePlace, useUpdatePlace } from '@/hooks/usePlaces'
import type { Place } from '@/types/place'
import { toast } from 'sonner'

const placeFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Place name must be at least 2 characters')
    .max(200, 'Place name cannot exceed 200 characters'),
  slug: z.string().optional(),
  category_id: z.coerce.number({ required_error: 'Please select a category' }).min(1, 'Category is required'),
  description: z.string().optional(),
  history: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  latitude: z.coerce.number({ required_error: 'Latitude coordinate is required' }),
  longitude: z.coerce.number({ required_error: 'Longitude coordinate is required' }),
  entry_fee: z.string().optional(),
  best_time_to_visit: z.string().optional(),
  opening_hours: z.string().optional(),
  status: z.enum(['published', 'draft', 'archived']),
})

export type PlaceFormData = z.infer<typeof placeFormSchema>

export interface AdminPlaceFormProps {
  existingPlace?: Place | null
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export const AdminPlaceForm: React.FC<AdminPlaceFormProps> = ({
  existingPlace,
  onSuccess,
  onCancel,
  className = '',
}) => {
  const isEditing = !!existingPlace
  const { data: categories = [] } = useCategories()

  const createMutation = useCreatePlace()
  const updateMutation = useUpdatePlace()

  const [images, setImages] = useState<ImageItem[]>([])
  const [prevExistingPlace, setPrevExistingPlace] = useState(existingPlace)

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlaceFormData>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      name: existingPlace?.name || '',
      slug: existingPlace?.slug || '',
      category_id: Number(existingPlace?.category?.id || categories[0]?.id || 1),
      description: existingPlace?.description || '',
      history: existingPlace?.history || '',
      address: existingPlace?.address || '',
      city: existingPlace?.city || 'Delhi',
      state: existingPlace?.state || 'Delhi',
      country: existingPlace?.country || 'India',
      latitude: existingPlace?.latitude || 28.6139,
      longitude: existingPlace?.longitude || 77.209,
      entry_fee: String(existingPlace?.entry_fee || ''),
      best_time_to_visit: existingPlace?.best_time_to_visit || '',
      opening_hours: typeof existingPlace?.opening_hours === 'string' ? existingPlace.opening_hours : '',
      status: (existingPlace?.status as 'published' | 'draft' | 'archived') || 'published',
    },
  })

  // Derived state sync for editing existing place during render
  if (existingPlace !== prevExistingPlace) {
    setPrevExistingPlace(existingPlace)
    if (existingPlace) {
      reset({
        name: existingPlace.name,
        slug: existingPlace.slug,
        category_id: Number(existingPlace.category?.id || categories[0]?.id || 1),
        description: existingPlace.description || '',
        history: existingPlace.history || '',
        address: existingPlace.address || '',
        city: existingPlace.city || 'Delhi',
        state: existingPlace.state || 'Delhi',
        country: existingPlace.country || 'India',
        latitude: existingPlace.latitude || 28.6139,
        longitude: existingPlace.longitude || 77.209,
        entry_fee: String(existingPlace.entry_fee || ''),
        best_time_to_visit: existingPlace.best_time_to_visit || '',
        opening_hours: typeof existingPlace.opening_hours === 'string' ? existingPlace.opening_hours : '',
        status: (existingPlace.status as 'published' | 'draft' | 'archived') || 'published',
      })

      if (existingPlace.images && existingPlace.images.length > 0) {
        setImages(
          existingPlace.images.map((img, idx) => ({
            url: img.image_url,
            isCover: idx === 0 || img.image_url === existingPlace.cover_image_url,
          }))
        )
      } else if (existingPlace.cover_image_url) {
        setImages([{ url: existingPlace.cover_image_url, isCover: true }])
      }
    }
  }

  const placeName = useWatch({ control, name: 'name' })

  // Auto generate slug from name if empty
  useEffect(() => {
    if (!isEditing && placeName) {
      const generatedSlug = placeName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setValue('slug', generatedSlug)
    }
  }, [placeName, isEditing, setValue])

  const onSubmit = (data: PlaceFormData) => {
    if (!navigator.onLine) {
      toast.error('You are offline. Reconnect to save place changes.')
      return
    }

    const payload = {
      ...data,
      cover_image_url: images.find((i) => i.isCover)?.url || images[0]?.url || undefined,
    }

    if (isEditing && existingPlace) {
      updateMutation.mutate(
        { uuid: existingPlace.uuid, data: payload },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess()
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          if (onSuccess) onSuccess()
        },
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || isSubmitting

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className={`p-6 md:p-8 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-8 max-w-6xl w-full mx-auto ${className}`}
    >
      <OfflineBanner />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Icon name={isEditing ? 'edit' : 'building'} size="sm" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {isEditing ? 'Edit Tourist Destination' : 'Create New Tourist Destination'}
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure place taxonomy, location coordinates, overview, entry details, and media gallery.
            </p>
          </div>
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Icon name="close" size="xs" />
          </Button>
        )}
      </div>

      {/* Section 1: Basic Information & Taxonomy */}
      <div className="p-4 rounded-sm border border-border/50 bg-background/40 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Icon name="categories" size="xs" className="text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Primary Details & Category Taxonomy</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Place Name */}
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="place-name" className="text-xs font-bold text-foreground">
              Place Name <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="place-name"
                  placeholder="e.g. Red Fort (Lal Qila)"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 text-sm font-semibold"
                />
              )}
            />
            {errors.name && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category Select (Fixed Display) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Category Taxonomy <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => {
                const selectedCat = categories.find((c) => Number(c.id) === Number(field.value))
                return (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(val: any) => val && field.onChange(parseInt(String(val), 10))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="rounded-sm border-border/70 bg-background/80 text-xs font-semibold h-10">
                      <SelectValue placeholder="Select Category">
                        {selectedCat ? selectedCat.name : field.value ? `Category #${field.value}` : 'Select Category'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-sm shadow-lg border-border/70">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)} className="text-xs font-medium">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              }}
            />
            {errors.category_id && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.category_id.message}</p>
            )}
          </div>

          {/* Slug Input */}
          <div className="space-y-1.5 lg:col-span-2">
            <Label htmlFor="place-slug" className="text-xs font-bold text-foreground">
              URL Slug
            </Label>
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="place-slug"
                  placeholder="red-fort-delhi"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 text-sm font-mono"
                />
              )}
            />
          </div>

          {/* Status Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Publication Status
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(val: any) => val && field.onChange(val as 'published' | 'draft' | 'archived')} disabled={isLoading}>
                  <SelectTrigger className="rounded-sm border-border/70 bg-background/80 text-xs font-semibold h-10">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm shadow-lg border-border/70">
                    <SelectItem value="published" className="text-xs font-semibold text-emerald-500">
                      Published (Visible publicly)
                    </SelectItem>
                    <SelectItem value="draft" className="text-xs font-semibold text-amber-500">
                      Draft (Admin preview)
                    </SelectItem>
                    <SelectItem value="archived" className="text-xs font-semibold text-muted-foreground">
                      Archived (Hidden)
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      {/* Section 2: GIS Coordinates & Location */}
      <div className="p-4 rounded-sm border border-border/50 bg-background/40 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Icon name="location" size="xs" className="text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">GIS Coordinates & Regional Location</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* City */}
          <div className="space-y-1.5">
            <Label htmlFor="place-city" className="text-xs font-bold text-foreground">
              City <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="place-city"
                  placeholder="Delhi"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 text-sm font-medium"
                />
              )}
            />
            {errors.city && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <Label htmlFor="place-state" className="text-xs font-bold text-foreground">
              State / Region
            </Label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="place-state"
                  placeholder="Delhi NCR"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 text-sm"
                />
              )}
            />
          </div>

          {/* Latitude */}
          <div className="space-y-1.5">
            <Label htmlFor="place-lat" className="text-xs font-bold text-foreground">
              Latitude Coordinate <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="place-lat"
                  type="number"
                  step="any"
                  placeholder="28.6562"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 font-mono text-sm"
                />
              )}
            />
            {errors.latitude && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.latitude.message}</p>
            )}
          </div>

          {/* Longitude */}
          <div className="space-y-1.5">
            <Label htmlFor="place-lng" className="text-xs font-bold text-foreground">
              Longitude Coordinate <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="place-lng"
                  type="number"
                  step="any"
                  placeholder="77.2410"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 font-mono text-sm"
                />
              )}
            />
            {errors.longitude && (
              <p className="text-xs text-destructive font-medium mt-1">{errors.longitude.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Overview & Visitor Guidance */}
      <div className="p-4 rounded-sm border border-border/50 bg-background/40 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Icon name="info" size="xs" className="text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Overview, History & Visiting Details</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="place-desc" className="text-xs font-bold text-foreground">
              Overview & Description
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="place-desc"
                  placeholder="Detailed summary of architecture, attractions, visitor guidance..."
                  rows={4}
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 text-sm leading-relaxed"
                />
              )}
            />
          </div>

          {/* History */}
          <div className="space-y-1.5">
            <Label htmlFor="place-history" className="text-xs font-bold text-foreground">
              Historical Background
            </Label>
            <Controller
              name="history"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="place-history"
                  placeholder="Historical origin, empire, construction, heritage status..."
                  rows={4}
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 text-sm leading-relaxed"
                />
              )}
            />
          </div>

          {/* Entry Fee */}
          <div className="space-y-1.5">
            <Label htmlFor="place-fee" className="text-xs font-bold text-foreground">
              Entry Fee Guidance
            </Label>
            <Controller
              name="entry_fee"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="place-fee"
                  placeholder="e.g. ₹50 for Indians, ₹600 for Foreigners"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 text-sm"
                />
              )}
            />
          </div>

          {/* Best Time to Visit */}
          <div className="space-y-1.5">
            <Label htmlFor="place-best-time" className="text-xs font-bold text-foreground">
              Best Time To Visit
            </Label>
            <Controller
              name="best_time_to_visit"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="place-best-time"
                  placeholder="e.g. October to March (Mornings & Evenings)"
                  disabled={isLoading}
                  className="rounded-sm border-border/70 bg-background/80 text-sm"
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Section 4: Media Upload Component */}
      <div className="p-4 rounded-sm border border-border/50 bg-background/40 space-y-3">
        <div className="flex items-center gap-2 border-b border-border/40 pb-2">
          <Icon name="image" size="xs" className="text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Place Media Gallery & Cover Image</h4>
        </div>
        <ImageUploader images={images} onChange={setImages} disabled={isLoading} />
      </div>

      {/* Section 5: Operating Hours Timings Editor */}
      <div className="p-4 rounded-sm border border-border/50 bg-background/40">
        <Controller
          name="opening_hours"
          control={control}
          render={({ field }) => (
            <TimingsEditor
              value={field.value}
              onChange={field.onChange}
              disabled={isLoading}
            />
          )}
        />
      </div>

      {/* Form Actions Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-sm text-xs font-semibold h-10 px-5"
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-sm bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold h-10 px-7 shadow-sm hover:shadow transition-all text-xs"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Icon name="loading" size="xs" spinning />
              {isEditing ? 'Updating...' : 'Saving...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Icon name="check" size="xs" />
              {isEditing ? 'Update Place Record' : 'Create Place Record'}
            </span>
          )}
        </Button>
      </div>
    </motion.form>
  )
}

export default AdminPlaceForm
