import { createFileRoute } from '@tanstack/react-router'
import { TermsPage } from '@/features/landing/pages/terms-page'

export const Route = createFileRoute('/terms')({
  component: TermsPage,
})
