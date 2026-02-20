import { useAdminUsersContext } from './admin-users-provider'
import { AdminUserDeleteDialog } from './admin-user-delete-dialog'
import { AdminUserSuspendDialog } from './admin-user-suspend-dialog'
import { AdminUserEditDialog } from './admin-user-edit-dialog'
import { AdminUserCreateDialog } from './admin-user-create-dialog'
import { AdminUserDetailDialog } from './admin-user-detail-dialog'

export function AdminUsersDialogs() {
  const {
    deleteDialogOpen,
    suspendDialogOpen,
    editDialogOpen,
    createDialogOpen,
    detailDialogOpen,
  } = useAdminUsersContext()

  return (
    <>
      {deleteDialogOpen && <AdminUserDeleteDialog />}
      {suspendDialogOpen && <AdminUserSuspendDialog />}
      {editDialogOpen && <AdminUserEditDialog />}
      {createDialogOpen && <AdminUserCreateDialog />}
      {detailDialogOpen && <AdminUserDetailDialog />}
    </>
  )
}
