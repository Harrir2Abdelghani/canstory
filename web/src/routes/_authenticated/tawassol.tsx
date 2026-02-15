import { createFileRoute } from '@tanstack/react-router'
import { TawassolManagement } from '@/features/admin/tawassol'

export const Route = createFileRoute('/_authenticated/tawassol')({
  component: TawassolManagement,
})
