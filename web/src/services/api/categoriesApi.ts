import { axiosClient } from './axiosClient'
import type { Category } from '@/types/category'

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await axiosClient.get('/categories')
    return response.data.data || response.data
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await axiosClient.get(`/categories/${slug}`)
    return response.data.data || response.data
  },
}

export default categoriesApi
