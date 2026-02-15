import { useEffect, useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { TopNav } from '@/components/layout/top-nav'
import { Search as SearchBar } from '@/components/search'
import { useAdminUsers } from '@/hooks/use-admin-users'
import { AdminUsersTable, AdminUsersProvider, AdminUsersDialogs } from './components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, RotateCcw } from 'lucide-react'
import { useAdminUsersContext } from './components/admin-users-provider'

const route = getRouteApi('/_authenticated/users/')

export function AdminUsers() {
  return (
    <AdminUsersProvider>
      <AdminUsersContent />
    </AdminUsersProvider>
  )
}

function AdminUsersContent() {
  const search = route.useSearch()
  const [tablePage, setTablePage] = useState(search.page || 1)
  const [tablePageSize, setTablePageSize] = useState(search.pageSize || 10)
  const [searchTerm, setSearchTerm] = useState(search.username || '')
  const [roleFilter, setRoleFilter] = useState<string>(
    Array.isArray(search.role) ? search.role[0] || 'all' : search.role || 'all'
  )
  const [statusFilter, setStatusFilter] = useState<string>(
    Array.isArray(search.status) ? search.status[0] || 'all' : search.status || 'all'
  )

  const fetchParams = useMemo(() => ({ page: 1, pageSize: 500 }), [])

  const { data: usersData, isLoading, error, refetch } = useAdminUsers(fetchParams)

  useEffect(() => {
    refetch()
  }, [refetch])

  const roleOptions = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'superadmin', label: 'Super administrateur' },
    { value: 'doctor', label: 'Médecin' },
    { value: 'pharmacy', label: 'Pharmacie' },
    { value: 'association', label: 'Association' },
    { value: 'cancer_center', label: 'Centre de cancer' },
    { value: 'laboratory', label: 'Laboratoire' },
    { value: 'patient', label: 'Patient' },
  ]

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
  ]

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setTablePage(1)
  }

  const handleRoleChange = (value: string) => {
    setRoleFilter(value)
    setTablePage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setTablePage(1)
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setStatusFilter('all')
    setTablePage(1)
  }

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return (usersData?.data ?? []).filter((user) => {
      const matchesSearch = normalizedSearch
        ? user.full_name.toLowerCase().includes(normalizedSearch) ||
          user.email.toLowerCase().includes(normalizedSearch)
        : true
      const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter
      const isActive = Boolean(user.is_active)
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? isActive
            : !isActive
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [usersData?.data, searchTerm, roleFilter, statusFilter])

  const totalFiltered = filteredUsers.length
  const paginatedUsers = useMemo(() => {
    const start = (tablePage - 1) * tablePageSize
    return filteredUsers.slice(start, start + tablePageSize)
  }, [filteredUsers, tablePage, tablePageSize])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalFiltered / tablePageSize))
    if (tablePage > totalPages) {
      setTablePage(totalPages)
    }
  }, [totalFiltered, tablePage, tablePageSize])

  const topNav = [
    { title: 'Aperçu', href: '/overview', isActive: false, disabled: false },
    { title: 'Utilisateurs', href: '/users', isActive: true, disabled: false },
    { title: 'Contenu', href: '/i3lam', isActive: false, disabled: false },
    { title: 'Paramètres', href: '/platform-config', isActive: false, disabled: false },
  ]

  const { setCreateDialogOpen } = useAdminUsersContext()

  const handleAddUser = () => {
    setCreateDialogOpen(true)
  }

  return (
    <>
      <Header className='gap-4'>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <SearchBar />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestion des utilisateurs</h2>
            <p className='text-muted-foreground'>
              Gérez les utilisateurs de la plateforme, les rôles et les permissions.
            </p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className='mr-2 h-4 w-4' />
            Ajouter un utilisateur
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-4 lg:grid-cols-5'>
          <div className='space-y-2 md:col-span-2'>
            <Label htmlFor='user-search'>Recherche</Label>
            <Input
              id='user-search'
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder='Rechercher par nom ou email'
            />
          </div>
          <div className='space-y-2'>
            <Label>Rôle</Label>
            <Select value={roleFilter} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder='Tous les rôles' />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Statut</Label>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder='Tous les statuts' />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label className='opacity-0'>Réinitialiser</Label>
            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={handleResetFilters}
            >
              <RotateCcw className='mr-2 h-4 w-4' /> Réinitialiser
            </Button>
          </div>
        </div>

        {error && (
          <div className='rounded-lg bg-destructive/10 p-4 text-destructive'>
            Échec du chargement des utilisateurs. Veuillez réessayer.
          </div>
        )}

        {usersData && (
          <AdminUsersTable
            data={paginatedUsers}
            total={totalFiltered}
            page={tablePage}
            pageSize={tablePageSize}
            onPageChange={setTablePage}
            onPageSizeChange={setTablePageSize}
            isLoading={isLoading}
          />
        )}
      </Main>

      <AdminUsersDialogs />
    </>
  )
}
