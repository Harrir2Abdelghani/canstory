import { createFileRoute } from '@tanstack/react-router'
import { Nassa2ihManagement } from '@/features/admin/nassa2ih'

export const Route = createFileRoute('/_authenticated/nassa2ih')({
  component: Nassa2ihManagement,
})
