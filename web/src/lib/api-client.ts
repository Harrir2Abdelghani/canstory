import axios, { AxiosInstance, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const getApiBaseUrl = () => {
  // Use VITE_API_URL or local dev URL during development
  if (import.meta.env.DEV) {
    const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001'
    return base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`
  }
  // In production, always use the relative /api proxy to ensure cookies/session are maintained on the same domain
  return '/api'
}

class ApiClient {
  public client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
      withCredentials: true,
    })

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().auth.reset()
        }
        return Promise.reject(error)
      }
    )
  }

  get instance() {
    return this.client
  }
}

export const apiClient = new ApiClient()
