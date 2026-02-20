import { createContext, useContext, useState } from 'react'
import { AdminUser } from '@/services/admin-users.service'

interface AdminUsersContextType {
  editingUser: AdminUser | null
  setEditingUser: (user: AdminUser | null) => void
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  suspendDialogOpen: boolean
  setSuspendDialogOpen: (open: boolean) => void
  editDialogOpen: boolean
  setEditDialogOpen: (open: boolean) => void
  createDialogOpen: boolean
  setCreateDialogOpen: (open: boolean) => void
  detailDialogOpen: boolean
  setDetailDialogOpen: (open: boolean) => void
}

const AdminUsersContext = createContext<AdminUsersContextType | undefined>(undefined)

export function AdminUsersProvider({ children }: { children: React.ReactNode }) {
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  return (
    <AdminUsersContext.Provider
      value={{
        editingUser,
        setEditingUser,
        deleteDialogOpen,
        setDeleteDialogOpen,
        suspendDialogOpen,
        setSuspendDialogOpen,
        editDialogOpen,
        setEditDialogOpen,
        createDialogOpen,
        setCreateDialogOpen,
        detailDialogOpen,
        setDetailDialogOpen,
      }}
    >
      {children}
    </AdminUsersContext.Provider>
  )
}

export function useAdminUsersContext() {
  const context = useContext(AdminUsersContext)
  if (!context) {
    throw new Error('useAdminUsersContext must be used within AdminUsersProvider')
  }
  return context
}
