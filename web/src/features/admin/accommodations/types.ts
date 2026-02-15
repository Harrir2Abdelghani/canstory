export interface Accommodation {
  id: string
  provider_id: string
  name: string
  description: string | null
  address: string
  wilaya: string
  commune: string
  phone: string
  email: string | null
  capacity: number
  available_beds: number
  amenities: string[] | null
  rules: string[] | null
  photos: string[] | null
  is_active: boolean
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
  availability_status?: 'available' | 'full' | 'inactive'
}

export interface AccommodationFormData {
  name: string
  wilaya: string
  commune: string
  address: string
  phone: string
  email: string
  capacity: number
  available_beds: number
  description: string
  amenities: string
  rules: string
  is_active: boolean
  latitude: number | null
  longitude: number | null
}

export interface LocationData {
  latitude: number
  longitude: number
  address?: string
}
