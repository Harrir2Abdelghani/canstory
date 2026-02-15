import { apiClient } from '@/lib/api-client'
import type { Accommodation, AccommodationFormData } from '../features/admin/accommodations/types'

export interface AccommodationsFilters {
  search?: string
  wilaya?: string
  disponibilite?: 'available' | 'full' | ''
  is_active?: boolean | ''
}

export const accommodationsService = {
  async getAccommodations(filters?: AccommodationsFilters): Promise<Accommodation[]> {
    const { data } = await apiClient.instance.get('/admin/accommodations', {
      params: filters,
    })
    return data
  },

  async getAccommodation(id: string): Promise<Accommodation> {
    const { data } = await apiClient.instance.get(`/admin/accommodations/${id}`)
    return data
  },

  async createAccommodation(formData: AccommodationFormData): Promise<Accommodation> {
    const { data } = await apiClient.instance.post('/admin/accommodations', formData)
    return data
  },

  async updateAccommodation(id: string, formData: AccommodationFormData): Promise<Accommodation> {
    const { data } = await apiClient.instance.put(`/admin/accommodations/${id}`, formData)
    return data
  },

  async deleteAccommodation(id: string): Promise<void> {
    await apiClient.instance.delete(`/admin/accommodations/${id}`)
  },
}
