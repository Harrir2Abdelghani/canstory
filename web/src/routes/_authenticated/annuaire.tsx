import { createFileRoute } from '@tanstack/react-router'
import { AnnuaireManagement } from '@/features/admin/annuaire'

export const Route = createFileRoute('/_authenticated/annuaire')({
  component: AnnuaireManagement,
})
