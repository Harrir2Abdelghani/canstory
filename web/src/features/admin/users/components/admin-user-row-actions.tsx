import { Trash2, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminUser } from '@/services/admin-users.service'
import { useAdminUsersContext } from './admin-users-provider'
import { useAuthStore } from '@/stores/auth-store'

interface AdminUserRowActionsProps {
  user: AdminUser
}

export function AdminUserRowActions({ user }: AdminUserRowActionsProps) {
  const { setEditingUser, setDeleteDialogOpen, setSuspendDialogOpen } =
    useAdminUsersContext()
  const { auth } = useAuthStore()
  const isSelf = auth.user?.accountNo === user.id
  const selfActionMessage = "Action indisponible pour votre propre compte"

  return (
    <div className='flex items-center gap-2'>
      

      {user.is_active ? (
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100/20'
          disabled={isSelf}
          onClick={(e) => {
            e.stopPropagation()
            if (isSelf) return
            setSuspendDialogOpen(true)
            setEditingUser(user)
          }}
          title={isSelf ? selfActionMessage : 'Désactiver'}
        >
          <Power className='h-4 w-4' />
        </Button>
      ) : (
        <Button
          variant='ghost'
          size='sm'
          className='h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100/20'
          disabled={isSelf}
          onClick={(e) => {
            e.stopPropagation()
            if (isSelf) return
            setSuspendDialogOpen(true)
            setEditingUser(user)
          }}
          title={isSelf ? selfActionMessage : 'Activer'}
        >
          <Power className='h-4 w-4' />
        </Button>
      )}
 
       <Button
         variant='ghost'
         size='sm'
         className='h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10'
         disabled={isSelf}
         onClick={(e) => {
           e.stopPropagation()
           if (isSelf) return
           setDeleteDialogOpen(true)
           setEditingUser(user)
         }}
         title={isSelf ? selfActionMessage : 'Supprimer'}
       >
         <Trash2 className='h-4 w-4' />
       </Button>
    </div>
  )
}
