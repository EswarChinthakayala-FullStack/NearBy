import { useQuery } from '@tanstack/react-query'
import reviewsService from '@/services/api/reviews.service'
import usersService from '@/services/api/users.service'

/**
 * Hook to fetch authenticated user's submitted reviews from backend
 */
export const useUserReviews = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['userReviews', page, pageSize],
    queryFn: () => reviewsService.getUserReviews(page, pageSize),
    staleTime: 1000 * 60 * 2, // 2 mins
  })
}

/**
 * Hook to fetch authenticated user portal statistics from backend
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: () => usersService.getUserStats(),
    staleTime: 1000 * 60 * 2, // 2 mins
  })
}
