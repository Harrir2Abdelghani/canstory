import { createFileRoute } from '@tanstack/react-router'
import { I3lamManagement } from '@/features/admin/i3lam'

export const Route = createFileRoute('/_authenticated/i3lam')({
  component: I3lamManagement,
})
