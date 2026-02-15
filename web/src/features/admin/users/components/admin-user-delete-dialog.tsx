import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteUser } from '@/hooks/use-admin-users'
import { useAdminUsersContext } from './admin-users-provider'

export function AdminUserDeleteDialog() {
  const { editingUser, setDeleteDialogOpen, deleteDialogOpen } = useAdminUsersContext()
  const { mutate: deleteUser, isPending } = useDeleteUser()
  const [isOpen, setIsOpen] = useState(deleteDialogOpen)

  if (!editingUser) return null

  const handleDelete = () => {
    deleteUser(editingUser.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        setIsOpen(false)
      },
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer <strong>{editingUser.full_name}</strong> ? Cette action
            ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>
          Cela supprimera définitivement le compte utilisateur et toutes les données associées.
        </div>
        <div className='flex gap-2'>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className='bg-destructive'>
            {isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
