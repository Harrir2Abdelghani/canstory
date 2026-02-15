import axios from 'axios'
import { z } from 'zod'

const getApiBaseUrl = () => {
  const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ''
  if (base && base.startsWith('http')) return base.replace(/\/api\/?$/, '') || base
  return typeof window !== 'undefined' ? window.location.origin : ''
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  withCredentials: true,
})

export type AnnuaireRole = 'medecin' | 'centre_cancer' | 'psychologue' | 'laboratoire' | 'pharmacie' | 'association'
export type AnnuaireStatus = 'pending' | 'approved' | 'rejected'

const annuaireEntrySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  annuaire_role: z.enum(['medecin', 'centre_cancer', 'psychologue', 'laboratoire', 'pharmacie', 'association']),
  name: z.string(),
  email: z.string().email().or(z.string()),
  phone: z.string().nullable().optional(),
  wilaya: z.string().nullable().optional(),
  commune: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  metadata: z.record(z.string(), z.any()).optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type AnnuaireEntry = z.infer<typeof annuaireEntrySchema>

const doctorSpecSchema = z.object({
  id: z.string(),
  annuaire_entry_id: z.string(),
  specialization: z.string(),
  license_number: z.string(),
  hospital_affiliation: z.string().nullable().optional(),
  consultation_fee: z.number().nullable().optional(),
  years_of_experience: z.number().nullable().optional(),
  education: z.array(z.any()).nullable().optional(),
  certifications: z.array(z.any()).nullable().optional(),
  languages_spoken: z.array(z.string()).nullable().optional(),
  accepts_new_patients: z.boolean().default(true),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type DoctorSpec = z.infer<typeof doctorSpecSchema>

const cancerCenterSchema = z.object({
  id: z.string(),
  annuaire_entry_id: z.string(),
  center_name: z.string(),
  registration_number: z.string(),
  address: z.string(),
  emergency_phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  departments: z.record(z.string(), z.any()).nullable().optional(),
  services: z.record(z.string(), z.any()).nullable().optional(),
  equipment: z.record(z.string(), z.any()).nullable().optional(),
  bed_capacity: z.number().nullable().optional(),
  has_emergency: z.boolean().default(true),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type CancerCenter = z.infer<typeof cancerCenterSchema>

const psychologistSchema = z.object({
  id: z.string(),
  annuaire_entry_id: z.string(),
  specialization: z.string(),
  license_number: z.string(),
  office_address: z.string().nullable().optional(),
  consultation_fee: z.number().nullable().optional(),
  years_of_experience: z.number().nullable().optional(),
  education: z.array(z.any()).nullable().optional(),
  certifications: z.array(z.any()).nullable().optional(),
  languages_spoken: z.array(z.string()).nullable().optional(),
  accepts_new_patients: z.boolean().default(true),
  therapy_types: z.record(z.string(), z.any()).nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type Psychologist = z.infer<typeof psychologistSchema>

const laboratorySchema = z.object({
  id: z.string(),
  annuaire_entry_id: z.string(),
  lab_name: z.string(),
  license_number: z.string(),
  address: z.string(),
  working_hours: z.record(z.string(), z.any()),
  test_types: z.record(z.string(), z.any()).nullable().optional(),
  accreditations: z.array(z.string()).nullable().optional(),
  has_home_service: z.boolean().default(false),
  average_turnaround_time: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type Laboratory = z.infer<typeof laboratorySchema>

const pharmacySchema = z.object({
  id: z.string(),
  annuaire_entry_id: z.string(),
  pharmacy_name: z.string(),
  license_number: z.string(),
  address: z.string(),
  emergency_phone: z.string().nullable().optional(),
  working_hours: z.record(z.string(), z.any()),
  services: z.record(z.string(), z.any()).nullable().optional(),
  has_delivery: z.boolean().default(false),
  is_24_hours: z.boolean().default(false),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type Pharmacy = z.infer<typeof pharmacySchema>

const associationSchema = z.object({
  id: z.string(),
  annuaire_entry_id: z.string(),
  association_name: z.string(),
  registration_number: z.string(),
  description: z.string().nullable().optional(),
  address: z.string(),
  website: z.string().nullable().optional(),
  focus_areas: z.array(z.string()).nullable().optional(),
  services_offered: z.record(z.string(), z.any()).nullable().optional(),
  volunteer_opportunities: z.record(z.string(), z.any()).nullable().optional(),
  donation_info: z.record(z.string(), z.any()).nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

export type Association = z.infer<typeof associationSchema>

export interface CreateAnnuairePayload {
  annuaire_role: AnnuaireRole
  name: string
  email: string
  phone?: string
  wilaya?: string
  commune?: string
  avatar?: {
    data: string
    name: string
    type: string
  }
  bio?: string
  roleSpecificData: Record<string, any>
}

export interface UpdateAnnuairePayload {
  name?: string
  email?: string
  phone?: string | null
  wilaya?: string
  commune?: string
  bio?: string | null
  avatar?: {
    data: string
    name: string
    type: string
  }
  roleSpecificData?: Record<string, any>
}

export class AnnuaireService {
  async getAnnuaireEntries(params: { search?: string; role?: AnnuaireRole; status?: AnnuaireStatus; wilaya?: string } = {}): Promise<AnnuaireEntry[]> {
    try {
      return await this.getAnnuaireEntriesFromAPI(params)
    } catch (error) {
      console.error('Error fetching from API:', error)
      return []
    }
  }

  private async getAnnuaireEntriesFromAPI(params: { search?: string; role?: AnnuaireRole; status?: AnnuaireStatus; wilaya?: string } = {}): Promise<AnnuaireEntry[]> {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append('search', params.search)
    if (params.role) queryParams.append('role', params.role)
    if (params.status) queryParams.append('status', params.status)
    if (params.wilaya) queryParams.append('wilaya', params.wilaya)

    const response = await apiClient.get(`/api/admin/annuaire?${queryParams.toString()}`)
    const entries = response.data?.data || []
    return entries.map((entry: any) => annuaireEntrySchema.parse(entry))
  }


  async createAnnuaireEntry(payload: CreateAnnuairePayload): Promise<{ entry: AnnuaireEntry; tempPassword?: string }> {
    const response = await apiClient.post('/api/admin/annuaire', payload)
    return {
      entry: annuaireEntrySchema.parse(response.data?.data),
      tempPassword: response.data?.tempPassword,
    }
  }

  async updateAnnuaireEntry(entryId: string, payload: UpdateAnnuairePayload): Promise<AnnuaireEntry> {
    const response = await apiClient.patch(`/api/admin/annuaire/${entryId}`, payload)
    return annuaireEntrySchema.parse(response.data?.data)
  }

  async updateAnnuaireStatus(entryId: string, status: AnnuaireStatus): Promise<AnnuaireEntry> {
    const response = await apiClient.patch(`/api/admin/annuaire/${entryId}/status`, { status })
    return annuaireEntrySchema.parse(response.data?.data)
  }

  async deleteAnnuaireEntry(entryId: string): Promise<void> {
    await apiClient.delete(`/api/admin/annuaire/${entryId}`)
  }

  async getDoctorSpec(entryId: string): Promise<DoctorSpec | null> {
    try {
      const response = await apiClient.get(`/api/admin/annuaire/${entryId}/doctor-spec`)
      return doctorSpecSchema.parse(response.data?.data)
    } catch {
      return null
    }
  }

  async getCancerCenter(entryId: string): Promise<CancerCenter | null> {
    try {
      const response = await apiClient.get(`/api/admin/annuaire/${entryId}/cancer-center`)
      return cancerCenterSchema.parse(response.data?.data)
    } catch {
      return null
    }
  }

  async getPsychologist(entryId: string): Promise<Psychologist | null> {
    try {
      const response = await apiClient.get(`/api/admin/annuaire/${entryId}/psychologist`)
      return psychologistSchema.parse(response.data?.data)
    } catch {
      return null
    }
  }

  async getLaboratory(entryId: string): Promise<Laboratory | null> {
    try {
      const response = await apiClient.get(`/api/admin/annuaire/${entryId}/laboratory`)
      return laboratorySchema.parse(response.data?.data)
    } catch {
      return null
    }
  }

  async getPharmacy(entryId: string): Promise<Pharmacy | null> {
    try {
      const response = await apiClient.get(`/api/admin/annuaire/${entryId}/pharmacy`)
      return pharmacySchema.parse(response.data?.data)
    } catch {
      return null
    }
  }

  async getAssociation(entryId: string): Promise<Association | null> {
    try {
      const response = await apiClient.get(`/api/admin/annuaire/${entryId}/association`)
      return associationSchema.parse(response.data?.data)
    } catch {
      return null
    }
  }
}

export const annuaireService = new AnnuaireService()
