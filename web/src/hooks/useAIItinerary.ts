import { useMutation, useQuery } from '@tanstack/react-query'
import {
  aiApi,
  type AIItineraryPayload,
  type AIItineraryResponseData,
  type SaveItineraryPayload,
} from '@/services/api/aiApi'

export function useGenerateItinerary() {
  return useMutation<AIItineraryResponseData, Error, AIItineraryPayload>({
    mutationFn: (payload: AIItineraryPayload) => aiApi.generateItinerary(payload),
  })
}

export function useSaveItinerary() {
  return useMutation<{ uuid: string; title: string }, Error, SaveItineraryPayload>({
    mutationFn: (payload: SaveItineraryPayload) => aiApi.saveItinerary(payload),
  })
}

export function useSavedItineraries() {
  return useQuery({
    queryKey: ['saved-itineraries'],
    queryFn: () => aiApi.getSavedItineraries(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSavedItineraryByUuid(uuid: string | null) {
  return useQuery({
    queryKey: ['saved-itinerary', uuid],
    queryFn: () => aiApi.getSavedItineraryByUuid(uuid!),
    enabled: Boolean(uuid),
    staleTime: 10 * 60 * 1000,
  })
}

export function useAIItinerary() {
  return useGenerateItinerary()
}

export default useGenerateItinerary
