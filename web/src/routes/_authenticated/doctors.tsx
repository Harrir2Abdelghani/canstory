import { createFileRoute } from '@tanstack/react-router'
import { DoctorsManagement } from '@/features/admin/doctors'

export const Route = createFileRoute('/_authenticated/doctors')({
  component: DoctorsManagement,
})
