import { createFileRoute } from '@tanstack/react-router'
import { CancerTypesPage } from '@/features/landing/pages/cancer-types-page'

export const Route = createFileRoute('/cancer-types')({
  component: CancerTypesPage,
})
