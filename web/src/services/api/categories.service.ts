import apiClient from './client'
import type { Category, CategoryCreateParams, CategoryUpdateParams } from '@/types/category'
import type { AuthResponse } from '@/types/auth'

export const categoriesService = {
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<AuthResponse<Category[]>>('/categories')
    return res.data.data || []
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const res = await apiClient.get<AuthResponse<Category>>(`/categories/${slug}`)
    return res.data.data!
  },

  createCategory: async (data: CategoryCreateParams): Promise<Category> => {
    const res = await apiClient.post<AuthResponse<Category>>('/categories', data)
    return res.data.data!
  },

  updateCategory: async (id: number | string, data: CategoryUpdateParams): Promise<Category> => {
    const res = await apiClient.patch<AuthResponse<Category>>(`/categories/${id}`, data)
    return res.data.data!
  },

  deleteCategory: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}

export default categoriesService
