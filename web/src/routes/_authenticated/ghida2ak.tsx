import { createFileRoute } from '@tanstack/react-router'
import { Ghida2akManagement } from '@/features/admin/ghida2ak'

export const Route = createFileRoute('/_authenticated/ghida2ak')({
  component: Ghida2akManagement,
})
