import { createFileRoute } from '@tanstack/react-router'
import { UserDetail } from '@/features/admin/users/detail'

export const Route = createFileRoute('/_authenticated/users/$id')({
  component: () => <UserDetail />,
})
