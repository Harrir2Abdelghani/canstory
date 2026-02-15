import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { AdminUser } from '@/services/admin-users.service'
import { AdminUserRowActions } from './admin-user-row-actions'

interface AdminUsersTableProps {
  data: AdminUser[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  isLoading?: boolean
}

const statusColors = {
  active: 'bg-green-100/30 text-green-900 dark:text-green-200 border-green-200',
  inactive: 'bg-gray-100/30 text-gray-900 dark:text-gray-200 border-gray-200',
}

const translations = {
  name: 'Nom',
  email: 'Email',
  role: 'Rôle',
  status: 'Statut',
  joined: 'Inscrit le',
  actions: 'Actions',
  active: 'Actif',
  inactive: 'Inactif',
  loading: 'Chargement…',
  empty: 'Aucun utilisateur trouvé',
  showing: 'Affichage de',
  to: 'à',
  of: 'sur',
  users: 'utilisateurs',
  previous: 'Précédent',
  next: 'Suivant',
}

const roleColors = {
  superadmin: 'bg-purple-100/30 text-purple-900 dark:text-purple-200',
  admin: 'bg-blue-100/30 text-blue-900 dark:text-blue-200',
  doctor: 'bg-green-100/30 text-green-900 dark:text-green-200',
  pharmacy: 'bg-orange-100/30 text-orange-900 dark:text-orange-200',
  patient: 'bg-cyan-100/30 text-cyan-900 dark:text-cyan-200',
  association: 'bg-pink-100/30 text-pink-900 dark:text-pink-200',
}

export function AdminUsersTable({
  data,
  total,
  page,
  pageSize,
  onPageChange,
  isLoading,
}: AdminUsersTableProps) {
  const navigate = useNavigate()

  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: translations.name,
        cell: ({ row }) => {
          const user = row.original
          const initials = user.full_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()

          return (
            <button
              onClick={() => navigate({ to: `/users/${user.id}` })}
              className='flex items-center gap-3 hover:opacity-75 transition-opacity'
            >
              <Avatar className='h-8 w-8'>
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className='text-left'>
                <p className='font-medium'>{user.full_name}</p>
                <p className='text-sm text-muted-foreground'>{user.email}</p>
              </div>
            </button>
          )
        },
      },
      {
        accessorKey: 'role',
        header: translations.role,
        cell: ({ row }) => {
          const role = row.original.role
          const color = roleColors[role as keyof typeof roleColors] || roleColors.patient
          return (
            <Badge variant='outline' className={cn('capitalize', color)}>
              {role}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'is_active',
        header: translations.status,
        cell: ({ row }) => {
          const isActive = row.original.is_active
          const color = isActive
            ? statusColors.active
            : statusColors.inactive
          return (
            <Badge variant='outline' className={cn('capitalize', color)}>
              {isActive ? translations.active : translations.inactive}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'created_at',
        header: translations.joined,
        cell: ({ row }) => {
          const date = new Date(row.original.created_at)
          return <span>{date.toLocaleDateString('fr-FR')}</span>
        },
      },
      {
        id: 'actions',
        header: translations.actions,
        cell: ({ row }) => <AdminUserRowActions user={row.original} />,
      },
    ],
    [navigate]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  {translations.loading}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  {translations.empty}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          {translations.showing}{' '}
          {total === 0 ? 0 : (page - 1) * pageSize + 1}{' '}
          {translations.to}{' '}
          {Math.min(page * pageSize, total)}{' '}
          {translations.of}{' '}
          {total}{' '}
          {translations.users}
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            {translations.previous}
          </Button>
          <div className='flex items-center gap-2'>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, page - 2) + i
              if (pageNum > totalPages) return null
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            {translations.next}
          </Button>
        </div>
      </div>
    </div>
  )
}
