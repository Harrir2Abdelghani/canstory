import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  wilayasService,
  specialtiesService,
  platformConfigService,
  type Wilaya,
  type Specialty,
} from '@/services/platform-config'
import { toast } from 'sonner'

// =====================================================
// WILAYAS HOOKS
// =====================================================

const WILAYAS_QUERY_KEY = ['admin', 'wilayas']

export function useWilayas() {
  return useQuery({
    queryKey: WILAYAS_QUERY_KEY,
    queryFn: () => wilayasService.getWilayas(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateWilaya() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (wilaya: Omit<Wilaya, 'id' | 'created_at' | 'updated_at'>) =>
      wilayasService.createWilaya(wilaya),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WILAYAS_QUERY_KEY })
      toast.success('Wilaya créée avec succès')
    },
    onError: (error) => {
      console.error('Error creating wilaya:', error)
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          'Échec de la création de la wilaya'
        toast.error(message)
      } else {
        toast.error('Échec de la création de la wilaya')
      }
    },
  })
}

export function useUpdateWilaya() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Wilaya> }) =>
      wilayasService.updateWilaya(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WILAYAS_QUERY_KEY })
      toast.success('Wilaya mise à jour avec succès')
    },
    onError: (error) => {
      console.error('Error updating wilaya:', error)
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          'Échec de la mise à jour de la wilaya'
        toast.error(message)
      } else {
        toast.error('Échec de la mise à jour de la wilaya')
      }
    },
  })
}

export function useToggleWilayaStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      wilayasService.toggleWilayaStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WILAYAS_QUERY_KEY })
      toast.success('Statut de la wilaya mis à jour')
    },
    onError: (error) => {
      console.error('Error toggling wilaya status:', error)
      toast.error('Échec de la mise à jour du statut')
    },
  })
}

// =====================================================
// SPECIALTIES HOOKS
// =====================================================

const SPECIALTIES_QUERY_KEY = ['admin', 'specialties']

export function useSpecialties(includeInactive = false) {
  return useQuery({
    queryKey: [...SPECIALTIES_QUERY_KEY, { includeInactive }],
    queryFn: () => specialtiesService.getSpecialties(includeInactive),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (specialty: Omit<Specialty, 'id' | 'created_at' | 'updated_at'>) =>
      specialtiesService.createSpecialty(specialty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALTIES_QUERY_KEY })
      toast.success('Spécialité créée avec succès')
    },
    onError: (error) => {
      console.error('Error creating specialty:', error)
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          'Échec de la création de la spécialité'
        toast.error(message)
      } else {
        toast.error('Échec de la création de la spécialité')
      }
    },
  })
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Specialty> }) =>
      specialtiesService.updateSpecialty(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALTIES_QUERY_KEY })
      toast.success('Spécialité mise à jour avec succès')
    },
    onError: (error) => {
      console.error('Error updating specialty:', error)
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          'Échec de la mise à jour de la spécialité'
        toast.error(message)
      } else {
        toast.error('Échec de la mise à jour de la spécialité')
      }
    },
  })
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => specialtiesService.deleteSpecialty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALTIES_QUERY_KEY })
      toast.success('Spécialité supprimée avec succès')
    },
    onError: (error) => {
      console.error('Error deleting specialty:', error)
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          'Échec de la suppression de la spécialité'
        toast.error(message)
      } else {
        toast.error('Échec de la suppression de la spécialité')
      }
    },
  })
}

export function useToggleSpecialtyStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      specialtiesService.toggleSpecialtyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALTIES_QUERY_KEY })
      toast.success('Statut de la spécialité mis à jour')
    },
    onError: (error) => {
      console.error('Error toggling specialty status:', error)
      toast.error('Échec de la mise à jour du statut')
    },
  })
}

// =====================================================
// PLATFORM CONFIG HOOKS
// =====================================================

const PLATFORM_CONFIG_QUERY_KEY = ['admin', 'platform-config']

export function usePlatformConfig() {
  return useQuery({
    queryKey: PLATFORM_CONFIG_QUERY_KEY,
    queryFn: () => platformConfigService.getPlatformConfig(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePlatformConfigByKey(key: string) {
  return useQuery({
    queryKey: [...PLATFORM_CONFIG_QUERY_KEY, key],
    queryFn: () => platformConfigService.getPlatformConfigByKey(key),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdatePlatformConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      key,
      value,
      configType,
    }: {
      key: string
      value: unknown
      configType?: 'string' | 'boolean' | 'number' | 'json'
    }) => platformConfigService.updatePlatformConfig(key, value, configType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_CONFIG_QUERY_KEY })
      toast.success('Configuration mise à jour avec succès')
    },
    onError: (error) => {
      console.error('Error updating platform config:', error)
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          'Échec de la mise à jour de la configuration'
        toast.error(message)
      } else {
        toast.error('Échec de la mise à jour de la configuration')
      }
    },
  })
}

export function useUpdateMultiplePlatformConfigs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (configs: Array<{ key: string; value: unknown; config_type?: string }>) =>
      platformConfigService.updateMultiplePlatformConfigs(configs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLATFORM_CONFIG_QUERY_KEY })
      toast.success('Configurations mises à jour avec succès')
    },
    onError: (error) => {
      console.error('Error updating platform configs:', error)
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          'Échec de la mise à jour des configurations'
        toast.error(message)
      } else {
        toast.error('Échec de la mise à jour des configurations')
      }
    },
  })
}
