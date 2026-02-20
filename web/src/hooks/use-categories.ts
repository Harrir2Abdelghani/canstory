import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService, Category } from '@/services/categories'
import { toast } from 'sonner'

export function useSpecialties() {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: () => categoriesService.getSpecialties(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateSpecialty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (specialty: Omit<Category, 'id' | 'created_at' | 'updated_at'>) =>
      categoriesService.createSpecialty(specialty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      toast.success('Spécialité ajoutée avec succès')
    },
    onError: (error: any) => {
      console.error('Error creating specialty:', error)
      toast.error(error?.message || 'Erreur lors de l\'ajout de la spécialité')
    },
  })
}

export function useUpdateSpecialty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, specialty }: { id: string; specialty: Partial<Category> }) =>
      categoriesService.updateSpecialty(id, specialty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      toast.success('Spécialité mise à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })
}

export function useDeleteSpecialty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesService.deleteSpecialty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      toast.success('Spécialité supprimée')
    },
    onError: (error: any) => {
      console.error('Error deleting specialty:', error)
      toast.error(error?.message || 'Erreur lors de la suppression')
    },
  })
}

export function useToggleSpecialtyStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      categoriesService.toggleSpecialtyStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties'] })
      toast.success('Statut mis à jour')
    },
    onError: (error: any) => {
      console.error('Error toggling specialty status:', error)
      toast.error(error?.message || 'Erreur lors de la mise à jour du statut')
    },
  })
}

export function useArticleCategories() {
  return useQuery({
    queryKey: ['article-categories'],
    queryFn: () => categoriesService.getArticleCategories(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateArticleCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) =>
      categoriesService.createArticleCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-categories'] })
      toast.success('Catégorie ajoutée avec succès')
    },
    onError: (error: any) => {
      console.error('Error creating article category:', error)
      toast.error(error?.message || 'Erreur lors de l\'ajout de la catégorie')
    },
  })
}

export function useUpdateArticleCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: Partial<Category> }) =>
      categoriesService.updateArticleCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-categories'] })
      toast.success('Catégorie mise à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })
}

export function useDeleteArticleCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesService.deleteArticleCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-categories'] })
      toast.success('Catégorie supprimée')
    },
    onError: (error: any) => {
      console.error('Error deleting article category:', error)
      toast.error(error?.message || 'Erreur lors de la suppression')
    },
  })
}

export function useToggleArticleCategoryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      categoriesService.toggleArticleCategoryStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article-categories'] })
      toast.success('Statut mis à jour')
    },
    onError: (error: any) => {
      console.error('Error toggling article category status:', error)
      toast.error(error?.message || 'Erreur lors de la mise à jour du statut')
    },
  })
}

export function useGuideCategories() {
  return useQuery({
    queryKey: ['guide-categories'],
    queryFn: () => categoriesService.getGuideCategories(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateGuideCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) =>
      categoriesService.createGuideCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-categories'] })
      toast.success('Catégorie ajoutée avec succès')
    },
    onError: (error: any) => {
      console.error('Error creating guide category:', error)
      toast.error(error?.message || 'Erreur lors de l\'ajout de la catégorie')
    },
  })
}

export function useUpdateGuideCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: Partial<Category> }) =>
      categoriesService.updateGuideCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-categories'] })
      toast.success('Catégorie mise à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })
}

export function useDeleteGuideCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesService.deleteGuideCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-categories'] })
      toast.success('Catégorie supprimée')
    },
    onError: (error: any) => {
      console.error('Error deleting guide category:', error)
      toast.error(error?.message || 'Erreur lors de la suppression')
    },
  })
}

export function useToggleGuideCategoryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      categoriesService.toggleGuideCategoryStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guide-categories'] })
      toast.success('Statut mis à jour')
    },
    onError: (error: any) => {
      console.error('Error toggling guide category status:', error)
      toast.error(error?.message || 'Erreur lors de la mise à jour du statut')
    },
  })
}

export function useNutritionCategories() {
  return useQuery({
    queryKey: ['nutrition-categories'],
    queryFn: () => categoriesService.getNutritionCategories(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateNutritionCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) =>
      categoriesService.createNutritionCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-categories'] })
      toast.success('Catégorie ajoutée avec succès')
    },
    onError: (error: any) => {
      console.error('Error creating nutrition category:', error)
      toast.error(error?.message || 'Erreur lors de l\'ajout de la catégorie')
    },
  })
}

export function useUpdateNutritionCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: Partial<Category> }) =>
      categoriesService.updateNutritionCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-categories'] })
      toast.success('Catégorie mise à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })
}

export function useDeleteNutritionCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => categoriesService.deleteNutritionCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-categories'] })
      toast.success('Catégorie supprimée')
    },
    onError: (error: any) => {
      console.error('Error deleting nutrition category:', error)
      toast.error(error?.message || 'Erreur lors de la suppression')
    },
  })
}

export function useToggleNutritionCategoryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      categoriesService.toggleNutritionCategoryStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-categories'] })
      toast.success('Statut mis à jour')
    },
    onError: (error: any) => {
      console.error('Error toggling nutrition category status:', error)
      toast.error(error?.message || 'Erreur lors de la mise à jour du statut')
    },
  })
}
