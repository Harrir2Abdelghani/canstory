import { createFileRoute } from '@tanstack/react-router'
import { PsychologistsManagement } from '@/features/admin/psychologists'

export const Route = createFileRoute('/_authenticated/psychologists')({
  component: PsychologistsManagement,
})
