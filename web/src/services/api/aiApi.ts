import { axiosClient } from './axiosClient'
import type { Place } from '@/types/place'

export interface AISearchPayload {
  query: string
  latitude?: number
  longitude?: number
  max_results?: number
}

export interface AISearchResponseData {
  query: string
  summary: string
  suggested_tags: string[]
  places: Place[]
}

export interface AIItineraryPayload {
  destination: string
  source?: string
  start_date?: string
  end_date?: string
  travel_time?: string
  budget?: string
  transportation?: string
  travel_style?: string[]
  accessibility?: string[]
  food_preferences?: string[]
  accommodation_preference?: string
  adults?: number
  children?: number
  seniors?: number
  pets?: number
}

export interface TimeSlot {
  time: string
  activity: string
  location: string
  notes?: string
  place_uuid?: string
}

export interface DayPlan {
  day: number
  title: string
  slots: TimeSlot[]
}

export interface AIReasoning {
  title: string
  description: string
}

export interface EmergencyContacts {
  hospitals: string[]
  police: string
  pharmacy: string
  atm: string
}

export interface AIItineraryResponseData {
  destination: string
  summary: string
  estimated_cost: string
  recommended_duration: string
  reasoning: AIReasoning[]
  packing_checklist: string[]
  weather_advisory: string
  days: DayPlan[]
  emergency_contacts: EmergencyContacts
  tips: string[]
  places: Place[]
}

export interface SaveItineraryPayload {
  destination: string
  title: string
  travel_dates?: string
  budget?: string
  itinerary_data: any
  reasoning_data?: any
  route_data?: any
}

export const aiApi = {
  search: async (payload: AISearchPayload): Promise<AISearchResponseData> => {
    const response = await axiosClient.post('/ai/search', payload, { timeout: 45000 })
    return response.data.data || response.data
  },

  generateItinerary: async (payload: AIItineraryPayload): Promise<AIItineraryResponseData> => {
    const response = await axiosClient.post('/ai/itinerary', payload, { timeout: 45000 })
    return response.data.data || response.data
  },

  saveItinerary: async (payload: SaveItineraryPayload): Promise<{ uuid: string; title: string }> => {
    const response = await axiosClient.post('/ai/itinerary/save', payload)
    return response.data.data || response.data
  },

  getSavedItineraries: async (): Promise<any[]> => {
    const response = await axiosClient.get('/ai/itinerary/saved')
    return response.data.data || response.data
  },

  getSavedItineraryByUuid: async (uuid: string): Promise<any> => {
    const response = await axiosClient.get(`/ai/itinerary/saved/${uuid}`)
    return response.data.data || response.data
  },

  exportPdf: async (itineraryData: any): Promise<Blob> => {
    const response = await axiosClient.post(
      '/ai/itinerary/export-pdf',
      { itinerary_data: itineraryData },
      { responseType: 'blob' }
    )
    return response.data
  },
}

export default aiApi
