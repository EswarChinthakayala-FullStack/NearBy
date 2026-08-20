import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import favoritesService from '@/services/api/favorites.service'
import type { FavoriteToggleResponse } from '@/types/favorite'
import { toast } from 'sonner'

export const useFavorites = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['favorites', page, pageSize],
    queryFn: () => favoritesService.getFavorites(page, pageSize),
    staleTime: 1000 * 60 * 5,
  })
}

export const useToggleFavorite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (placeUuid: string) => favoritesService.toggleFavorite(placeUuid),
    onSuccess: (data: FavoriteToggleResponse) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      queryClient.invalidateQueries({ queryKey: ['places'] })
      queryClient.invalidateQueries({ queryKey: ['place'] })
      queryClient.invalidateQueries({ queryKey: ['browse-places'] })
      queryClient.invalidateQueries({ queryKey: ['nearbyPlaces'] })
      queryClient.invalidateQueries({ queryKey: ['nearby'] })
      queryClient.invalidateQueries({ queryKey: ['userStats'] })

      const msg = data?.message || data?.data?.message || 'Favorite bookmark updated'
      toast.success(msg)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update favorite status')
    },
  })
}

export default useFavorites
