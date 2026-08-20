import apiClient from './client'
import type { AuthResponse } from '@/types/auth'

export interface UploadResponse {
  url: string
  filename: string
  mime_type: string
  size_bytes: number
}

export const uploadService = {
  uploadImage: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await apiClient.post<AuthResponse<UploadResponse>>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
    })

    return res.data.data!
  },
}

export default uploadService
