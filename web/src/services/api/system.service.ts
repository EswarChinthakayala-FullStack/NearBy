import apiClient from './client'

export interface SystemHealth {
  status: string
  service?: string
  project?: string
  version?: string
  database?: string
  redis?: string
}

export const systemService = {
  getHealth: async (): Promise<SystemHealth> => {
    const res = await apiClient.get<SystemHealth>('/health')
    return res.data
  },

  getDbHealth: async (): Promise<SystemHealth> => {
    const res = await apiClient.get<SystemHealth>('/health/db')
    return res.data
  },

  getRedisHealth: async (): Promise<SystemHealth> => {
    const res = await apiClient.get<SystemHealth>('/health/redis')
    return res.data
  },
}

export default systemService
