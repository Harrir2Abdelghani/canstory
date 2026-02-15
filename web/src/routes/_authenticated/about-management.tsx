import { createFileRoute } from '@tanstack/react-router'
import { AboutManagement } from '@/features/admin/about'

export const Route = createFileRoute('/_authenticated/about-management')({
  component: AboutManagement,
})
