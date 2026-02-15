import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService, AdminUser } from '@/services/admin'
import { toast } from 'sonner'

export function useCurrentAdmin() {
  return useQuery({
    queryKey: ['currentAdmin'],
    queryFn: () => adminService.getCurrentAdmin(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AdminUser> }) =>
      adminService.updateAdminProfile(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['currentAdmin'], data)
      toast.success('Profil mis à jour avec succès')
    },
    onError: (error: any) => {
      console.error('Error updating admin profile:', error)
      toast.error(error.message || 'Erreur lors de la mise à jour du profil')
    },
  })
}

export function useUpdateAdminPassword() {
  return useMutation({
    mutationFn: (newPassword: string) =>
      adminService.updateAdminPassword(newPassword),
    onSuccess: () => {
      toast.success('Mot de passe changé avec succès')
    },
    onError: (error: any) => {
      console.error('Error updating password:', error)
      toast.error(error.message || 'Erreur lors du changement de mot de passe')
    },
  })
}

export function useDeleteAdminAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => adminService.deleteAdminAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAdmin'] })
      toast.success('Compte supprimé avec succès')
    },
    onError: (error: any) => {
      console.error('Error deleting account:', error)
      toast.error(error.message || 'Erreur lors de la suppression du compte')
    },
  })
}
