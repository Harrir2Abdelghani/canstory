import { createFileRoute } from '@tanstack/react-router'
import { AdvertisingManagement } from '@/features/admin/advertising'

export const Route = createFileRoute('/_authenticated/advertising')({
  component: AdvertisingManagement,
})
