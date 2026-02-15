import { createFileRoute } from '@tanstack/react-router'
import { CategoriesManagement } from '@/features/admin/categories'

export const Route = createFileRoute('/_authenticated/categories')({
  component: CategoriesManagement,
})
