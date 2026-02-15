import axios from 'axios'
import type { Accommodation, AccommodationFormData } from '../features/admin/accommodations/types'

const getApiBaseUrl = () => {
  const raw = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim()
  if (raw && raw.startsWith('http')) {
    try {
      const url = new URL(raw)
      return url.origin
    } catch {
      /* fallthrough */
    }
  }
  return typeof window !== 'undefined' ? window.location.origin : ''
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
})

export interface AccommodationsFilters {
  search?: string
  wilaya?: string
  disponibilite?: 'available' | 'full' | ''
  is_active?: boolean | ''
}

export const accommodationsService = {
  async getAccommodations(filters?: AccommodationsFilters): Promise<Accommodation[]> {
    const { data } = await apiClient.get('/api/admin/accommodations', {
      params: filters,
    })
    return data
  },

  async getAccommodation(id: string): Promise<Accommodation> {
    const { data } = await apiClient.get(`/api/admin/accommodations/${id}`)
    return data
  },

  async createAccommodation(formData: AccommodationFormData): Promise<Accommodation> {
    const { data } = await apiClient.post('/api/admin/accommodations', formData)
    return data
  },

  async updateAccommodation(id: string, formData: AccommodationFormData): Promise<Accommodation> {
    const { data } = await apiClient.put(`/api/admin/accommodations/${id}`, formData)
    return data
  },

  async deleteAccommodation(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/accommodations/${id}`)
  },
}
