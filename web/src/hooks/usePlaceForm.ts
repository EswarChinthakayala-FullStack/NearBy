import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Place } from '@/types/place'

export const placeFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Place name must be at least 2 characters')
    .max(150, 'Place name cannot exceed 150 characters'),
  category_id: z.coerce.number({ required_error: 'Category is required' }),
  slug: z.string().optional(),
  status: z.enum(['published', 'draft', 'archived']),
  description: z.string().optional(),
  history: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(2, 'City name is required'),
  state: z.string().optional(),
  country: z.string(),
  latitude: z.coerce
    .number({ required_error: 'Latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce
    .number({ required_error: 'Longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  entry_fee: z.string().optional(),
  best_time_to_visit: z.string().optional(),
  weekly_schedule: z.record(z.unknown()).optional(),
  image_urls: z.array(z.string()),
})

export type PlaceFormData = z.infer<typeof placeFormSchema>

export const usePlaceForm = (initialPlace?: Place | null) => {
  const form = useForm<PlaceFormData>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      name: initialPlace?.name || '',
      category_id: initialPlace?.category?.id || initialPlace?.category_id || 1,
      slug: initialPlace?.slug || '',
      status: (initialPlace?.status as 'published' | 'draft' | 'archived') || 'published',
      description: initialPlace?.description || '',
      history: initialPlace?.history || '',
      address: initialPlace?.address || '',
      city: initialPlace?.city || '',
      state: initialPlace?.state || '',
      country: initialPlace?.country || 'India',
      latitude: initialPlace?.latitude || 15.4989,
      longitude: initialPlace?.longitude || 73.8278,
      entry_fee: initialPlace?.entry_fee ? String(initialPlace.entry_fee) : '',
      best_time_to_visit: initialPlace?.best_time_to_visit || '',
      weekly_schedule: (initialPlace as unknown as Record<string, unknown>)?.weekly_schedule || {},
      image_urls: initialPlace?.images ? initialPlace.images.map((img) => img.image_url) : [],
    },
  })

  return form
}

export default usePlaceForm
