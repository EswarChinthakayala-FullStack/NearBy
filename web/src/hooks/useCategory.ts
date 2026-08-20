import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/services/api/categoriesApi'

export function useCategories() {
  return useQuery({
    queryKey: ['categories-list'],
    queryFn: () => categoriesApi.getCategories(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['category-detail', slug],
    queryFn: () => categoriesApi.getCategoryBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  })
}

export default useCategories
