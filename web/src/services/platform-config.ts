import axios from 'axios'

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

// =====================================================
// WILAYAS SERVICE
// =====================================================

export interface Wilaya {
  id: string
  code: string
  name: string
  ar_name: string
  longitude?: string
  latitude?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Commune {
  id: string
  post_code: string
  name: string
  ar_name: string
  wilaya_id: string
  longitude?: string
  latitude?: string
  created_at?: string
  updated_at?: string
}

export const wilayasService = {
  async getWilayas(): Promise<Wilaya[]> {
    const { data } = await apiClient.get('/api/admin/wilayas')
    return data
  },

  async createWilaya(wilaya: Omit<Wilaya, 'id' | 'created_at' | 'updated_at'>): Promise<Wilaya> {
    const { data } = await apiClient.post('/admin/wilayas', wilaya)
    return data
  },

  async updateWilaya(id: string, updates: Partial<Wilaya>): Promise<Wilaya> {
    const { data } = await apiClient.patch(`/admin/wilayas/${id}`, updates)
    return data
  },

  async toggleWilayaStatus(id: string, isActive: boolean): Promise<Wilaya> {
    return this.updateWilaya(id, { is_active: isActive })
  },
}

// =====================================================
// COMMUNES SERVICE
// =====================================================

export const communesService = {
  async getCommunes(): Promise<Commune[]> {
    const { data } = await apiClient.get('/api/admin/communes')
    return data
  },

  async getCommunesByWilaya(wilayaId: string): Promise<Commune[]> {
    const { data } = await apiClient.get(`/api/admin/communes?wilaya_id=${wilayaId}`)
    return data
  },

  async createCommune(commune: Omit<Commune, 'id' | 'created_at' | 'updated_at'>): Promise<Commune> {
    const { data } = await apiClient.post('/admin/communes', commune)
    return data
  },

  async updateCommune(id: string, updates: Partial<Commune>): Promise<Commune> {
    const { data } = await apiClient.patch(`/admin/communes/${id}`, updates)
    return data
  },

  async deleteCommune(id: string): Promise<void> {
    await apiClient.delete(`/admin/communes/${id}`)
  },
}

// =====================================================
// SPECIALTIES SERVICE
// =====================================================

export interface Specialty {
  id: string
  name_fr: string
  name_ar: string
  slug: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export const specialtiesService = {
  async getSpecialties(includeInactive = false): Promise<Specialty[]> {
    const { data } = await apiClient.get('/admin/specialties', {
      params: { includeInactive },
    })
    return data
  },

  async createSpecialty(specialty: Omit<Specialty, 'id' | 'created_at' | 'updated_at'>): Promise<Specialty> {
    const { data } = await apiClient.post('/admin/specialties', specialty)
    return data
  },

  async updateSpecialty(id: string, updates: Partial<Specialty>): Promise<Specialty> {
    const { data } = await apiClient.patch(`/admin/specialties/${id}`, updates)
    return data
  },

  async deleteSpecialty(id: string): Promise<void> {
    await apiClient.delete(`/admin/specialties/${id}`)
  },

  async toggleSpecialtyStatus(id: string, status: 'active' | 'inactive'): Promise<Specialty> {
    return this.updateSpecialty(id, { status })
  },
}

// =====================================================
// PLATFORM CONFIG SERVICE
// =====================================================

export interface PlatformConfig {
  id: string
  key: string
  value: unknown
  description?: string
  config_type: 'string' | 'boolean' | 'number' | 'json'
  created_at: string
  updated_at: string
}

export const platformConfigService = {
  async getPlatformConfig(): Promise<PlatformConfig[]> {
    const { data } = await apiClient.get('/admin/platform-config')
    return data
  },

  async getPlatformConfigByKey(key: string): Promise<PlatformConfig | null> {
    try {
      const { data } = await apiClient.get(`/admin/platform-config/${key}`)
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async updatePlatformConfig(
    key: string,
    value: unknown,
    configType: 'string' | 'boolean' | 'number' | 'json' = 'string'
  ): Promise<PlatformConfig> {
    const { data } = await apiClient.post('/admin/platform-config', {
      key,
      value,
      config_type: configType,
    })
    return data
  },

  async updateMultiplePlatformConfigs(
    configs: Array<{ key: string; value: unknown; config_type?: string }>
  ): Promise<PlatformConfig[]> {
    const { data } = await apiClient.post('/admin/platform-config/batch', { configs })
    return data
  },
}
