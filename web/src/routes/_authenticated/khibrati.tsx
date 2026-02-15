import { createFileRoute } from '@tanstack/react-router'
import { KhibratiManagement } from '@/features/admin/khibrati'

export const Route = createFileRoute('/_authenticated/khibrati')({
  component: KhibratiManagement,
})
