import { createFileRoute } from '@tanstack/react-router'
import { AccommodationsManagement } from '@/features/admin/accommodations'
// import { AccommodationsManagement } from '@/features/admin/accommodations/test-simple'

export const Route = createFileRoute('/_authenticated/accommodations')({
  component: AccommodationsManagement,
})
