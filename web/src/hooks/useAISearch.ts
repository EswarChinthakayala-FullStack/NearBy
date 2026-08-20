import { useMutation } from '@tanstack/react-query'
import { aiApi, type AISearchPayload, type AISearchResponseData } from '@/services/api/aiApi'

export function useAISearch() {
  return useMutation<AISearchResponseData, Error, AISearchPayload>({
    mutationFn: (payload: AISearchPayload) => aiApi.search(payload),
  })
}

export default useAISearch
