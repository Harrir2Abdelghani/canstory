import axios, { AxiosInstance, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const getApiBaseUrl = () => {
  const base = import.meta.env.VITE_API_URL || ''
  if (base && base.startsWith('http')) return base
  return typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api'
}

class ApiClient {
  private client: AxiosInstance

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
