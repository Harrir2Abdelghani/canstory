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
import { useSuspendUser, useActivateUser } from '@/hooks/use-admin-users'
import { useAdminUsersContext } from './admin-users-provider'

export function AdminUserSuspendDialog() {
  const { editingUser, setSuspendDialogOpen, suspendDialogOpen } = useAdminUsersContext()
  const { mutate: suspendUser, isPending: isSuspending } = useSuspendUser()
  const { mutate: activateUser, isPending: isActivating } = useActivateUser()
  const [isOpen, setIsOpen] = useState(suspendDialogOpen)

  if (!editingUser) return null

  const isActive = editingUser.is_active
  const isPending = isSuspending || isActivating

  const handleAction = () => {
    if (isActive) {
      suspendUser(editingUser.id, {
        onSuccess: () => {
          setSuspendDialogOpen(false)
          setIsOpen(false)
        },
      })
    } else {
      activateUser(editingUser.id, {
        onSuccess: () => {
          setSuspendDialogOpen(false)
          setIsOpen(false)
        },
      })
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isActive ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur'}</AlertDialogTitle>
          <AlertDialogDescription>
            {isActive ? (
              <>
                Êtes-vous sûr de vouloir désactiver <strong>{editingUser.full_name}</strong> ? Il ne
                pourra plus accéder à la plateforme.
              </>
            ) : (
              <>
                Êtes-vous sûr de vouloir activer <strong>{editingUser.full_name}</strong> ? Il aura
                accès à la plateforme.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div
          className={`rounded-lg p-3 text-sm ${
            isActive
              ? 'bg-orange-100/30 text-orange-900 dark:text-orange-200'
              : 'bg-green-100/30 text-green-900 dark:text-green-200'
          }`}
        >
          {isActive
            ? 'Cet utilisateur ne pourra plus accéder à la plateforme.'
            : 'Cet utilisateur aura accès à la plateforme.'}
        </div>
        <div className='flex gap-2'>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleAction} disabled={isPending}>
            {isPending ? 'Traitement...' : isActive ? 'Désactiver' : 'Activer'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
