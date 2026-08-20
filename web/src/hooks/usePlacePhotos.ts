import { useQuery } from '@tanstack/react-query'

export interface PhotoItem {
  image_url: string
  thumbnail_url?: string
  title?: string
  source?: string
}

export const usePlacePhotos = (placeIdOrSlug: string) => {
  return useQuery<PhotoItem[], Error>({
    queryKey: ['place-photos', placeIdOrSlug],
    queryFn: async () => {
      if (!placeIdOrSlug) return []
      const response = await fetch(`/api/v1/places/${placeIdOrSlug}/photos?offset=0&limit=16`)
      if (!response.ok) return []
      const json = await response.json()
      return json.data || []
    },
    enabled: !!placeIdOrSlug,
    staleTime: 1000 * 60 * 15, // 15 minutes in memory stale time
    gcTime: 1000 * 60 * 60, // 60 minutes garbage collection time
  })
}

export default usePlacePhotos
