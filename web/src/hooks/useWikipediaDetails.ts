import { useQuery } from '@tanstack/react-query'

export interface WikipediaData {
  title: string
  description?: string
  summary?: string
  history?: string
  content?: string
  sections?: Record<string, string>
  wiki_url?: string
  wikipedia_url?: string
  thumbnail_url?: string
  original_image_url?: string
}

export const useWikipediaDetails = (placeIdOrSlug: string) => {
  return useQuery<WikipediaData | null, Error>({
    queryKey: ['place-wikipedia', placeIdOrSlug],
    queryFn: async () => {
      if (!placeIdOrSlug) return null
      const response = await fetch(`/api/v1/places/${placeIdOrSlug}/wikipedia`)
      if (!response.ok) return null
      const json = await response.json()
      return json.data || null
    },
    enabled: !!placeIdOrSlug,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  })
}

export default useWikipediaDetails
