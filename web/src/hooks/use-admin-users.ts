import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  adminUsersService,
  type GetUsersParams,
  type CreateAdminUserPayload,
  type UpdateAdminUserPayload,
} from '@/services/admin-users.service'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

const USERS_QUERY_KEY = ['admin', 'users']

export function useAdminUsers(params: GetUsersParams = {}) {
  const user = useAuthStore((state) => state.auth.user)

  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: () => adminUsersService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: Boolean(user),
  })
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateAdminUserPayload }) =>
      adminUsersService.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('Utilisateur mis à jour avec succès')
    },
    onError: (error) => {
      console.error('Error updating user:', error)
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          'Échec de la mise à jour de l’utilisateur'
        toast.error(message)
      } else {
        toast.error('Échec de la mise à jour de l’utilisateur')
      }
    },
  })
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, userId],
    queryFn: () => adminUsersService.getUserById(userId),
    enabled: !!userId,
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminUsersService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('User role updated successfully')
    },
    onError: (error) => {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    },
  })
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, is_active }: { userId: string; is_active: boolean }) =>
      adminUsersService.updateUserStatus(userId, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('User status updated successfully')
    },
    onError: (error) => {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    },
  })
}

export function useSuspendUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => adminUsersService.suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('User suspended successfully')
    },
    onError: (error) => {
      console.error('Error suspending user:', error)
      toast.error('Failed to suspend user')
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => adminUsersService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('User activated successfully')
    },
    onError: (error) => {
      console.error('Error activating user:', error)
      toast.error('Failed to activate user')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => adminUsersService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    },
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, 'stats'],
    queryFn: () => adminUsersService.getUserStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => adminUsersService.createUser(payload),
    onSuccess: ({ tempPassword }) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success(
        tempPassword
          ? `Utilisateur créé. Mot de passe temporaire : ${tempPassword}`
          : 'Utilisateur créé avec succès'
      )
    },
    onError: (error) => {
      console.error('Error creating user:', error)
      if (error instanceof AxiosError) {
        const message =
          (error.response?.data as { error?: string })?.error ||
          error.message ||
          "Échec de la création de l'utilisateur"
        toast.error(message)
      } else {
        toast.error("Échec de la création de l'utilisateur")
      }
    },
  })
}
