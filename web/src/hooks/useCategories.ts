import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import categoriesService from '@/services/api/categories.service'
import type { CategoryCreateParams, CategoryUpdateParams } from '@/types/category'
import { toast } from 'sonner'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getCategories(),
    staleTime: 1000 * 60 * 15,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CategoryCreateParams) => categoriesService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create category.')
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryUpdateParams }) =>
      categoriesService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update category.')
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete category.')
    },
  })
}
